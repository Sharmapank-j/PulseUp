# Infrastructure Provisioning Guide

**Purpose**: Provision production infrastructure for PulseUp  
**Target Audience**: DevOps engineer, tech lead, infrastructure manager  
**Estimated Time**: 120-180 minutes (mostly waiting for provisioning)  
**Last Updated**: Phase 3

---

## Overview

This guide provisions a production-ready infrastructure stack for PulseUp with:
- **Frontend Hosting**: Vercel (recommended) or AWS S3 + CloudFront
- **Backend Hosting**: Railway.app (recommended) or Fly.io
- **Database**: Supabase PostgreSQL (production)
- **Vector Database**: Supabase pgvector (or Pinecone alternative)
- **LLM Provider**: Anthropic (Claude 3.5)
- **Storage**: Supabase Storage (images) or AWS S3
- **Email Service**: SendGrid or Resend
- **Monitoring**: DataDog or Sentry (optional but recommended)
- **CDN**: Vercel (automatic) or CloudFlare

---

## Prerequisites

### Accounts & Access
- [x] GitHub account (for deployment)
- [x] GitHub repository access (fork or push access)
- [x] Supabase account (free tier sufficient for testing)
- [x] Vercel account (free tier sufficient)
- [x] Railway account (free tier sufficient)
- [x] Anthropic API key (Claude)
- [x] SendGrid or Resend account (for emails)
- [x] Credit card (for production scaling)

### Local Setup
- [x] Git configured with SSH keys
- [x] Environment variables template ready
- [x] Database schema ready

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  CDN / HTTPS                                              │
│  │                                                        │
│  ├─→ Vercel (Frontend)                                   │
│  │   ├─ React/Vite Build                                 │
│  │   ├─ Environment Variables                            │
│  │   └─ Auto-deploy on Git push                          │
│  │                                                        │
│  └─→ Vercel / Railway (Backend API)                      │
│      ├─ Node.js Express                                  │
│      ├─ Environment Variables                            │
│      └─ Auto-deploy on Git push                          │
│                                                            │
├─────────────────────────────────────────────────────────┤
│                                                            │
│  Data Layer                                               │
│                                                            │
│  ├─ Supabase PostgreSQL (Primary Database)               │
│  │  ├─ Users & Profiles                                  │
│  │  ├─ Goals & Roadmaps                                  │
│  │  ├─ Mentorships                                       │
│  │  └─ RLS Policies                                      │
│  │                                                        │
│  ├─ Supabase pgvector (Vector Embeddings)               │
│  │  ├─ Knowledge vectors                                 │
│  │  └─ Goal decomposition vectors                        │
│  │                                                        │
│  └─ Supabase Storage (File Storage)                      │
│     ├─ User avatars                                      │
│     └─ Document uploads                                  │
│                                                            │
├─────────────────────────────────────────────────────────┤
│                                                            │
│  External Services                                        │
│                                                            │
│  ├─ Anthropic Claude (LLM)                               │
│  │  └─ AI mentor & goal decomposition                    │
│  │                                                        │
│  ├─ SendGrid / Resend (Email)                            │
│  │  └─ Transactional emails                              │
│  │                                                        │
│  └─ Monitoring (DataDog / Sentry)                        │
│     └─ Error tracking & performance                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Step 1: Set Up Supabase Production Project

### 1a. Create Supabase Project

1. Go to https://app.supabase.com/
2. Click "New project"
3. **Project name**: `pulseup-prod` (or similar)
4. **Database password**: Generate a strong password (32+ chars)
5. **Region**: Choose closest to your primary user base
   - US East 1 (for US users)
   - EU West 1 (for European users)
6. Click "Create new project"

**Estimated time**: 3-5 minutes for provisioning

### 1b. Wait for Project Initialization

You'll receive email when ready. Dashboard shows:
- Database URL
- Anon key
- Service role key
- API URL

### 1c. Enable Supabase Auth

1. Go to "Authentication" → "Providers"
2. Ensure "Email" is enabled
3. Configure email templates:
   - Confirmation link template
   - Password reset template
   - Invite template
4. Set auth redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:5173/auth/callback` (dev)

### 1d. Create Database Tables

1. Go to SQL Editor
2. Copy and paste `supabase/schema.sql`
3. Run the full schema
4. Verify tables created:
   - profiles
   - goals
   - opportunities
   - mentorships
   - etc.

### 1e. Enable RLS (Row Level Security)

In SQL Editor, run:
```sql
-- For each table
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All should show: `tablename | rowsecurity = true`

### 1f. Create Supabase Storage Bucket

1. Go to "Storage" → "Buckets"
2. Click "New bucket"
3. **Name**: `avatars`
4. **Access**: Public
5. Click "Create bucket"

Repeat for:
- `documents` (private)
- `temp-uploads` (private)

### 1g. Set Storage RLS Policies

For `avatars` bucket (public):
```sql
CREATE POLICY "Public Read"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = owner AND
    (name = auth.uid()::text || '.webp')
  );
```

---

## Step 2: Provision Backend Hosting

### Option A: Railway.app (Recommended - Easiest)

#### 2a. Create Railway Project

1. Go to https://railway.app/
2. Sign in with GitHub
3. Click "Create new project"
4. Select "Deploy from GitHub repo"
5. **Connect your repo** (PulseUp)
6. Select `backend` directory (if applicable)

#### 2b. Add Environment Variables

1. Go to project "Variables"
2. Add all variables from `backend/.env`:

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=...

JWT_SECRET=super_secret_key_32_chars_minimum_xxx

ANTHROPIC_API_KEY=sk-ant-xxxxx

EMAIL_API_KEY=SG.xxxx

LOG_LEVEL=info
```

#### 2c. Deploy

1. Railway auto-deploys on git push
2. Check "Deployments" tab for status
3. Copy generated URL: `https://xxxx.railway.app`

#### 2d. Configure Domain (Optional)

1. Go to "Settings" → "Custom Domain"
2. Add `api.yourdomain.com`
3. Update DNS records as shown

---

### Option B: Fly.io (Alternative)

#### 2b. Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
flyctl auth login
```

#### 2c. Initialize Project

```bash
cd backend
flyctl launch
# Answers:
# App Name: pulseup-api
# Region: Choose closest
# Database: PostgreSQL (but we're using Supabase, so "No")
```

#### 2d. Set Secrets

```bash
flyctl secrets set \
  SUPABASE_URL=https://xxxx.supabase.co \
  SUPABASE_ANON_KEY=... \
  SUPABASE_SERVICE_ROLE_KEY=... \
  ANTHROPIC_API_KEY=... \
  EMAIL_API_KEY=...
```

#### 2e. Deploy

```bash
flyctl deploy
```

---

## Step 3: Provision Frontend Hosting

### Option A: Vercel (Recommended)

#### 3a. Create Vercel Project

1. Go to https://vercel.com/
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Select PulseUp repository
5. **Framework preset**: Vite
6. **Root directory**: . (root)

#### 3b. Configure Build Settings

- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Install command**: `npm install`

#### 3c. Add Environment Variables

Go to "Settings" → "Environment Variables" and add:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3d. Deploy

1. Vercel auto-deploys on git push
2. Check "Deployments" tab
3. Copy domain: `https://pulseup-xxxx.vercel.app`

#### 3e. Configure Custom Domain (Optional)

1. Go to "Settings" → "Domains"
2. Add `yourdomain.com` or `app.yourdomain.com`
3. Update DNS records as shown

---

### Option B: AWS S3 + CloudFront (Advanced)

#### 3b. Create S3 Bucket

```bash
aws s3 mb s3://pulseup-frontend --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket pulseup-frontend \
  --versioning-configuration Status=Enabled

# Block public access
aws s3api put-public-access-block \
  --bucket pulseup-frontend \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

#### 3c. Create CloudFront Distribution

1. Go to CloudFront Console
2. Create distribution:
   - **Origin domain**: S3 bucket
   - **S3 access**: CloudFront OAI
   - **Viewer protocol**: Redirect HTTP to HTTPS
   - **Cache settings**: 1 year for static, 0 for index.html
   - **Custom domain**: yourdomain.com
   - **SSL**: Request certificate

#### 3d. Deploy Build

```bash
npm run build

aws s3 sync dist/ s3://pulseup-frontend/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234ABCD \
  --paths "/*"
```

---

## Step 4: Configure LLM Provider (Claude)

### 4a. Get Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to "API Keys"
4. Create new key: `pulseup-prod`
5. Copy key: `sk-ant-xxxxxxxxxxxxx`

### 4b. Add to Backend Environment

Add to your backend hosting platform:

**Railway**:
```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

**Fly.io**:
```bash
flyctl secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

### 4c. Create API Key Policy (Recommended)

Set monthly usage limits:
1. Go to Anthropic Console
2. Click API key
3. Set: **Monthly budget**: $100 (or your budget)

---

## Step 5: Configure Email Service

### Option A: SendGrid (Enterprise)

#### 5a. Create SendGrid Account

1. Go to https://sendgrid.com/
2. Sign up (free tier: 100 emails/day)
3. Verify sender email

#### 5b. Create API Key

1. Go to Settings → API Keys
2. Click "Create API Key"
3. **Name**: PulseUp Backend
4. **Permissions**: Mail Send only
5. Copy key: `SG.xxxxxxxxxxxx`

#### 5c. Add to Backend

**Railway**:
```env
EMAIL_API_KEY=SG.xxxxxxxxxxxx
EMAIL_FROM=noreply@pulseup.app
```

#### 5d. Create Email Templates

In SendGrid:
1. Dynamic Templates → Create Template
   - Confirmation email
   - Password reset email
   - Mentorship invitation
   - Weekly digest

---

### Option B: Resend (Startup-friendly)

#### 5a. Create Resend Account

1. Go to https://resend.com/
2. Sign up
3. Verify domain: `pulseup.app`

#### 5b. Create API Key

1. Go to Settings
2. Click "Create API Key"
3. Copy key: `re_xxxxxxxxxxxx`

#### 5c. Add to Backend

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@pulseup.app
```

---

## Step 6: Set Up Monitoring (Recommended)

### Option A: Sentry (Error Tracking)

#### 6a. Create Sentry Project

1. Go to https://sentry.io/
2. Sign in
3. Create project:
   - **Platform**: Node.js
   - **Alert rules**: On release
4. Get DSN: `https://xxxx@xxxx.ingest.sentry.io/xxxx`

#### 6b. Install in Backend

```bash
npm install @sentry/node @sentry/tracing
```

#### 6c. Add to Backend Code

**backend/src/index.js**:
```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

#### 6d. Add to Environment

```env
SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
```

---

### Option B: DataDog (Full Monitoring)

1. Create DataDog account at https://www.datadoghq.com/
2. Install APM agent: `npm install dd-trace`
3. Enable in backend
4. Configure dashboards

---

## Step 7: Configure Domain & DNS

### 7a. Purchase Domain (if needed)

- Providers: Namecheap, GoDaddy, Route53, Google Domains
- Choose: `yourdomain.com` or similar

### 7b. Update DNS Records

Add these A/CNAME records:

```dns
Domain: yourdomain.com
Type: A/CNAME
Value: Vercel IP or CloudFront domain

Subdomain: api.yourdomain.com
Type: CNAME
Value: Railway/Fly.io domain
```

Example (Vercel + Railway):
```dns
pulseup.app          CNAME  cname.vercel-dns.com
api.pulseup.app      CNAME  pulseup-api-prod.railway.app
```

### 7c. Configure SSL/TLS

- Vercel: Automatic (free Let's Encrypt)
- Railway: Automatic
- Custom domain: Add certificate in hosting platform

### 7d. Verify HTTPS

```bash
# Should return 200 and valid cert
curl -I https://yourdomain.com
curl -I https://api.yourdomain.com/health
```

---

## Step 8: Environment Variables Checklist

### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Backend (.env.production)
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

JWT_SECRET=[32+ char random string]
ANTHROPIC_API_KEY=sk-ant-...
EMAIL_API_KEY=SG... or re_...
SENTRY_DSN=https://...

LOG_LEVEL=info
```

---

## Step 9: Post-Deployment Verification

### 9a. Test API Endpoints

```bash
# Health check
curl https://api.yourdomain.com/health

# Auth endpoints (should fail gracefully)
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### 9b. Test Frontend

1. Go to https://yourdomain.com/
2. Should load without errors
3. Check browser console (no 404s for API calls)
4. Try signing up/logging in

### 9c. Check Database

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Run: SELECT * FROM auth.users;
# 3. Should be empty initially
```

### 9d. Verify Emails

Send test email:
```bash
curl -X POST https://api.yourdomain.com/api/email/test \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com"}'
```

### 9e. Monitor Logs

1. **Railway**: Go to Deployments → Logs
2. **Vercel**: Go to Deployments → Build Logs / Runtime Logs
3. **Sentry**: Go to Issues dashboard

---

## Scaling Configuration

### Database Scaling

As users grow:

1. **Supabase tier upgrade**:
   - Free → Pro ($25/month + usage)
   - Includes connection pooling, better backups

2. **Add read replicas** (if needed):
   - In Supabase dashboard
   - Route read-heavy queries to replica

3. **Enable pgvector** for AI features:
   - In Supabase SQL: `CREATE EXTENSION vector;`
   - Start with small index

### Backend Scaling

1. **Increase CPU/RAM**:
   - Railway: Go to "Settings" → increase Machine Type
   - Fly.io: Increase machine size in `fly.toml`

2. **Enable auto-scaling**:
   - Railway: Enable under "Observability"
   - Fly.io: Set `[processes]` in `fly.toml`

3. **Add caching layer**:
   - Redis on Railway or Fly.io
   - Cache frequently accessed data

### Frontend Optimization

1. **Enable CDN caching**: Vercel/CloudFront automatic
2. **Image optimization**: Use Vercel Image Optimization
3. **Analytics**: Add Vercel Web Analytics

---

## Backup & Disaster Recovery

### 1. Database Backups

Supabase automatic backups:
- Free tier: 7-day retention
- Pro tier: 30-day retention

Manual backup (monthly):
```bash
# Export database
pg_dump postgresql://user:pass@host/db > backup.sql

# Store in S3 or similar
aws s3 cp backup.sql s3://backups/pulseup-$(date +%Y%m%d).sql
```

### 2. Storage Backups

```bash
# Backup Supabase Storage
aws s3 sync s3://supabase-storage/ s3://backups/storage/

# Or manually in Supabase dashboard
```

### 3. Infrastructure as Code

```bash
# Version control your infrastructure
git add supabase/schema.sql
git add backend/.env.production
git add railway.json  # or fly.toml
git commit -m "Infrastructure config"
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **API Response Time**: Alert if > 2 seconds
2. **Error Rate**: Alert if > 1% of requests
3. **Database Connection Pool**: Alert if > 80% used
4. **Storage Usage**: Alert if > 80% of quota
5. **Cost**: Alert if > 20% over budget

Set up in:
- **Railway**: Settings → Notifications
- **Vercel**: Analytics dashboard
- **Sentry**: Alert rules
- **Supabase**: Database settings

---

## Cost Estimation (Monthly)

| Service | Free Tier | Pro Tier | Usage |
|---------|-----------|----------|-------|
| Supabase | $0 | $25 | Database |
| Railway | $5 credit | $7+ | Backend |
| Vercel | $0 | Automatic | Frontend |
| SendGrid | $0 | $30+ | Emails |
| Claude API | | $0.01/1K input | LLM |
| Sentry | $0 | $29+ | Errors |
| **Total** | **~$5-10** | **$90-150+** | Initial MVP |

---

## Deployment Checklist

- [ ] Supabase project created and schema migrated
- [ ] Backend deployed to Railway/Fly.io
- [ ] Frontend deployed to Vercel/CloudFront
- [ ] Environment variables configured on all platforms
- [ ] Custom domains set up and DNS updated
- [ ] SSL/HTTPS verified
- [ ] API endpoints tested and responding
- [ ] Database accessible from backend
- [ ] Email service configured and tested
- [ ] LLM API key configured
- [ ] Monitoring (Sentry/DataDog) set up
- [ ] Backups configured
- [ ] Team onboarded with access
- [ ] Documentation updated

---

## Maintenance Tasks

### Weekly
- [ ] Check monitoring dashboards
- [ ] Review error logs in Sentry
- [ ] Monitor cost spending

### Monthly
- [ ] Create manual database backup
- [ ] Review and update dependencies
- [ ] Test disaster recovery procedures
- [ ] Review security logs

### Quarterly
- [ ] Update Supabase plan if needed
- [ ] Review and optimize database queries
- [ ] Update SSL certificates (or verify auto-renewal)
- [ ] Security audit of infrastructure

---

**Status**: Infrastructure Ready for Deployment  
**Last Updated**: Phase 3  
**Maintenance**: Ongoing
