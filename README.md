# Stainless Golink

Internal URL shortener at https://go.stainless.com

## For Users

Visit **https://go.stainless.com/setup** to download and install the browser extension (Chrome recommended).

## For Developers

### Making Changes

The project has three main components:

1. **Backend** (`backend/`) - Go server deployed on App Engine
2. **Console** (`console/`) - React web UI
3. **Extension** (`extension/`) - Chrome/Firefox browser extensions

### Development Workflow

#### Console Changes

```shell
cd console
npm run build
```

This builds the console and outputs to `backend/console/`.

#### Extension Changes

```shell
cd extension

# Build Chrome extension
npm run build:release

# Build Firefox extension (creates unsigned zip)
npm run build:firefox
```

**Firefox Extension Signing:**

Firefox requires extensions to be signed. After building:

1. Build the Firefox extension: `npm run build:firefox` (creates `extension-firefox.zip`)
2. Sign it using one of these methods:
   - **AMO (Recommended)**: Upload to [addons.mozilla.org](https://addons.mozilla.org/developers/) and download the signed `.xpi`
   - **web-ext sign**: Use `web-ext sign --api-key=<key> --api-secret=<secret>` (requires [API credentials](https://addons.mozilla.org/developers/addon/api/key/))
3. Copy the signed `.xpi` to `backend/console/extension/firefox/extension.xpi`

The Chrome extension is automatically copied to `backend/console/extension/chrome/extension.zip` by the build script.

#### Backend Changes

Just edit the Go files in `backend/`. No build step needed - Go compiles on deploy.

### Deploying

After making changes to any component:

```shell
# Build console (if changed)
cd console && npm run build

# Build extensions (if changed)
cd extension
npm run build:release  # Chrome
npm run build:firefox  # Firefox (then sign and copy .xpi to backend/console/extension/firefox/)

# Deploy everything
cd backend && gcloud app deploy --quiet
```

**Note:** Remember to sign the Firefox extension and manually copy the signed `.xpi` file to `backend/console/extension/firefox/extension.xpi` before deploying.

The deploy uploads:
- Compiled Go backend
- Built console assets
- Extension files for self-hosted distribution

### Project Structure

- `backend/` - Go backend with App Engine config
  - `console/` - Built console assets (generated, not edited directly)
  - `app.go` - Main application setup
  - `redirect_handler.go` - Handles go/* redirects
- `console/` - React app source
  - `src/pages/` - Page components
  - `src/router.tsx` - Route configuration
- `extension/` - Browser extension source
  - `src/` - TypeScript source
  - `manifest.json` / `manifest.firefox.json` - Extension configs

### Useful Commands

```shell
# Deploy backend
cd backend && gcloud app deploy --quiet

# View logs
gcloud app logs tail

# Check deployment status
gcloud app versions list
```

### Extension Distribution

Extensions are self-hosted at `/setup`. When you deploy, users can download updated versions immediately from https://go.stainless.com/setup - no browser store approval needed.