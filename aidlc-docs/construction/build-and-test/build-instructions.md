# Build Instructions — Phase 10 Web Application

## Prerequisites
- **Runtime**: Any modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Dev Server** (optional): Node.js 16+ (for local development server)
- **No build step required**: Application uses native ES modules — no bundler/compiler needed

## System Requirements
- OS: Any (Windows, macOS, Linux)
- Disk Space: < 5MB
- Network: Required only for online multiplayer (PeerJS CDN)

---

## Build Steps

### 1. Install Dev Dependencies (Optional — for local server only)
```bash
npm install
```
This installs no production dependencies — only used for `http-server` dev tooling.

### 2. Serve the Application
```bash
# Option A: Using npm script (requires Node.js)
npm run dev
# Serves at http://localhost:3000

# Option B: Using any static server
python -m http.server 3000
# or
npx serve .
# or simply open index.html directly in a browser (some features may need a server due to ES module CORS)
```

### 3. Verify Build Success
- **Expected Output**: Browser shows Phase 10 main menu with "Play vs AI", "Host Online Game", "Join Online Game" buttons
- **Console**: Should log "Phase 10 initialized" with no errors
- **No build artifacts**: This is a zero-build application (native ES modules)

## Deployment

### Static Hosting Deployment
```bash
# Deploy all files in project root:
# - index.html
# - src/ (entire directory)
# No build/dist step needed

# For GitHub Pages:
# Push to main branch, enable Pages from root

# For Netlify/Vercel:
# Set publish directory to: . (root)
# No build command needed
```

### Files Required for Deployment
```
index.html
src/
├── main.js
├── types.js
├── game-engine/ (5 files + index.js)
├── storage/ (4 files + index.js)
├── ai/ (4 files)
├── networking/ (3 files)
├── ui/ (9 files)
├── controller/ (3 files)
└── styles/ (2 files)
```

## Troubleshooting

### Module Loading Errors (CORS)
- **Cause**: Opening `index.html` directly via `file://` protocol blocks ES module imports
- **Solution**: Use a local HTTP server (`npm run dev` or `python -m http.server`)

### PeerJS Not Loading (Online Multiplayer)
- **Cause**: CDN blocked or network unavailable
- **Solution**: PeerJS loads dynamically from unpkg.com CDN. Ensure internet access. The AI game mode works fully offline.
