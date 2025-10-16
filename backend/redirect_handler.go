package backend

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"cloud.google.com/go/firestore"
	"go.nownabe.dev/clog"
	"go.nownabe.dev/clog/errors"
)

type redirectHandler struct {
	consolePrefix string
	repo          *repository
}

func newRedirectHandler(repo *repository, consolePrefix string) *redirectHandler {
	return &redirectHandler{
		consolePrefix: consolePrefix,
		repo:          repo,
	}
}

func (h *redirectHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	path := strings.Split(strings.TrimLeft(r.URL.Path, "/"), "/")

	if path[0] == "" {
		http.Redirect(w, r, h.consolePrefix, http.StatusMovedPermanently)
		return
	}

	golink, err := h.repo.Get(ctx, path[0])
	if err != nil {
		if errors.Is(err, errDocumentNotFound) {
			http.Redirect(w, r, fmt.Sprintf("%s%s", h.consolePrefix, path[0]), http.StatusTemporaryRedirect)
			return
		}

		err := errors.Errorf("failed to get url for %q: %w", path[0], err)
		clog.Err(ctx, err)

		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	u, err := url.Parse(golink.URL)
	if err != nil {
		err := errors.Errorf("failed to parse url (id=%q): %q: %w", path[0], golink.URL, err)
		clog.Err(ctx, err)

		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	// Build the final URL with path segments
	finalURL := golink.URL

	// Check if URL contains placeholder patterns like {{1}}, {{2}}, etc.
	hasPlaceholders := strings.Contains(finalURL, "{{")

	if hasPlaceholders {
		// Replace placeholders with path segments
		for i := 1; i < len(path); i++ {
			placeholder := fmt.Sprintf("{{%d}}", i)
			finalURL = strings.ReplaceAll(finalURL, placeholder, url.QueryEscape(path[i]))
		}
	} else if len(path) > 1 {
		// Legacy behavior: append path segments
		u.Path = fmt.Sprintf("%s/%s", u.Path, strings.Join(path[1:], "/"))
		finalURL = u.String()
	}

	http.Redirect(w, r, finalURL, http.StatusTemporaryRedirect)

	go h.count(context.Background(), golink.Name)
}

func (h *redirectHandler) count(ctx context.Context, name string) {
	err := h.repo.Transaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		o, err := h.repo.TxGet(ctx, tx, name)
		if err != nil {
			return errors.Errorf("failed to get %q: %w", name, err)
		}

		today := time.Now().UTC().Truncate(24 * time.Hour)
		daysDelayed := int(today.Sub(o.RedirectCountCalculatedDate).Hours() / 24)
		updateRedirectCount(o, daysDelayed)

		if err := h.repo.TxUpdate(ctx, tx, o); err != nil {
			return errors.Errorf("failed to update %q: %w", name, err)
		}

		return nil
	})
	if err != nil {
		err := errors.Errorf("failed to count of %q: %w", name, err)
		clog.Err(ctx, err)
	}
}

func updateRedirectCount(o *dto, daysDelayed int) {
	if daysDelayed >= 28 {
		o.RedirectCount28Days = 1
		o.RedirectCount7Days = 1
		o.DailyRedirectCounts = [28]int64{1}
		return
	}

	if daysDelayed > 0 {
		counts := o.DailyRedirectCounts[:]
		for i := 0; i < daysDelayed; i++ {
			counts = append([]int64{0}, counts...)
			o.RedirectCount28Days -= counts[28]
			o.RedirectCount7Days -= counts[7]
		}
		copy(o.DailyRedirectCounts[:], counts)
	}

	o.RedirectCount28Days++
	o.RedirectCount7Days++
	o.DailyRedirectCounts[0]++
}
