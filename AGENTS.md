# AGENTS.md - BKM Tigers Website Development

## Project Overview

**BKM Tigers** is a student organization's official website built as a modern single-page application. The project uses Go for backend API serving and vanilla JavaScript/CSS for frontend rendering.

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                  BKM Tigers Website                  │
├─────────────────────────────────────────────────────┤
│  Frontend (web/)          │   Backend (backend/)    │
│  ┌─────────────────────┐  │  ┌───────────────────┐  │
│  │ index.html          │  │  │ main.go (Gin)     │  │
│  │ script.js           │  │  │ :8080 static serve│  │
│  │ style.css           │  │  │ Go 1.27+ runtime   │  │
│  └─────────────────────┘  │  └───────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Development Workflow

### 1. Backend Development (Go)

**Primary Commands:**

```bash
# Build the server
cd kaplanlar/backend
go build -o bkm-server main.go

# Run development server
go run main.go

# Check dependencies
go mod tidy
```

**Backend Responsibilities:**
- Serve static files from `../web/` directory
- Handle HTTP requests for index, CSS, JS assets
- Provide custom 404 pages
- Configurable via Gin router

### 2. Frontend Development (HTML/CSS/JS)

**File Structure:**

| File | Size | Purpose |
|------|------|---------|
| `index.html` | 7KB | Main page structure with sections |
| `style.css` | 15KB | Complete styling + animations |
| `script.js` | 15KB | Interactive logic and effects |

### 3. GitHub Actions

**Stale Issues/PRs Cleanup:**
- Runs weekly at `13:26 UTC`
- Labels inactive items as `no-issue-activity` / `no-pr-activity`
- Auto-closes after 90 days of inactivity

## Deployment Strategy

### Local Testing
```bash
cd kaplanlar/backend
go run main.go
# Visit http://localhost:8080
```

### Production (Conceptual)
1. Backend compiled binary deployed to server
2. Static files served via Nginx/Apache or CDN
3. Contact form ready for backend integration (PHP/Node.js/Python)

## Common Tasks

### Restart Development Server
```bash
cd kaplanlar/backend
go run main.go
```

### Clear Browser Cache & Reload
- Delete browser cache or use "Hard Reload" (Ctrl+Shift+R)

### Check Dependencies
```bash
cd kaplanlar/backend
go mod download
go list -m all
```

## Known Issues & TODOs

1. **Images**: Gallery uses placeholder Unsplash images - replace with actual team photos
2. **SSL**: Needs HTTPS setup for production deployment

## Useful References

- Go Gin Documentation: https://gin-gonic.com/
- GitHub Actions Stale: https://github.com/actions/stale

