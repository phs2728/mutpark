# MCP Playwright Server (Local)

This is a minimal Model Context Protocol server exposing Playwright tools.

Tools:
- `goto({ url })` – navigate to a URL
- `screenshot({ path, fullPage? })` – capture a screenshot
- `close()` – close the browser

## Setup

```bash
cd mcp/playwright
npm install
npm run playwright:install
```

## Run (dev)
```bash
npm run dev
```

## Build & Run
```bash
npm run build
npm start
```

You can wire this server into an MCP-compatible client over stdio.