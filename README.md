# PulseUp

PulseUp is a healthcare opportunity discovery and collaboration platform for India's medical ecosystem.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

The app is a static site that requires serving via a local development server to support ES module imports. Run:

```bash
npm run dev
```

This starts a Vite dev server at `http://localhost:5173`. ES modules do not work when opening `index.html` directly in the browser due to browser security restrictions.

## Current MVP product slice

PulseUp is currently a focused frontend MVP for the Career Operating System vision:

- Verified-professional profile shell with live saved-opportunity metrics
- Internship, fellowship, conference, and research opportunity discovery
- Search, category filters, and persistent saved opportunities
- Career OS actions for CV building, career planning, and mentor matching
- Goal Spaces with persistent join state
- Application pipeline with tracked opportunities and removal controls
- Profile verification request state with pending status

The frontend uses local sample data and browser `localStorage`. A first Supabase data
model is available in [`supabase/schema.sql`](./supabase/schema.sql), with configuration
placeholders in [`.env.example`](./.env.example). Authentication, credential verification,
moderation, messaging, and notifications can be wired to that model next.