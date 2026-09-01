# Development Environment Setup Guide

**Purpose**: Enable new developers to set up a complete PulseUp development environment locally  
**Target Audience**: Backend engineers, full-stack engineers  
**Estimated Time**: 45-60 minutes  
**Last Updated**: Phase 3

---

## Prerequisites

### System Requirements
- **OS**: macOS 11+, Ubuntu 20.04+, or Windows 10+ (with WSL2)
- **RAM**: 8GB minimum (16GB recommended)
- **Disk**: 20GB free space
- **Git**: 2.30+

### Software Requirements
- **Node.js**: 18.17+ or 20+ (LTS)
- **npm**: 9+ or **pnpm**: 8+ (recommended for monorepo)
- **Docker**: 20.10+ (for Supabase local)
- **Git**: For version control

### Accounts Needed
- **GitHub**: For code access
- **Supabase**: For database (free tier OK for development)
- **Anthropic**: For Claude API (free tier with credits OK)

---

## Step 1: System Setup

### 1a. Install Node.js & npm

**macOS** (using Homebrew):
```bash
brew install node@20
node --version  # Should be v20.x or higher
npm --version   # Should be 9+ or higher
```

**Ubuntu/Debian**:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

**Windows** (using Node installer):
1. Download: https://nodejs.org/en/download/
2. Install LTS version (20.x)
3. Verify in PowerShell: `node --version`

### 1b. Install Docker

**macOS**:
```bash
brew install docker
# Then install Docker Desktop from: https://www.docker.com/products/docker-desktop
```

**Ubuntu/Debian**:
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
```

**Windows**:
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Install with WSL2 backend

Verify:
```bash
docker --version
```

### 1c. Install Git

**macOS**:
```bash
brew install git
```

**Ubuntu/Debian**:
```bash
sudo apt-get install git
```

**Windows**:
1. Download: https://git-scm.com/download/win
2. Install with defaults

Verify:
```bash
git --version
```

---

## Step 2: Clone Repository

```bash
# Choose a development directory
mkdir -p ~/projects
cd ~/projects

# Clone PulseUp repository
git clone https://github.com/Sharmapank-j/PulseUp.git
cd PulseUp

# Check out development branch (if using)
git checkout develop
# Or stay on main: git checkout main
```

---

## Step 3: Frontend Setup

### 3a. Install Dependencies

```bash
cd PulseUp

# Using npm
npm install

# OR using pnpm (faster, recommended)
pnpm install

# Verify installation
npm list  # or pnpm list
```

**Expected output**: Should show no errors, version 0.x.x for PulseUp.

### 3b. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local  # or open in your editor
```

**Content of .env.local**:
```env
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # From local Supabase
```

### 3c. Start Frontend Dev Server

```bash
# Start Vite development server
npm run dev

# Output should show:
# VITE v4.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

**Frontend is now running** at http://localhost:5173/

Test it:
```bash
curl http://localhost:5173/
```

---

## Step 4: Backend Setup

### 4a. Create Backend Directory

```bash
# In PulseUp root
mkdir -p backend
cd backend

# Initialize Node.js project
npm init -y

# This creates package.json
```

### 4b. Install Backend Dependencies

```bash
cd backend

# Core dependencies
npm install express dotenv cors helmet

# Database
npm install @supabase/supabase-js

# Authentication
npm install jsonwebtoken bcryptjs

# Utilities
npm install joi zod axios

# Development
npm install -D nodemon @types/node typescript ts-node
npm install -D eslint prettier

# Testing
npm install -D jest supertest
```

### 4c. Create Backend Structure

```bash
# In backend directory
mkdir -p src/{routes,middleware,controllers,services,utils,config}
mkdir -p tests/{unit,integration}
```

### 4d. Create Basic Server File

**backend/src/index.js**:
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', require('./routes'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

### 4e. Configure Environment Variables

```bash
# In backend directory
cp .env.example .env

# Edit .env
nano .env
```

**Content of backend/.env**:
```env
# Server
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=... # Service role key

# JWT (for custom JWT handling if needed)
JWT_SECRET=your_super_secret_key_min_32_chars_long

# LLM (Claude)
ANTHROPIC_API_KEY=sk-ant-... # Add when you have it

# Email (SendGrid or similar)
EMAIL_API_KEY=SG.xxxx

# Logging
LOG_LEVEL=debug
```

### 4f. Update package.json Scripts

**backend/package.json**:
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/",
    "format": "prettier --write src/**/*.js"
  }
}
```

### 4g. Start Backend Dev Server

```bash
cd backend

# Using npm
npm run dev

# Output should show:
# Backend running at http://localhost:3000
# Environment: development
```

**Backend is now running** at http://localhost:3000

Test it:
```bash
curl http://localhost:3000/health
# Response: {"status":"ok","timestamp":"2024-01-20T10:00:00.000Z"}
```

---

## Step 5: Database Setup (Supabase Local)

### 5a. Install Supabase CLI

**macOS**:
```bash
brew install supabase/tap/supabase
```

**Ubuntu/Debian**:
```bash
wget https://github.com/supabase/cli/releases/download/v1.x.x/supabase_1.x.x_linux_amd64.deb
sudo dpkg -i supabase_1.x.x_linux_amd64.deb
```

**Windows** (using WSL):
```bash
# Same as Ubuntu instructions
```

Verify:
```bash
supabase --version
```

### 5b. Initialize Supabase Project

```bash
# In PulseUp root
supabase init

# This creates supabase/ directory with configuration
cd supabase
```

### 5c. Start Local Supabase

```bash
# From PulseUp root
supabase start

# Output:
# supabase local development started
# 
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# Inbucket URL: http://localhost:54324
```

**Keep this terminal open** or run in background.

### 5d. Create Database Tables

```bash
# In PulseUp/supabase directory
psql postgresql://postgres:postgres@localhost:54322/postgres < schema.sql

# Or using Supabase Studio (browser):
# 1. Go to http://localhost:54323
# 2. Navigate to SQL Editor
# 3. Paste schema.sql content
# 4. Run it
```

**Note**: Ensure `schema.sql` exists in `supabase/` directory with the PulseUp schema.

### 5e. Verify Database Connection

```bash
# Terminal
psql postgresql://postgres:postgres@localhost:54322/postgres

# In psql:
\dt  # List tables (should show profiles, goals, etc.)
\q   # Exit
```

Or use Supabase Studio:
1. Open http://localhost:54323
2. Click "SQL Editor"
3. Run: `SELECT * FROM information_schema.tables WHERE table_schema='public';`

---

## Step 6: Connect Frontend to Backend

### 6a. Update Frontend API Configuration

**frontend/.env.local** (already created in Step 3b):
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # From Supabase
```

### 6b. Update Frontend Code

**Example in src/app.js** (or where API calls are made):
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
}
```

### 6c. Test Connection

1. **Frontend running**: http://localhost:5173/
2. **Backend running**: http://localhost:3000/
3. **Supabase running**: http://localhost:54321 (API), http://localhost:54323 (Studio)

Test in browser console:
```javascript
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(d => console.log(d))
  // Should log: {status: "ok", timestamp: "..."}
```

---

## Step 7: VS Code Setup (Recommended)

### 7a. Install Extensions

1. **ES7+ React/Redux/React-Native snippets** (dsznajder)
2. **Prettier - Code formatter** (esbenp)
3. **ESLint** (dbaeumer)
4. **Supabase** (official)
5. **Thunder Client** or **REST Client** (for API testing)
6. **Git Lens** (eamodio)

### 7b. Create Workspace Settings

**PulseUp.code-workspace**:
```json
{
  "folders": [
    { "path": "." }
  ],
  "settings": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    },
    "[json]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    }
  }
}
```

Open with: `code PulseUp.code-workspace`

---

## Step 8: Development Workflow

### 8a. Start All Services

Terminal 1 (Frontend):
```bash
cd PulseUp
npm run dev
# Runs on http://localhost:5173/
```

Terminal 2 (Backend):
```bash
cd PulseUp/backend
npm run dev
# Runs on http://localhost:3000/
```

Terminal 3 (Supabase):
```bash
cd PulseUp
supabase start
# Runs on http://localhost:54321/
# Studio on http://localhost:54323
```

### 8b. Daily Development

1. **Make changes** to frontend or backend code
2. **Nodemon** (backend) and **Vite** (frontend) auto-reload
3. **Test** at http://localhost:5173/
4. **View logs** in respective terminal
5. **Check database** in Supabase Studio

### 8c. Stopping Services

```bash
# Terminal 1: Ctrl+C (stops frontend)
# Terminal 2: Ctrl+C (stops backend)
# Terminal 3: supabase stop (stops Supabase)
```

---

## Step 9: Testing Setup

### 9a. Frontend Testing (Vitest)

```bash
cd PulseUp

# Install dependencies
npm install -D vitest @testing-library/dom @testing-library/user-event

# Run tests
npm test

# Watch mode
npm test -- --watch
```

### 9b. Backend Testing (Jest)

```bash
cd PulseUp/backend

# Already installed in Step 4b
npm test

# Watch mode
npm run test:watch
```

### 9c. E2E Testing (Playwright - Optional for now)

```bash
npm install -D @playwright/test

# Create tests/ directory
mkdir -p tests/e2e

# Run E2E tests
npx playwright test
```

---

## Troubleshooting

### Issue: Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5173`

**Solution**:
```bash
# Find process using port
lsof -i :5173  # macOS/Linux
netstat -ano | findstr :5173  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Issue: Supabase Connection Failed

**Error**: `Could not connect to Supabase`

**Solution**:
```bash
# Restart Supabase
supabase stop
supabase start

# Check Docker is running
docker ps
```

### Issue: npm Install Fails

**Error**: `npm ERR! code ERESOLVE`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Or use --legacy-peer-deps
npm install --legacy-peer-deps
```

### Issue: Database Connection Refused

**Error**: `could not connect to server: Connection refused`

**Solution**:
```bash
# Check Supabase is running
supabase status

# Start if not running
supabase start

# Verify database URL in .env
echo $SUPABASE_DATABASE_URL
```

### Issue: Frontend Can't Reach Backend

**Error**: `fetch error` or `CORS error`

**Solution**:
1. Verify backend is running: `curl http://localhost:3000/health`
2. Check CORS config in backend:
   ```javascript
   app.use(cors({
     origin: 'http://localhost:5173',
     credentials: true
   }));
   ```
3. Check API URL in frontend .env.local

---

## Quick Reference Commands

```bash
# Frontend
npm run dev              # Start dev server
npm run build           # Build for production
npm test                # Run tests
npm lint                # Check code style

# Backend
npm run dev             # Start dev server with nodemon
npm start               # Start production server
npm test                # Run tests
npm run lint            # Check code style
npm run format          # Format code

# Supabase
supabase start          # Start local Supabase
supabase stop           # Stop local Supabase
supabase reset          # Reset database
supabase status         # Check status
supabase link           # Link to remote project

# Git
git status              # Check changes
git add .               # Stage changes
git commit -m "msg"     # Commit changes
git push                # Push to remote
git pull                # Pull from remote
```

---

## Verification Checklist

After setup, verify everything works:

- [ ] Node.js 18+ installed: `node --version`
- [ ] npm 9+ installed: `npm --version`
- [ ] Git installed: `git --version`
- [ ] Docker running: `docker ps`
- [ ] Repository cloned: `ls -la PulseUp/`
- [ ] Frontend dependencies installed: `ls PulseUp/node_modules`
- [ ] Frontend dev server running: http://localhost:5173/ (in browser)
- [ ] Backend dependencies installed: `ls PulseUp/backend/node_modules`
- [ ] Backend dev server running: http://localhost:3000/health (returns JSON)
- [ ] Supabase running: `supabase status`
- [ ] Database tables created: Check in Supabase Studio
- [ ] .env files configured: Check frontend and backend .env files
- [ ] Can fetch from API: `curl http://localhost:3000/health`

---

## Next Steps

1. **Choose your first task**: Pick a P0 feature from the product audit
2. **Read the specification**: Review P0-01-AUTHENTICATION-SPEC.md or similar
3. **Start development**: Create a feature branch and begin coding
4. **Run tests**: Ensure code quality with unit and integration tests
5. **Submit PR**: Create a pull request for review

---

## Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev/
- **Express Docs**: https://expressjs.com/
- **Node.js Docs**: https://nodejs.org/en/docs/
- **Git Docs**: https://git-scm.com/doc

---

**Status**: Ready for Development  
**Last Checked**: Phase 3  
**Maintained By**: PulseUp Development Team
