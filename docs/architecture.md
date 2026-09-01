# PulseUp Architecture

**Date**: September 1, 2026  
**Current State**: Frontend MVP (no backend)  
**Target State**: Full-stack product with AI

---

## Current Architecture (Frontend MVP)

```
┌─────────────────────────────────────────────────────┐
│                  BROWSER CLIENT                      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │           Vue Component Layer                   │ │
│  │  (Vanilla JavaScript, no framework)             │ │
│  │                                                  │ │
│  │  ├─ Home view                                   │ │
│  │  ├─ Discover view (opportunities)               │ │
│  │  ├─ Saved view                                  │ │
│  │  ├─ Applications view                           │ │
│  │  ├─ Profile view                                │ │
│  │  └─ Gamification overlay                        │ │
│  └────────────────────────────────────────────────┘ │
│                      ↓                                │
│  ┌────────────────────────────────────────────────┐ │
│  │      Application Logic Layer (app.js)          │ │
│  │                                                  │ │
│  │  ├─ View management (showView)                  │ │
│  │  ├─ Event handling                              │ │
│  │  ├─ Gamification logic                          │ │
│  │  └─ Data manipulation                           │ │
│  └────────────────────────────────────────────────┘ │
│                      ↓                                │
│  ┌────────────────────────────────────────────────┐ │
│  │       Data Access Layer (storage.js)            │ │
│  │                                                  │ │
│  │  └─ Browser localStorage adapter                │ │
│  └────────────────────────────────────────────────┘ │
│                      ↓                                │
│  ┌────────────────────────────────────────────────┐ │
│  │        Local Storage (Persistence)              │ │
│  │                                                  │ │
│  │  ├─ pulseup-profile (user data)                 │ │
│  │  ├─ pulseup-saved-opportunities                 │ │
│  │  ├─ pulseup-applications                        │ │
│  │  └─ pulseup-joined-spaces                       │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
└─────────────────────────────────────────────────────┘

Mock Data (data.js)
├─ 4 hard-coded opportunities
└─ 2 hard-coded goal spaces
```

### Current Stack
- **Frontend**: Vanilla JavaScript + Vite
- **Storage**: Browser localStorage only
- **Data**: Hard-coded in src/data.js
- **Build**: Vite
- **Backend**: None
- **Database**: None
- **AI**: None

### Key Files
| File | Purpose | Status |
|------|---------|--------|
| `index.html` | Main entry point | Active |
| `app.js` | Application logic (22 KB) | Active |
| `styles.css` | UI styling | Active |
| `src/storage.js` | localStorage wrapper | Active |
| `src/data.js` | Mock data | To replace |
| `supabase/schema.sql` | Planned DB schema | Not connected |

---

## Target Architecture (Full Product)

```
┌────────────────────────────────────────────────────────────────┐
│                    USER CLIENT (Browser)                       │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            React/Vue Application                         │   │
│  │                                                           │   │
│  │  ├─ Home Dashboard                                       │   │
│  │  ├─ Goal Management UI                                  │   │
│  │  ├─ Opportunity Discovery                               │   │
│  │  ├─ Application Pipeline                                │   │
│  │  ├─ AI Mentor Chat                                      │   │
│  │  ├─ Roadmap Visualization                               │   │
│  │  ├─ Community/Goal Spaces                               │   │
│  │  ├─ Mentorship Matching                                 │   │
│  │  ├─ Progress Tracking                                   │   │
│  │  └─ User Profile                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│                  HTTPS REST API Calls                           │
│                           ↓                                      │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Edge)                      │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              API Layer (REST Endpoints)                  │   │
│  │                                                           │   │
│  │  ├─ Auth endpoints (signup, login, refresh)             │   │
│  │  ├─ User endpoints (profile, skills, preferences)       │   │
│  │  ├─ Goal endpoints (CRUD, list, details)                │   │
│  │  ├─ Opportunity endpoints (list, search, save, apply)   │   │
│  │  ├─ Application endpoints (status updates)              │   │
│  │  ├─ Goal Space endpoints (CRUD, members, discussions)   │   │
│  │  ├─ Matching endpoints (get matches, suggestions)       │   │
│  │  ├─ Mentorship endpoints (requests, profiles)           │   │
│  │  ├─ Progress endpoints (updates, tracking)              │   │
│  │  ├─ AI endpoints (mentor, roadmap generation)           │   │
│  │  └─ Notification endpoints (list, preferences)          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Business Logic Layer (Services)                │   │
│  │                                                           │   │
│  │  ├─ User Service (profiles, authentication)             │   │
│  │  ├─ Goal Service (CRUD, personalization)                │   │
│  │  ├─ Opportunity Service (ingestion, search)             │   │
│  │  ├─ Matching Service (algorithm, recommendations)       │   │
│  │  ├─ Mentorship Service (pairing, tracking)              │   │
│  │  ├─ Roadmap Service (generation, updates)               │   │
│  │  ├─ Progress Service (tracking, feedback)               │   │
│  │  ├─ AI Service (LLM calls, RAG, prompts)               │   │
│  │  ├─ Community Service (spaces, moderation)              │   │
│  │  ├─ Notification Service (delivery, preferences)        │   │
│  │  └─ Contribution Service (credits, verification)        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │        Data Access Layer (Repository Pattern)            │   │
│  │                                                           │   │
│  │  ├─ User repository                                      │   │
│  │  ├─ Goal repository                                      │   │
│  │  ├─ Opportunity repository                               │   │
│  │  ├─ Application repository                               │   │
│  │  ├─ Community repository                                 │   │
│  │  ├─ Progress repository                                  │   │
│  │  ├─ Matching repository                                  │   │
│  │  └─ Mentorship repository                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────┐  ┌─────────────────────────────┐ │
│  │   Supabase Database      │  │   Vector Database (RAG)      │ │
│  │   (Primary Data Store)   │  │   (Knowledge Retrieval)      │ │
│  │                          │  │                             │ │
│  │  ├─ profiles             │  │  ├─ Document embeddings     │ │
│  │  ├─ goals                │  │  ├─ Chunked content         │ │
│  │  ├─ opportunities        │  │  ├─ Metadata                │ │
│  │  ├─ applications         │  │  └─ Retrieval indices       │ │
│  │  ├─ goal_spaces          │  │                             │ │
│  │  ├─ goal_space_members   │  │  Options:                   │ │
│  │  ├─ mentorships          │  │  - Pinecone                 │ │
│  │  ├─ messages             │  │  - Weaviate                 │ │
│  │  ├─ progress             │  │  - Qdrant                   │ │
│  │  ├─ contributions        │  │  - Supabase pgvector        │ │
│  │  └─ RLS policies         │  └─────────────────────────────┘ │
│  │                          │                                    │
│  │  Auth via Supabase Auth  │  Populated via:                   │
│  └──────────────────────────┘  - Notion integration             │
│                                 - Document upload                │
│                                 - Web scraping                   │
│                                 - Manual curation                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              External Services / APIs                     │  │
│  │                                                            │  │
│  │  ├─ LLM Provider (Claude / GPT-4)                          │  │
│  │  ├─ Notion API (knowledge ingestion)                       │  │
│  │  ├─ Email Service (SendGrid / Resend)                      │  │
│  │  ├─ File Storage (S3 / Supabase Storage)                   │  │
│  │  ├─ Search Backend (Typesense / Meilisearch)               │  │
│  │  └─ Real-time (Firebase / WebSocket)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                   AI/INTELLIGENCE LAYER                        │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Prompt Engineering Layer                      │  │
│  │                                                            │  │
│  │  ├─ Goal decomposition prompts                            │  │
│  │  ├─ Roadmap generation prompts                            │  │
│  │  ├─ Mentorship recommendation prompts                     │  │
│  │  ├─ Matching scoring prompts                              │  │
│  │  └─ Content generation prompts                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          RAG (Retrieval Augmented Generation)             │  │
│  │                                                            │  │
│  │  ├─ Query embedding                                       │  │
│  │  ├─ Semantic search                                       │  │
│  │  ├─ Retrieved context ranking                             │  │
│  │  ├─ Hallucination reduction                               │  │
│  │  └─ Citation tracking                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Matching & Recommendation Engine                 │  │
│  │                                                            │  │
│  │  ├─ Collaborative filtering                               │  │
│  │  ├─ Content-based matching                                │  │
│  │  ├─ Skill gap analysis                                    │  │
│  │  └─ Goal similarity scoring                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### Recommended Tech Stack

| Component | Current | Recommendation | Rationale |
|-----------|---------|-----------------|-----------|
| **Frontend** | Vanilla JS | React 19 + TypeScript | Better maintainability, component reuse |
| **Backend** | None | Node.js (Express/Fastify) | JavaScript ecosystem, speed |
| **Database** | None | Supabase (PostgreSQL) | Already designed schema, auth included |
| **Auth** | None | Supabase Auth | Built-in, secure |
| **Storage** | None | Supabase Storage | File uploads, integrated |
| **Vector DB** | None | Pinecone or Supabase pgvector | Fast, managed |
| **LLM** | None | Claude 3.5 (Anthropic) | Better reasoning, extended context |
| **Search** | None | Full-text in Postgres or Typesense | Good trade-off |
| **Real-time** | None | Supabase Realtime | Works with existing stack |
| **Hosting** | None | Vercel (frontend) + Railway/Fly.io (backend) | Developer-friendly |
| **Monitoring** | None | Sentry + PostHog | Error tracking + analytics |

---

## Data Model

### Core Entities

```
┌─────────────────┐
│   User/Profile  │
├─────────────────┤
│ id (UUID)       │
│ email           │
│ name            │
│ avatar_url      │
│ headline        │
│ stage           │ (student/resident/faculty/etc)
│ skills[]        │
│ verification    │
│ created_at      │
│ updated_at      │
└──────┬──────────┘
       │
       ├─ has many goals
       ├─ has many applications
       ├─ has many saved opportunities
       ├─ has many space memberships
       ├─ has many mentorships (both directions)
       └─ has many contributions

┌──────────────────┐
│      Goal        │
├──────────────────┤
│ id (UUID)        │
│ user_id (FK)     │
│ title            │
│ description      │
│ target_date      │
│ status           │ (active/completed/paused)
│ created_at       │
│ updated_at       │
└──────┬───────────┘
       │
       ├─ belongs to goal space(s)
       ├─ has one roadmap
       └─ has many progress updates

┌───────────────────┐
│  Goal Roadmap     │
├───────────────────┤
│ id (UUID)         │
│ goal_id (FK)      │
│ milestones[]      │
│ phases[]          │
│ skills_needed     │
│ resources[]       │
│ timeline          │
│ created_at        │
└───────────────────┘

┌───────────────────┐
│   Opportunity     │
├───────────────────┤
│ id (UUID)         │
│ title             │
│ organization      │
│ type              │ (internship/fellowship/research/etc)
│ description       │
│ location          │
│ application_url   │
│ closes_at         │
│ verification_stat │
│ created_at        │
└──────┬────────────┘
       │
       ├─ has many applications
       └─ has many saves

┌──────────────────┐
│   Application    │
├──────────────────┤
│ id (UUID)        │
│ user_id (FK)     │
│ opportunity_id   │
│ status           │ (saved/applied/interview/offer/etc)
│ notes            │
│ created_at       │
└──────────────────┘

┌──────────────────┐
│  Goal Space      │
├──────────────────┤
│ id (UUID)        │
│ name             │
│ description      │
│ visibility       │
│ created_by (FK)  │
│ created_at       │
└──────┬───────────┘
       │
       └─ has many members

┌──────────────────────┐
│ GoalSpace Member     │
├──────────────────────┤
│ space_id (FK)        │
│ user_id (FK)         │
│ role                 │ (member/moderator/owner)
│ joined_at            │
└──────────────────────┘

┌──────────────────┐
│  Mentorship      │
├──────────────────┤
│ id (UUID)        │
│ mentor_id (FK)   │
│ mentee_id (FK)   │
│ status           │ (pending/active/completed)
│ goals[]          │
│ created_at       │
└──────────────────┘

┌──────────────────┐
│  Contribution    │
├──────────────────┤
│ id (UUID)        │
│ user_id (FK)     │
│ type             │ (help/review/resource/etc)
│ points           │
│ verified         │
│ created_at       │
└──────────────────┘

┌──────────────────┐
│   Progress       │
├──────────────────┤
│ id (UUID)        │
│ goal_id (FK)     │
│ user_id (FK)     │
│ milestone_id     │
│ notes            │
│ completed_at     │
│ created_at       │
└──────────────────┘
```

---

## API Endpoints (High-level)

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh token

### User Profile
- `GET /profile` - Get current user
- `PATCH /profile` - Update profile
- `GET /profile/:id` - Get any user profile

### Goals
- `POST /goals` - Create goal
- `GET /goals` - List user's goals
- `GET /goals/:id` - Get goal details
- `PATCH /goals/:id` - Update goal
- `DELETE /goals/:id` - Delete goal

### Opportunities
- `GET /opportunities` - Search/list opportunities
- `GET /opportunities/:id` - Get opportunity details
- `POST /opportunities/:id/save` - Save opportunity
- `DELETE /opportunities/:id/save` - Unsave opportunity

### Applications
- `POST /applications` - Create application
- `GET /applications` - List applications
- `PATCH /applications/:id` - Update status

### AI Mentor
- `POST /ai/mentor/chat` - Get mentor response
- `POST /ai/roadmap/generate` - Generate roadmap
- `POST /ai/match/find` - Get match recommendations

### Goal Spaces
- `GET /spaces` - List spaces
- `POST /spaces` - Create space
- `POST /spaces/:id/join` - Join space
- `DELETE /spaces/:id/leave` - Leave space

### Matching
- `GET /match/users` - Find matching users
- `GET /match/mentors` - Find potential mentors

### Progress
- `POST /progress` - Log progress
- `GET /progress/:goalId` - Get goal progress

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-4)
- ✅ Supabase setup
- ✅ Authentication
- ✅ User profiles
- ✅ Basic API
- ✅ Frontend updates

### Phase 2: Goals & AI (Weeks 5-8)
- Goal CRUD
- LLM integration
- Basic roadmap
- Goal spaces (basic)

### Phase 3: Knowledge (Weeks 9-12)
- Vector DB setup
- Notion integration
- RAG implementation
- Enhanced roadmap

### Phase 4: Community (Weeks 13-16)
- Matching algorithm
- Mentorship system
- Messaging
- Enhanced spaces

### Phase 5: Polish (Weeks 17-20)
- Progress tracking
- Notifications
- Verification
- Performance

---

## Security Considerations

### Authentication & Authorization
- [ ] JWT-based auth with refresh tokens
- [ ] Email verification required
- [ ] Secure password hashing (bcrypt)
- [ ] Row-level security (RLS) on all tables
- [ ] Rate limiting on auth endpoints

### Data Protection
- [ ] Encryption of sensitive fields
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention

### API Security
- [ ] Rate limiting per user
- [ ] API key rotation
- [ ] Audit logging
- [ ] CSRF protection
- [ ] XSS prevention

---

## Monitoring & Observability

### Required
- Error tracking (Sentry)
- Analytics (PostHog)
- Performance monitoring
- Database query monitoring
- API response time tracking

### Dashboards
- User signup trends
- Feature usage
- Error rates
- Performance metrics
- Business metrics (goals created, etc)

---

## Deployment Strategy

### Frontend
- Build: `npm run build` → `dist/`
- Host on Vercel
- CI/CD via GitHub Actions
- Preview deployments on PRs

### Backend
- Docker containerization
- Deploy to Railway or Fly.io
- Supabase for database
- Environment-based configuration

### Database
- Supabase managed Postgres
- Automated backups
- Staging environment with real data

---

## Known Unknowns

1. **Real-time Requirements**: Do we need real-time messaging?
2. **Scale**: Expected users/goals/opportunities?
3. **Moderation**: How to handle spam/abuse?
4. **Payment**: If mentorship is paid, how?
5. **Mobile**: Native app or web-only MVP?

---

## Next Steps

1. Clarify architecture decisions with team
2. Get buy-in on tech stack
3. Create detailed backend specs
4. Set up infrastructure
5. Begin Phase 1 implementation

---

**Status**: Architecture planning complete  
**Recommendation**: Proceed to detailed backend specification
