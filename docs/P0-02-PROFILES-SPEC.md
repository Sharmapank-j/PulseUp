# P0 Feature: User Profiles & Profile Management

**Priority**: P0 (Critical - blocks personalization)  
**Timeline**: 3 weeks  
**Status**: Specification Phase  
**Effort**: Medium  
**Dependencies**: P0 Authentication (must complete first)

---

## Overview

User profiles are the core of personalization in PulseUp. A complete profile enables the AI mentor to understand context, recommend relevant goals, and match with mentors and communities.

---

## User Stories

### Story 1: Profile Display
**As a** logged-in user  
**I want to** see my complete profile  
**So that** I can verify my information is correct

**Acceptance Criteria**:
- [ ] Profile page accessible at `/profile`
- [ ] Can view all my profile information
- [ ] Profile information matches database
- [ ] Avatar displays correctly
- [ ] Edit button visible
- [ ] Loading state shown while fetching

---

### Story 2: Profile Editing
**As a** a user  
**I want to** edit my profile information  
**So that** I can keep my information current

**Acceptance Criteria**:
- [ ] Click edit button opens edit mode
- [ ] All fields editable except email
- [ ] Changes saved on submit
- [ ] Success message shown
- [ ] Can cancel edits without saving
- [ ] Form validation prevents invalid data

---

### Story 3: Specialties Management
**As a** a medical professional  
**I want to** manage my specialties/interests  
**So that** I receive recommendations aligned with my interests

**Acceptance Criteria**:
- [ ] Can select/deselect multiple specialties
- [ ] Specialties persist to database
- [ ] Changes used for personalization
- [ ] Can change specialties anytime
- [ ] Clear indication of selected specialties

---

### Story 4: Skills & Expertise
**As a** an experienced professional  
**I want to** list my skills and expertise  
**So that** I can be matched with mentees who need my expertise

**Acceptance Criteria**:
- [ ] Can add multiple skills (text input)
- [ ] Can remove skills
- [ ] Can set skill proficiency level (beginner/intermediate/advanced)
- [ ] Skills stored in database
- [ ] Skills used for mentee matching
- [ ] Validation prevents empty/duplicate skills

---

### Story 5: Professional Links
**As a** a user  
**I want to** add links to my professional profiles  
**So that** mentees can learn more about me

**Acceptance Criteria**:
- [ ] Can add LinkedIn profile URL
- [ ] Can add Twitter profile URL
- [ ] Can add personal website URL
- [ ] Links stored in database
- [ ] Links displayed on profile view
- [ ] URL validation ensures valid format

---

### Story 6: Profile Visibility
**As a** a user  
**I want to** control who can see my profile  
**So that** I can protect my privacy

**Acceptance Criteria**:
- [ ] Can set profile to "Private" (only me + mentors)
- [ ] Can set profile to "Public" (visible to all users)
- [ ] Can set profile to "Mentors Only" (visible to my mentors)
- [ ] Default is "Public"
- [ ] Setting persists to database
- [ ] Query permissions respect visibility setting

---

### Story 7: Interests & Goals
**As a** a user  
**I want to** describe my career interests and goals  
**So that** I can get personalized recommendations

**Acceptance Criteria**:
- [ ] Can add long-form text about career interests
- [ ] Can add desired career trajectory
- [ ] Text stored and displayed
- [ ] Can edit anytime
- [ ] Used by AI mentor for personalization

---

### Story 8: Verification Badge
**As a** a user with verified medical credentials  
**I want to** have a verification badge  
**So that** other users know I'm a real medical professional

**Acceptance Criteria**:
- [ ] Verification badge displays on profile (future: after verification)
- [ ] Badge visible on profile card in search results
- [ ] Badge tooltip explains verification
- [ ] Not visible until verified
- [ ] Verification status tracked in database

---

## Technical Specification

### Data Model

#### Profiles Table (Enhanced from Auth Spec)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  headline TEXT,
  college TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('student', 'resident', 'faculty', 'other')),
  
  -- Bio & Career
  bio TEXT,
  career_interests TEXT,
  career_trajectory TEXT,
  
  -- Images
  avatar_url TEXT,
  avatar_storage_path TEXT,
  
  -- Specialties & Skills
  specialties TEXT[] NOT NULL DEFAULT '{}',
  skills JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{name, level}]
  
  -- Professional Links
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  
  -- Verification
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verification_badges TEXT[] DEFAULT '{}',
  verification_document_url TEXT,
  verification_submitted_at TIMESTAMPTZ,
  
  -- Privacy
  profile_visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (profile_visibility IN ('public', 'private', 'mentors_only')),
  
  -- Metadata
  profile_completeness INTEGER DEFAULT 0, -- 0-100%
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_stage ON profiles(stage);
CREATE INDEX idx_profiles_specialties ON profiles USING GIN(specialties);
CREATE INDEX idx_profiles_visibility ON profiles(profile_visibility);
CREATE INDEX idx_profiles_verification ON profiles(verification_status);
```

#### Skills Schema (JSONB)
```jsonschema
{
  "type": "array",
  "items": {
    "type": "object",
    "required": ["name", "level"],
    "properties": {
      "name": {
        "type": "string",
        "description": "Skill name (e.g., 'Echocardiography')"
      },
      "level": {
        "type": "string",
        "enum": ["beginner", "intermediate", "advanced"],
        "description": "Proficiency level"
      },
      "years": {
        "type": "integer",
        "description": "Years of experience (optional)"
      }
    }
  }
}
```

---

### API Endpoints

#### GET `/api/profile/:userId`
**Purpose**: Get user profile (public or private based on visibility)

**Request** (uses auth header for private fields):
```
Authorization: Bearer {access_token}
```

**Response** (200):
```json
{
  "id": "user-uuid",
  "full_name": "Arjun Rao",
  "headline": "Final Year Medical Student",
  "college": "AIIMS New Delhi",
  "stage": "student",
  "bio": "Interested in cardiology research",
  "career_interests": "Interventional cardiology",
  "career_trajectory": "MD → Fellowship → Practice",
  "avatar_url": "https://...",
  "specialties": ["cardiology", "research", "teaching"],
  "skills": [
    { "name": "Echocardiography", "level": "advanced", "years": 3 },
    { "name": "Catheterization", "level": "intermediate", "years": 2 }
  ],
  "linkedin_url": "https://linkedin.com/in/...",
  "twitter_url": "https://twitter.com/...",
  "website_url": "https://...",
  "verification_status": "verified",
  "verification_badges": ["medical_license", "board_certified"],
  "profile_visibility": "public",
  "profile_completeness": 85,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-20T15:30:00Z"
}
```

**Errors**:
- 404: User not found
- 403: Profile private and not authorized
- 500: Internal server error

---

#### GET `/api/profile`
**Purpose**: Get current user's profile

**Request** (uses auth header):
```
Authorization: Bearer {access_token}
```

**Response** (200):
```json
{
  // Same as GET /api/profile/:userId but always includes private fields
}
```

**Errors**:
- 401: Unauthorized
- 500: Internal server error

---

#### PATCH `/api/profile`
**Purpose**: Update current user's profile

**Request**:
```json
{
  "headline": "PGY-2 Resident",
  "bio": "Passionate about cardiology research",
  "career_interests": "Academic medicine",
  "specialties": ["cardiology", "research"],
  "skills": [
    { "name": "Echocardiography", "level": "advanced" },
    { "name": "Catheterization", "level": "intermediate" }
  ],
  "linkedin_url": "https://linkedin.com/in/arjun-rao",
  "twitter_url": "https://twitter.com/arjun_rao",
  "website_url": "https://arjunrao.dev",
  "profile_visibility": "public"
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

**Validations**:
- LinkedIn URL: valid URL format
- Twitter URL: valid URL or username
- Website: valid URL format
- Skills: max 20, unique names
- Specialties: from predefined list
- Career interests: max 500 chars
- Profile visibility: one of (public, private, mentors_only)

---

#### POST `/api/profile/avatar`
**Purpose**: Upload or update profile avatar

**Request** (multipart/form-data):
```
Authorization: Bearer {access_token}
[image file - max 5MB]
```

**Response** (200):
```json
{
  "message": "Avatar uploaded successfully",
  "avatar_url": "https://storage.url/avatars/user-uuid/avatar.webp"
}
```

**Constraints**:
- Max 5 MB
- Formats: JPEG, PNG, WebP
- Min dimensions: 100x100
- Max dimensions: 2000x2000
- Stored as WebP (auto-converted)
- Old avatar deleted

**Errors**:
- 400: Invalid file format
- 413: File too large
- 401: Unauthorized
- 500: Internal server error

---

#### DELETE `/api/profile/avatar`
**Purpose**: Remove profile avatar

**Request**:
```
Authorization: Bearer {access_token}
```

**Response** (200):
```json
{
  "message": "Avatar deleted successfully"
}
```

---

#### GET `/api/profile/suggestions`
**Purpose**: Get profile completion suggestions

**Request**:
```
Authorization: Bearer {access_token}
```

**Response** (200):
```json
{
  "profile_completeness": 65,
  "missing_fields": [
    "skills",
    "linkedin_url",
    "verification"
  ],
  "suggestions": [
    {
      "field": "skills",
      "priority": "high",
      "description": "Adding skills helps with mentee matching"
    },
    {
      "field": "verification",
      "priority": "medium",
      "description": "Verify your medical credentials to build trust"
    }
  ]
}
```

---

#### PUT `/api/profile/specialties`
**Purpose**: Update user specialties

**Request**:
```json
{
  "specialties": ["cardiology", "research", "teaching"]
}
```

**Response** (200):
```json
{
  "message": "Specialties updated successfully",
  "specialties": ["cardiology", "research", "teaching"]
}
```

**Validations**:
- From predefined specialty list
- Max 10 specialties
- No duplicates

**Errors**:
- 400: Invalid specialty
- 422: Too many specialties
- 401: Unauthorized

---

#### PUT `/api/profile/skills`
**Purpose**: Update user skills

**Request**:
```json
{
  "skills": [
    { "name": "Echocardiography", "level": "advanced", "years": 5 },
    { "name": "Clinical Research", "level": "intermediate", "years": 2 }
  ]
}
```

**Response** (200):
```json
{
  "message": "Skills updated successfully",
  "skills": [ ... ]
}
```

**Validations**:
- Skill name: 2-50 chars
- Level: beginner/intermediate/advanced
- Years: 0-50 (optional)
- Max 20 skills
- No duplicate names (case-insensitive)

**Errors**:
- 400: Invalid skill data
- 422: Validation failed
- 401: Unauthorized

---

#### GET `/api/specialties`
**Purpose**: Get predefined specialty list

**Request**:
```
Authorization: Bearer {access_token}
```

**Response** (200):
```json
{
  "specialties": [
    {
      "id": "cardiology",
      "name": "Cardiology",
      "category": "Clinical"
    },
    {
      "id": "surgery",
      "name": "Surgery",
      "category": "Clinical"
    },
    {
      "id": "research",
      "name": "Clinical Research",
      "category": "Academic"
    },
    // ... 20+ more
  ]
}
```

---

### Frontend Components

#### Profile View Page (`/profile`)
- Avatar with fallback initials
- Full name (heading)
- Headline (subheading)
- College & stage
- Verification badge (if applicable)
- Bio section
- Career interests & trajectory
- Specialties tags
- Skills section with proficiency levels
- Professional links (LinkedIn, Twitter, Website)
- Profile visibility indicator
- Edit button (only if own profile)
- Share button
- Loading state

#### Profile Edit Page (`/profile/edit`)
- Avatar upload/change with preview
- Full name (read-only)
- Headline input
- College (read-only)
- Stage (read-only)
- Bio textarea
- Career interests textarea
- Career trajectory textarea
- Specialties multi-select
- Skills manager (add/edit/remove)
- LinkedIn URL input
- Twitter URL input
- Website URL input
- Profile visibility selector
- Save button
- Cancel button
- Unsaved changes warning

#### Profile Completion Widget
- Progress bar (0-100%)
- List of missing fields with priority
- Links to complete each field
- Estimated time to complete

#### Specialties Selector
- Multi-select dropdown
- Search/filter capability
- Category grouping
- Max 10 selections
- Visual indication of selected items

#### Skills Manager
- List of current skills
- Add skill button
- For each skill:
  - Skill name
  - Proficiency level selector
  - Years of experience input
  - Delete button
  - Edit button

---

### Row Level Security (RLS) Policies

```sql
-- Profiles RLS

-- Everyone can read public profiles
CREATE POLICY "Read public profiles"
  ON profiles FOR SELECT
  USING (profile_visibility = 'public');

-- Users can read private profiles if they're connected as mentors
CREATE POLICY "Read private profiles if mentor"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id OR
    profile_visibility = 'public' OR
    (profile_visibility = 'mentors_only' AND 
     EXISTS (
       SELECT 1 FROM mentorships 
       WHERE (mentor_id = auth.uid() AND mentee_id = id) 
          OR (mentee_id = auth.uid() AND mentor_id = id)
     ))
  );

-- Users can update their own profile
CREATE POLICY "Update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

---

### Profile Completeness Calculation

```
Completion % = (filled_fields / total_fields) * 100

Required fields (must have):
- full_name ✓ (from auth)
- headline
- college ✓ (from signup)
- stage ✓ (from signup)
- avatar

Valuable fields (boost score):
- bio
- specialties (≥1)
- skills (≥2)
- career_interests
- career_trajectory

Professional fields (optional):
- linkedin_url
- twitter_url
- website_url
- verification

Scoring:
- 0-25%: Missing key fields
- 25-50%: Has basics, missing content
- 50-75%: Good profile, missing professional links
- 75-100%: Comprehensive profile

Triggers:
- < 50%: Show completion suggestions
- < 75%: Show "Complete your profile" nudge
- 100%: Show "Profile complete" badge
```

---

### Database Migrations

#### Migration 1: Create Enhanced Profiles Table
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  headline TEXT,
  college TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('student', 'resident', 'faculty', 'other')),
  bio TEXT DEFAULT '',
  career_interests TEXT DEFAULT '',
  career_trajectory TEXT DEFAULT '',
  avatar_url TEXT,
  avatar_storage_path TEXT,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  verification_badges TEXT[] DEFAULT '{}',
  verification_document_url TEXT,
  verification_submitted_at TIMESTAMPTZ,
  profile_visibility TEXT NOT NULL DEFAULT 'public',
  profile_completeness INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_stage ON profiles(stage);
CREATE INDEX idx_profiles_specialties ON profiles USING GIN(specialties);
CREATE INDEX idx_profiles_visibility ON profiles(profile_visibility);
```

#### Migration 2: Create Specialties Reference Table
```sql
CREATE TABLE IF NOT EXISTS public.specialties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- Clinical, Academic, Technical, etc
  icon_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert specialty options
INSERT INTO specialties (id, name, category) VALUES
  ('cardiology', 'Cardiology', 'Clinical'),
  ('surgery', 'Surgery', 'Clinical'),
  ('internal-medicine', 'Internal Medicine', 'Clinical'),
  ('pediatrics', 'Pediatrics', 'Clinical'),
  ('obstetrics', 'Obstetrics & Gynecology', 'Clinical'),
  ('neurology', 'Neurology', 'Clinical'),
  ('psychiatry', 'Psychiatry', 'Clinical'),
  ('orthopedics', 'Orthopedics', 'Clinical'),
  ('dermatology', 'Dermatology', 'Clinical'),
  ('radiology', 'Radiology', 'Clinical'),
  ('pathology', 'Pathology', 'Clinical'),
  ('anesthesia', 'Anesthesia', 'Clinical'),
  ('oncology', 'Oncology', 'Clinical'),
  ('research', 'Clinical Research', 'Academic'),
  ('teaching', 'Medical Education', 'Academic'),
  ('administration', 'Healthcare Administration', 'Academic'),
  ('public-health', 'Public Health', 'Academic'),
  ('medical-informatics', 'Medical Informatics', 'Technical'),
  ('ai-ml', 'AI & Machine Learning', 'Technical'),
  ('biotech', 'Biotechnology', 'Technical');
```

---

## Implementation Checklist

### Week 1: Database & Backend Setup
- [ ] Create enhanced profiles table with all fields
- [ ] Create specialties reference table
- [ ] Set up Supabase Storage for avatars
- [ ] Implement RLS policies
- [ ] Create database migrations

### Week 2: Backend Endpoints
- [ ] Implement GET /api/profile/:userId
- [ ] Implement GET /api/profile
- [ ] Implement PATCH /api/profile
- [ ] Implement avatar upload/delete
- [ ] Implement skills management endpoints
- [ ] Implement specialties endpoint
- [ ] Add comprehensive validation
- [ ] Add error handling

### Week 3: Frontend & Integration
- [ ] Create profile view page
- [ ] Create profile edit page
- [ ] Implement specialties selector component
- [ ] Implement skills manager component
- [ ] Integrate with backend APIs
- [ ] Add form validation
- [ ] Add loading/error states
- [ ] Add success messages
- [ ] Profile completeness calculation
- [ ] Responsive design for mobile

---

## Testing Strategy

### Unit Tests
- Profile completeness calculation
- Skill validation
- URL validation
- Specialties filtering
- Visibility logic

### Integration Tests
- Complete profile creation after signup
- Profile retrieval with visibility rules
- Profile update with all fields
- Avatar upload and deletion
- Skills and specialties management

### E2E Tests
- User signup → profile completion journey
- View own profile
- Edit own profile
- Upload avatar
- Add skills and specialties
- View other users' profiles (respect visibility)

### Security Tests
- Cannot update other users' profiles
- Private profiles hidden from unauthorized users
- Visibility settings respected in queries
- Avatar upload validation

---

## Success Criteria

✅ Profile completeness calculated correctly  
✅ Avatar upload and storage working  
✅ Specialties and skills management functional  
✅ Visibility settings respected  
✅ Test coverage > 80%  
✅ Profile loads in < 1 second  
✅ Mobile responsive  

---

## Dependencies

- Supabase client (already in use)
- Image processing library (sharp/imagemin)
- Form validation library (Zod)
- Multi-select component library

---

**Status**: Specification Complete  
**Blocking**: Authentication must be complete first  
**Next Step**: Create P0 Goals Specification  
**Est. Dev Start**: Week 5-6 (after auth complete)
