# BKM Kaplanlar Website Development

## Project overview

BKM Kaplanlar is a Turkish-language, multi-page student team website. The frontend uses HTML, CSS, and vanilla JavaScript; the backend uses Go and Gin to serve pages and assets on port `3000`.

## Pages and assets

- `web/index.html` — homepage
- `web/projects.html` — project directory
- `web/project-*.html` — individual TÜBİTAK, TEKNOFEST, LEGO SPIKE, LEGO VEX, and coding pages
- `web/members.html`, `web/events.html`, `web/support.html`, `web/contact.html` — team and utility pages
- `web/style.css`, `web/script.js` — shared styles and interactions
- `web/support.css`, `web/support.js` — support-page styles and interactions
- `web/project-detail.css` — shared project detail-page styles
- `web/admin.html`, `web/admin.css`, `web/admin.js` — Turkish admin dashboard and interface
- `backend/main.go` — Gin routes and static asset serving
- `backend/admin.go` — password-based admin sessions and in-memory page statistics

Keep visible website copy in Turkish, preserve responsive and accessible behavior, and respect reduced-motion preferences when adding animations.

## Development

```bash
cd backend
go run .
```

Open `http://localhost:3000`. Run `go test ./...` from `backend/` to verify the Go server.

Set `ADMIN_PASSWORD` to enable dashboard login. For local HTTP development, set `ADMIN_COOKIE_SECURE=false`; keep secure cookies enabled on HTTPS deployments.

The contact form is not connected to message delivery. Member profiles and photos are examples and should be replaced with approved team information before production use.
