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

# Build both extensions and copy to backend for distribution
npm run build:firefox && npm run build:release
```

This builds both Chrome (`extension.zip`) and Firefox (`extension-firefox.zip`) versions and copies them to `backend/console/extension/` where they're served at `/setup`.

#### Backend Changes

Just edit the Go files in `backend/`. No build step needed - Go compiles on deploy.

### Deploying

After making changes to any component:

```shell
# Build console (if changed)
cd console && npm run build

# Build extensions (if changed)
cd extension && npm run build:firefox && npm run build:release

# Deploy everything
cd backend && gcloud app deploy --quiet
```

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