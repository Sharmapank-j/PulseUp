# PulseUp Phase 4 - Local Development Setup

## Prerequisites
- Node.js 18+ 
- Docker (for Supabase local)
- Git

## Quick Start (5 minutes)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials (see step 3)
npm run dev
# Server runs at http://localhost:3000
```

### 2. Frontend Setup  
```bash
# In root directory
npm install
npm run dev
# App runs at http://localhost:5173
```

### 3. Supabase Local Setup (Optional for testing)

**Option A: Cloud Supabase (Easier)**
1. Create account at https://supabase.com
2. Create new project
3. Copy credentials into backend/.env:
   - SUPABASE_URL=https://xxxx.supabase.co
   - SUPABASE_SERVICE_ROLE_KEY=<from Settings > API>
4. Run migration:
   ```bash
   # Use Supabase CLI or copy SQL from supabase/migrations/001_auth_schema.sql
   # into Supabase dashboard > SQL Editor
   ```

**Option B: Local Docker**
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize and start local
supabase init
supabase start

# Run migration
supabase db push

# Get local credentials from output
```

## Testing Auth Endpoints

### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "full_name": "Test User",
    "college": "Stanford",
    "stage": "student"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### Verify Email
```bash
# Get token from signup response (debug_link)
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_TOKEN_HERE"}'
```

### Get Profile
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Frontend Auth Flow

1. Open http://localhost:5173
2. Click "Sign Up" 
3. Fill form and submit
4. Copy verification link from browser console
5. Paste into address bar to verify
6. Login with credentials
7. Redirected to home page

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

### Frontend (.env if needed)
```
VITE_API_URL=http://localhost:3000
```

## Common Issues

**"Cannot find module" errors**
- Run `npm install` in both root and backend dirs

**Supabase connection fails**
- Check .env credentials are correct
- Verify Supabase project is running
- Check network/firewall rules

**CORS errors in browser**
- Backend CORS is configured for localhost:5173
- If using different port, update backend/src/index.js

**Email verification link not working**
- In development, check browser console for debug_link
- Token expires in 24 hours

## Next Steps

1. ✅ Backend auth endpoints (done)
2. ✅ Frontend auth pages (done)  
3. ✅ Email verification (done)
4. ⏭️ Integration testing (signup → verify → login flow)
5. ⏭️ User profile pages (edit profile, avatar, etc)
6. ⏭️ Deploy to staging
