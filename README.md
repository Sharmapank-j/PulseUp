# PulseUp

PulseUp is a healthcare opportunity discovery and collaboration platform for India's medical ecosystem.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

The app is also a valid static site: open `index.html` directly or serve the folder with any static web server.

## Current product slice

- Personalized home action center
- Opportunity discovery with search and category filters
- Persistent saved opportunities using browser `localStorage`
- Create entry points for events and research collaborations
- Basic professional profile view

The current frontend uses local sample data. Supabase authentication, moderation, database persistence, and notifications are the next integration layer.