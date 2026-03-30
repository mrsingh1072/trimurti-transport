# Trimurti Transport - Premium Frontend

A luxury vehicle rental platform frontend built with React, Vite, and Tailwind CSS.

## 🎨 Design System

- **Dark Theme**: Deep gradient backgrounds with glassmorphic UI
- **Glow Effects**: Animated gradient blobs for visual richness
- **Premium Colors**: Purple-to-cyan gradients with strategic use throughout
- **Glass UI**: White/5 with backdrop blur for futuristic look
- **Typography**: Bold headlines with gradient text effects

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Navigation bar with logo and CTA
│   └── Card.jsx            # Reusable glassmorphic card component
├── pages/
│   ├── LandingPage.jsx     # Premium SaaS-style landing page
│   └── DashboardPage.jsx   # Analytics dashboard with KPIs
├── App.jsx                 # Main app component with routing
├── index.css               # Tailwind + custom animations
└── main.jsx                # React entry point
```

## 🎯 Features

### Landing Page
- ✨ Premium hero section with gradient headlines
- 📊 Stats cards with hover animations
- 🎨 Feature showcase with glass cards
- 📝 4-step how-it-works guide
- 💬 Testimonials section
- 📢 CTA section for conversion

### Dashboard Page
- 📈 KPI cards with real-time metrics
- 📊 Revenue trend chart with time range picker
- 🚗 Top vehicles section with performance bars
- 📋 Recent bookings activity feed
- 📊 Quick stats with progress indicators

## 🛠 Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme:
```js
colors: {
  primary: '#6366f1',
  secondary: '#0ea5e9'
}
```

### Animations
Custom animations are defined in `src/index.css`:
- `animate-float`: Floating motion
- `animate-glow-pulse`: Pulsing glow effect
- `card-hover`: Card lift effect on hover

## 📦 Dependencies

- **React 18**: UI library
- **Vite 5**: Build tool
- **Tailwind CSS 3**: Utility-first CSS framework
- **Lucide React**: Premium icon library

## 📝 Notes

- All styling uses Tailwind CSS - no inline styles
- Responsive design with mobile-first approach
- Smooth transitions and animations throughout
- Premium aesthetic suitable for investor presentations

## 🔗 Backend Integration

Frontend is configured to proxy API requests to backend:
```
/api/* → http://localhost:5000/*
```

Configure in `vite.config.js`

## 📄 License

Proprietary - Trimurti Transport
