# BKM Tigers Website 🐯

A beautiful, modern single-page website for **BKM Tigers** - a student organization. Built with Go (backend) and vanilla JavaScript/CSS (frontend).

> 💙 Birlikten daha fazlası • Dostluktan güçlenir • Maviden renkliyoruz

## 🌟 Features

- **Stunning Animations**: Floating stars, hearts, and particle effects create a magical atmosphere
- **Smooth Interactions**: Scroll reveals, hover effects, and micro-interactions throughout
- **Mobile-First Design**: Fully responsive with native mobile navigation menu
- **Contact Form**: Clean form interface ready for backend integration
- **Performance Optimized**: Pure HTML/CSS/JS - no build steps required

## 🚀 Quick Start

### Local Development

1. **Backend (Go)**:
```bash
cd kaplanlar/backend
go run main.go
```

2. **Frontend (Static Server)**:
The backend already serves the static files on port `8080`. Visit http://localhost:8080 to see the live site!

### Development Mode

You can view the frontend locally without a reverse proxy:

```bash
cd kaplanlar/backend
go run main.go
```


## 📁 Project Structure

```
kaplanlar/
├── backend/              # Go API server
│   ├── main.go          # Gin router, serves static files
│   ├── go.mod           # Go dependencies
│   └── go.sum
├── web/                 # Frontend assets
│   ├── index.html       # Main HTML file
│   ├── script.js        # All JavaScript logic
│   ├── style.css        # Complete stylesheet with animations
│   └── 404.html         # Custom error page
└── .github/            # GitHub Actions workflows
    └── workflows/
        └── stale.yml    # Auto-closes inactive issues/PRs
```

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | [Go (Gin v1.12)](https://gin-gonic.com/) | REST API, static file serving |
| Frontend | HTML5 + CSS3 + Vanilla JS | Responsive UI with animations |
| Design System | Custom CSS variables | Consistent blue color palette (#071b46 primary) |
| Font | [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins) | Clean, modern typography |

### Key Features

- **CSS Variables**: Easy theming with colors defined in `:root`
- **Intersection Observer**: Scroll-triggered reveal animations
- **Particle System**: JavaScript-generated floating symbols
- **Loading Screen**: Animated progress bar with paw icon 🐾
- **Responsive Breakpoints**: Optimized for mobile (800px), tablet, and desktop

## 🎨 Design Tokens

```css
:root {
  --blue: #176bdf;         /* Primary action color */
  --light-blue: #63c8ff;   /* Accent highlights */
  --navy: #071b46;         /* Deep blue background */
  --white: #fff;            /* Text/elements */
  --pale: #eff8ff;          /* Light backgrounds */
}
```

## 📱 Responsive Breakpoints

- **Desktop**: Full layout with 3-column grids
- **Tablet (≤800px)**: Single column, mobile menu enabled
- **Mobile (≤480px)**: Compact spacing, larger touch targets

## 🔧 Configuration

### Backend Server Settings (`main.go`)

```go
router.Static("/static", "../web")
router.Run(":8080")
```

The server serves static files from the `web/` directory at `/static/`.

### GitHub Actions

The repository includes a [Stale workflow](.github/workflows/stale.yml) that automatically closes issues and PRs without activity for 30+ days.

## 📄 License

© 2026 BKM Tigers - Sevgiyle, dostlukla ve maviyle! 💙

---

**Built with ❤️ by the BKM Tigers team**
