# Frontdoor — UI

Browser-only editor interface.

## Structure

- `index.html` — page shell and asset entry points
- `styles/app.css` — all editor and panel styles
- `scripts/app.js` — UI components, editor state, timeline interactions, and demo export behavior

The current JavaScript stays framework-free and can be split into ES modules as the component boundaries settle. No Tauri or Rust APIs are called yet.
