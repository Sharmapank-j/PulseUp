# P0 Feature: User Authentication & Onboarding

**Priority**: P0 (Critical - blocks everything)  
**Timeline**: 4 weeks  
**Status**: Specification Phase  
**Effort**: High  
**Dependencies**: None (foundation feature)

---

## Overview

User authentication is the foundation of PulseUp. Without it, there is no user isolation, no personalization, and no real product. This specification details the complete authentication system and onboarding flow.

---

## User Stories

### Story 1: User Registration
**As a** medical professional  
**I want to** create a PulseUp account  
**So that** I can access the platform and set my goals

**Acceptance Criteria**:
- [ ] User can access signup page via `/auth/signup`
- [ ] User can enter email and password
- [ ] User can agree to terms of service
- [ ] System validates email format
- [ ] System validates password strength (min 8 chars, mixed case, number)
- [ ] System checks for duplicate email
- [ ] Email verification link is sent
- [ ] User cannot access app until email verified
- [ ] Error messages are clear and actionable

---

### Story 2: Email Verification
**As a** user who just signed up  
**I want to** verify my email address  
**So that** my account is activated and I can log in

**Acceptance Criteria**:
- [ ] Email contains verification link with token
- [ ] Link is valid for 24 hours
- [ ] Clicking link marks email as verified
- [ ] User redirected to create profile after verification
- [ ] Token cannot be reused
- [ ] Expired token shows error with resend option

---

### Story 3: User Login
**As a** registered user  
**I want to** log in with my email and password  
**So that** I can access my account and goals

**Acceptance Criteria**:
- [ ] User can access login page via `/auth/login`
- [ ] User enters email and password
- [ ] System validates credentials against database
- [ ] Correct credentials generate JWT tokens
- [ ] Incorrect credentials show generic error (security)
- [ ] User rate limited to 5 failed attempts per hour
- [ ] Successful login redirects to home
- [ ] JWT stored securely in httpOnly cookie

---

### Story 4: Session Management
**As a** logged-in user  
**I want to** stay logged in while using the app  
**So that** I don't have to log in repeatedly

**Acceptance Criteria**:
- [ ] JWT tokens have 30-minute expiration
- [ ] Refresh tokens have 30-day expiration
- [ ] Automatic token refresh before expiry
- [ ] User logout clears all tokens
- [ ] Expired session redirects to login
- [ ] Concurrent session limit: 5 per user

---

### Story 5: Password Reset
**As a** user who forgot my password  
**I want to** reset it via email link  
**So that** I can access my account again

**Acceptance Criteria**:
- [ ] User can request password reset from login page
- [ ] Reset link sent to registered email
- [ ] Reset link valid for 1 hour
- [ ] Reset form enforces new password rules
- [ ] Old tokens invalidated after reset
- [ ] User confirmation email after reset

---

### Story 6: Profile Creation (Post-Auth)
**As a** newly verified user  
**I want to** complete my profile  
**So that** the system knows who I am and can personalize recommendations

**Acceptance Criteria**:
- [ ] User redirected to `/onboarding/profile` after email verification
- [ ] Can enter full name (required)
- [ ] Can enter headline (optional)
- [ ] Can enter college/institution (required)
- [ ] Can select stage: student/resident/faculty/other (required)
- [ ] Can upload profile photo (optional, max 5MB)
- [ ] Form validation shows real-time feedback
- [ ] Submit creates profile and redirects to next onboarding step

---

### Story 7: Initial Interest Setup
**As a** user completing onboarding  
**I want to** specify my initial interests/specialties  
**So that** the system can make relevant recommendations

**Acceptance Criteria**:
- [ ] User can select 3-5 medical specialties (multi-select)
- [ ] User can skip this step
- [ ] Selection stored and used for initial personalization
- [ ] Can be edited later in profile

---

### Story 8: Logout
**As a** logged-in user  
**I want to** log out  
**So that** others cannot access my account on this device

**Acceptance Criteria**:
- [ ] Logout button visible in user menu
- [ ] Clicking logout clears all tokens and sessions
- [ ] User redirected to login page
- [ ] Session invalidated on server
- [ ] Confirmation message shown

---

## Technical Specification

### Authentication Method: JWT with Supabase Auth

**Why Supabase Auth**:
- Built-in email verification
- Secure password storage (bcrypt)
- JWT token management
- Row-level security integration
- OAuth integration for future
- No vendor lock-in (standard JWT)

### Data Model

#### Supabase Auth Users (Built-in)
```sql
-- Managed by Supabase, we don't touch this
auth.users
├─ id (UUID)
├─ email (unique)
├─ password_hash (bcrypt)
├─ email_confirmed_at
├─ created_at
├─ updated_at
└─ ...other auth fields
```

#### Application Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL, -- Denormalized from auth.users for query efficiency
  full_name TEXT NOT NULL,
  headline TEXT,
  college TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('student', 'resident', 'faculty', 'other')),
  avatar_url TEXT,
  avatar_storage_path TEXT, -- For deletion
  specialties TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verification_badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

### API Endpoints

#### Authentication Endpoints

##### POST `/api/auth/signup`
**Purpose**: Create new user account

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "Arjun Rao",
  "college": "AIIMS New Delhi",
  "stage": "student"
}
```

**Response** (201):
```json
{
  "message": "Verification email sent. Please check your inbox.",
  "email": "user@example.com"
}
```

**Errors**:
- 400: Invalid email format
- 400: Password too weak
- 409: Email already registered
- 422: Missing required fields
- 500: Internal server error

**Validations**:
- Email: valid format, max 255 chars
- Password: min 8 chars, must include: uppercase, lowercase, number
- Full name: 2-100 chars, no special chars
- College: 2-100 chars

---

##### POST `/api/auth/verify-email`
**Purpose**: Verify email address with token from email link

**Request**:
```json
{
  "token": "email_verification_token_from_email"
}
```

**Response** (200):
```json
{
  "message": "Email verified successfully",
  "redirect": "/onboarding/profile"
}
```

**Errors**:
- 400: Invalid or expired token
- 400: Email already verified
- 500: Internal server error

---

##### POST `/api/auth/login`
**Purpose**: Authenticate user and create session

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response** (200):
```json
{
  "access_token": "jwt_token_with_30min_expiry",
  "refresh_token": "jwt_token_with_30day_expiry",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "full_name": "Arjun Rao"
  },
  "redirect": "/home"
}
```

**Errors**:
- 401: Invalid email or password (generic)
- 429: Too many login attempts (rate limited)
- 500: Internal server error

**Rate Limiting**:
- 5 failed attempts = 1 hour lockout
- Lock by IP + email combination

---

##### POST `/api/auth/refresh`
**Purpose**: Refresh expired access token

**Request** (uses refresh_token cookie):
```json
{}
```

**Response** (200):
```json
{
  "access_token": "new_jwt_with_30min_expiry"
}
```

**Errors**:
- 401: Refresh token expired or invalid
- 401: Refresh token revoked
- 500: Internal server error

---

##### POST `/api/auth/logout`
**Purpose**: End user session

**Request** (uses auth header):
```json
{}
```

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

**Side Effects**:
- Access token invalidated
- Refresh token revoked
- Session cleared on server

---

##### POST `/api/auth/forgot-password`
**Purpose**: Request password reset

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200):
```json
{
  "message": "If account exists, reset email has been sent"
}
```

**Notes**:
- Generic message (security - don't reveal if email exists)
- Reset link valid for 1 hour
- Email contains reset token

---

##### POST `/api/auth/reset-password`
**Purpose**: Reset password with token

**Request**:
```json
{
  "token": "password_reset_token_from_email",
  "new_password": "NewSecurePass456"
}
```

**Response** (200):
```json
{
  "message": "Password reset successfully. Please log in."
}
```

**Errors**:
- 400: Invalid or expired token
- 400: New password too weak
- 401: Token already used
- 500: Internal server error

---

##### GET `/api/auth/me`
**Purpose**: Get current user info

**Request** (uses auth header):
```
Authorization: Bearer {access_token}
```

**Response** (200):
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "full_name": "Arjun Rao",
  "profile": {
    "headline": "Medical Student",
    "college": "AIIMS New Delhi",
    "stage": "student",
    "avatar_url": "https://...",
    "specialties": ["cardiology", "research"]
  }
}
```

**Errors**:
- 401: Unauthorized (no token or invalid token)
- 500: Internal server error

---

#### Profile Endpoints

##### PATCH `/api/profile`
**Purpose**: Update current user profile

**Request** (uses auth header):
```json
{
  "full_name": "Arjun Rao",
  "headline": "Final Year Medical Student",
  "college": "AIIMS New Delhi",
  "stage": "student",
  "bio": "Interested in cardiology and research",
  "specialties": ["cardiology", "research"]
}
```

**Response** (200):
```json
{
  "message": "Profile updated successfully",
  "profile": { ...updated profile }
}
```

**Errors**:
- 400: Invalid field values
- 401: Unauthorized
- 422: Validation failed
- 500: Internal server error

---

##### POST `/api/profile/avatar`
**Purpose**: Upload profile picture

**Request** (multipart/form-data):
```
Content-Type: multipart/form-data
Authorization: Bearer {access_token}

[file binary data]
```

**Response** (200):
```json
{
  "message": "Avatar uploaded successfully",
  "avatar_url": "https://storage.url/..."
}
```

**Constraints**:
- Max file size: 5 MB
- Allowed formats: JPEG, PNG, WebP
- Dimensions: min 100x100, max 2000x2000
- Stored in Supabase Storage under `avatars/{user_id}`

**Errors**:
- 400: Invalid file format
- 413: File too large
- 401: Unauthorized
- 500: Internal server error

---

### Frontend Components

#### Login Page (`/auth/login`)
- Email input field
- Password input field
- "Forgot password?" link
- "Sign up" link
- Submit button
- Error message display
- Loading state during submission
- Redirect to home on success

#### Signup Page (`/auth/signup`)
- Email input with validation
- Password input with strength indicator
- Confirm password input
- Full name input
- College selector (autocomplete)
- Stage selector (dropdown)
- Terms of service checkbox
- Submit button
- Link to login page
- Error display
- Loading state

#### Email Verification Page (`/auth/verify-email`)
- Message: "Verification email sent to [email]"
- "Resend verification email" button
- "Wrong email? Edit" button
- Auto-redirect after verification
- Error handling for expired tokens

#### Onboarding Profile Page (`/onboarding/profile`)
- Avatar upload with preview
- Full name (pre-filled from signup)
- Headline input
- College (pre-filled)
- Stage (pre-filled)
- Bio textarea
- Specialties multi-select
- Skip button (optional)
- Continue button
- Progress indicator (Step X of Y)

#### Forgot Password Page (`/auth/forgot-password`)
- Email input
- Submit button
- "Back to login" link
- Confirmation message after submit

#### Reset Password Page (`/auth/reset-password?token=xxx`)
- New password input with strength indicator
- Confirm password input
- Submit button
- Error handling for expired tokens
- Auto-redirect to login on success

---

### Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SIGNUP FLOW                              │
└─────────────────────────────────────────────────────────────┘

User enters email/password
         ↓
POST /api/auth/signup
         ↓
Validate email format & password strength
         ↓
Check for duplicate email
         ↓
Create auth.users record (Supabase Auth)
         ↓
Create profiles record (status: unverified)
         ↓
Send verification email with token (expires 24h)
         ↓
User receives email
         ↓
User clicks verification link
         ↓
POST /api/auth/verify-email with token
         ↓
Mark email_confirmed_at in auth.users
         ↓
Redirect to /onboarding/profile
         ↓
User completes profile
         ↓
PATCH /api/profile
         ↓
Redirect to /home
         ↓
✅ ACCOUNT READY


┌─────────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                               │
└─────────────────────────────────────────────────────────────┘

User enters email/password
         ↓
POST /api/auth/login
         ↓
Validate email exists in auth.users
         ↓
Validate password matches (bcrypt)
         ↓
Check email_confirmed_at (must be set)
         ↓
Generate JWT access token (30 min expiry)
         ↓
Generate JWT refresh token (30 day expiry)
         ↓
Store refresh token in HTTP-only cookie
         ↓
Return access token to client
         ↓
Client stores access token in memory
         ↓
Add Authorization: Bearer {token} to all requests
         ↓
✅ USER AUTHENTICATED


┌─────────────────────────────────────────────────────────────┐
│                 TOKEN REFRESH FLOW                          │
└─────────────────────────────────────────────────────────────┘

Access token about to expire (< 5 min left)
         ↓
Frontend detects expiry from JWT payload
         ↓
POST /api/auth/refresh (with refresh token in cookie)
         ↓
Validate refresh token is valid and not expired
         ↓
Generate new access token (30 min expiry)
         ↓
Return new access token
         ↓
Client stores new access token
         ↓
Continue with requests using new token
         ↓
✅ SESSION EXTENDED


┌─────────────────────────────────────────────────────────────┐
│                   LOGOUT FLOW                               │
└─────────────────────────────────────────────────────────────┘

User clicks logout
         ↓
POST /api/auth/logout (with access token)
         ↓
Invalidate refresh token in database
         ↓
Clear HTTP-only refresh token cookie
         ↓
Return success message
         ↓
Client clears access token from memory
         ↓
Redirect to /auth/login
         ↓
✅ LOGGED OUT
```

---

## Security Requirements

### Password Security
- Minimum 8 characters
- Must include: uppercase, lowercase, number
- Must NOT include username or email
- Must NOT be previously used (track last 5 passwords)
- Stored as bcrypt hash (salt cost: 12)

### Token Security
- Access tokens: 30 minute expiry
- Refresh tokens: 30 day expiry
- Tokens: JWT with RS256 algorithm
- Refresh token stored in HTTP-only, secure, SameSite cookie
- Access token stored in memory (XSS-vulnerable but session-limited)
- All tokens signed with private key
- Token revocation on logout

### Session Security
- Max 5 concurrent sessions per user
- Rate limiting: 5 failed logins = 1 hour lockout
- Brute force protection on login
- CSRF tokens required on state-changing endpoints
- Email confirmation required before login

### Data Protection
- Emails never shown in error messages
- Password never logged
- Reset tokens single-use, 1 hour expiry
- Verification tokens single-use, 24 hour expiry
- All auth endpoints require HTTPS

---

## Testing Strategy

### Unit Tests
- Email validation
- Password strength validation
- Password reset token generation
- Email verification token generation
- Token expiry calculation
- JWT signature verification

### Integration Tests
- Complete signup flow
- Email verification flow
- Login with valid credentials
- Login with invalid credentials
- Token refresh flow
- Logout flow
- Password reset flow
- Session management (concurrent logins)

### End-to-End Tests
- User signup to home page journey
- User login from cold start
- User logout and re-login
- Token refresh during navigation
- Session timeout behavior
- Email verification timeout

### Security Tests
- SQL injection attempts
- XSS in form fields
- CSRF attacks
- Brute force attempts
- Invalid token handling
- Expired token handling
- Concurrent session limits
- Rate limiting validation

---

## Database Migrations

### Migration 1: Create Auth Tables
```sql
-- Supabase creates auth.users automatically
-- Create profiles table

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  headline TEXT,
  college TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('student', 'resident', 'faculty', 'other')),
  avatar_url TEXT,
  avatar_storage_path TEXT,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verification_badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are public readable"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_college ON profiles(college);
CREATE INDEX idx_profiles_stage ON profiles(stage);
```

### Migration 2: Create Password Reset Tokens Table
```sql
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see own tokens"
  ON public.password_reset_tokens FOR SELECT 
  USING (auth.uid() = user_id);

CREATE INDEX idx_password_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_expires_at ON password_reset_tokens(expires_at);
```

---

## Implementation Checklist

### Week 1: Supabase Setup & Backend Structure
- [ ] Create Supabase project
- [ ] Configure authentication settings
- [ ] Create database tables (migrations)
- [ ] Set up Row Level Security (RLS) policies
- [ ] Configure email templates
- [ ] Set up Node.js backend project
- [ ] Configure environment variables

### Week 2: Authentication Endpoints
- [ ] Implement POST /api/auth/signup
- [ ] Implement POST /api/auth/verify-email
- [ ] Implement POST /api/auth/login
- [ ] Implement POST /api/auth/refresh
- [ ] Implement POST /api/auth/logout
- [ ] Implement password reset flow
- [ ] Add comprehensive error handling

### Week 3: Frontend Pages & Integration
- [ ] Create login page component
- [ ] Create signup page component
- [ ] Create email verification page
- [ ] Create profile completion page
- [ ] Integrate with backend APIs
- [ ] Implement token storage/retrieval
- [ ] Add loading states and error handling

### Week 4: Security & Testing
- [ ] Add rate limiting
- [ ] Add CSRF protection
- [ ] Implement password validation
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add E2E tests
- [ ] Security audit
- [ ] Performance testing

---

## Success Criteria

✅ Users can complete signup → verification → profile creation → login cycle  
✅ All authentication endpoints return correct status codes  
✅ Tokens refresh automatically before expiry  
✅ Rate limiting prevents brute force  
✅ CSRF protection on all state-changing endpoints  
✅ No secrets in logs or error messages  
✅ Test coverage > 80%  
✅ Login/signup pages load in < 2 seconds  
✅ Fully documented API  

---

## Dependencies

- Supabase client library
- JWT library for verification
- Email sending service (Resend or SendGrid)
- Zod for schema validation
- bcryptjs for password hashing (if not using Supabase)

---

## Known Decisions

✅ Using Supabase Auth (built-in, secure, integrated)  
✅ JWT tokens (standard, stateless)  
✅ 30-min access token expiry (security vs. UX balance)  
✅ HTTP-only cookies for refresh tokens (XSS protection)  
✅ Email verification required (spam prevention)  
✅ Strong password requirements (security baseline)  
✅ Rate limiting on login (brute force protection)  

---

**Status**: Specification Complete  
**Next Step**: Create P0 Profile Specification  
**Est. Dev Start**: After all P0 specs complete
