# Testing Strategy & Test Coverage Plan

**Purpose**: Define comprehensive testing approach for PulseUp  
**Target Audience**: QA engineers, backend engineers, frontend engineers  
**Estimated Time**: Reference document, ongoing  
**Last Updated**: Phase 3

---

## Testing Philosophy

**Goal**: Ship features with confidence, catch bugs early, automate regressions

**Key Principles**:
1. **Test Pyramid**: 70% unit tests, 20% integration tests, 10% E2E tests
2. **Fast Feedback**: Unit tests < 1 sec, integration < 10 sec, E2E < 5 min each
3. **Coverage Target**: 80% for critical paths, 60% overall
4. **Write Tests First**: TDD for P0 features, opportunistic for others
5. **Automate Everything**: All tests run on PR, merge gate

---

## Testing Levels

### 1. Unit Tests (70%)

**What**: Test individual functions/components in isolation

**Tools**:
- **Backend**: Jest + supertest for API mocks
- **Frontend**: Vitest + @testing-library/dom

**Scope**: Functions, utilities, validators, business logic

**Example - Password Validator**:
```javascript
// backend/src/utils/password.test.js
import { validatePassword } from './password';

describe('validatePassword', () => {
  it('rejects password < 8 chars', () => {
    expect(validatePassword('short1')).toEqual({
      valid: false,
      errors: ['Too short']
    });
  });

  it('requires uppercase', () => {
    expect(validatePassword('alllowercase1')).toHaveProperty('valid', false);
  });

  it('accepts valid password', () => {
    expect(validatePassword('ValidPass123')).toEqual({ valid: true });
  });
});
```

**Coverage Goals by Module**:
| Module | Target | Owner |
|--------|--------|-------|
| Auth validators | 95% | Backend |
| Profile utilities | 90% | Backend |
| Form validators | 90% | Frontend |
| Goal decomposition | 85% | Backend |
| UI components | 60% | Frontend |
| API middleware | 90% | Backend |

---

### 2. Integration Tests (20%)

**What**: Test components/services working together

**Tools**:
- **Backend**: Jest + test database + Supabase test fixture
- **Frontend**: Vitest + Mock Service Worker (MSW)

**Scope**: API endpoints, database queries, multi-step flows

**Example - Auth Integration**:
```javascript
// backend/tests/integration/auth.test.js
import { createTestClient } from '../helpers';

describe('Authentication Flow', () => {
  let client;
  
  beforeAll(() => {
    client = createTestClient();
  });

  it('complete signup → verification → login flow', async () => {
    // Step 1: Signup
    const signupRes = await client
      .post('/api/auth/signup')
      .send({
        email: 'user@example.com',
        password: 'ValidPass123',
        full_name: 'Test User'
      })
      .expect(201);

    expect(signupRes.body.message).toContain('verification email');

    // Step 2: Verify email (simulate clicking link)
    const token = await getVerificationToken('user@example.com');
    const verifyRes = await client
      .post('/api/auth/verify-email')
      .send({ token })
      .expect(200);

    expect(verifyRes.body.redirect).toContain('profile');

    // Step 3: Login
    const loginRes = await client
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'ValidPass123'
      })
      .expect(200);

    expect(loginRes.body.access_token).toBeDefined();
  });

  it('rate limits failed login attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await client
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrong'
        })
        .expect(401);
    }

    // 6th attempt should be rate limited
    const res = await client
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrong'
      });

    expect(res.status).toBe(429);
  });
});
```

**Coverage Goals by Feature**:
| Feature | Coverage | Owner |
|---------|----------|-------|
| Authentication | 100% | Backend |
| Profiles | 90% | Backend + Frontend |
| Goals | 85% | Backend + Frontend |
| AI Mentor | 80% | Backend |
| Mentorships | 80% | Backend |
| Dashboard | 70% | Frontend |

---

### 3. End-to-End Tests (10%)

**What**: Test complete user journeys from UI to database

**Tools**:
- Playwright or Cypress
- Run against staging environment

**Scope**: Critical user paths, happy path + error cases

**Example - New User Journey**:
```javascript
// tests/e2e/new-user-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('New User Journey', () => {
  test('signup → verify → profile → create goal', async ({ page }) => {
    // 1. Navigate to signup
    await page.goto('/auth/signup');
    expect(page).toHaveTitle(/Sign Up/);

    // 2. Fill signup form
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'ValidPass123');
    await page.fill('input[name="password_confirm"]', 'ValidPass123');
    await page.fill('input[name="full_name"]', 'New User');
    await page.selectOption('select[name="college"]', 'AIIMS');
    
    // 3. Submit signup
    await page.click('button:text("Sign Up")');
    
    // 4. Verify email confirmation message
    await expect(page.locator('text=verification email')).toBeVisible();

    // 5. Simulate email verification (test admin action)
    await verifyEmailViaTestAdmin('newuser@example.com');
    
    // 6. Refresh and should redirect to profile
    await page.reload();
    await expect(page).toHaveURL(/profile/);

    // 7. Complete profile
    await page.fill('input[name="headline"]', 'Medical Student');
    await page.fill('input[name="bio"]', 'Interested in cardiology');
    await page.click('button:text("Continue")');

    // 8. Should redirect to home
    await expect(page).toHaveURL(/home/);

    // 9. Click "Create Goal"
    await page.click('button:text("Create Goal")');
    
    // 10. Fill goal form
    await page.fill('input[name="title"]', 'Learn Echocardiography');
    await page.fill('textarea[name="description"]', 'Master echo imaging');
    await page.selectOption('select[name="timeline"]', '3-months');
    
    // 11. Submit goal
    await page.click('button:text("Create Goal")');
    
    // 12. Should see goal created
    await expect(page.locator('text=Goal created successfully')).toBeVisible();
    await expect(page.locator('text=Learn Echocardiography')).toBeVisible();
  });

  test('handles validation errors gracefully', async ({ page }) => {
    await page.goto('/auth/signup');

    // Try submitting empty form
    await page.click('button:text("Sign Up")');
    
    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();

    // Try invalid email
    await page.fill('input[name="email"]', 'not-an-email');
    await page.fill('input[name="password"]', 'ValidPass123');
    await page.click('button:text("Sign Up")');
    
    await expect(page.locator('text=Invalid email')).toBeVisible();

    // Try weak password
    await page.fill('input[name="email"]', 'valid@example.com');
    await page.fill('input[name="password"]', 'weak');
    await page.click('button:text("Sign Up")');
    
    await expect(page.locator('text=Password must be at least 8')).toBeVisible();
  });
});
```

**Critical Journeys to Test**:
1. New user signup → verify → profile → home
2. Existing user login → dashboard
3. Create goal → AI mentor suggestions
4. Find mentor → apply for mentorship
5. Join community → view content
6. Track progress → see achievements

---

## Test Coverage Requirements

### By Feature (P0)

| Feature | Unit | Integration | E2E | Total Coverage |
|---------|------|-------------|-----|-----------------|
| Authentication | 95% | 95% | 100% | 95% |
| Profiles | 90% | 90% | 90% | 90% |
| Goals (CRUD) | 85% | 85% | 90% | 85% |
| AI Mentor | 80% | 75% | 80% | 78% |
| Database Layer | 90% | 100% | - | 95% |
| API Routes | 85% | 95% | 90% | 90% |
| Frontend Forms | 70% | 80% | 90% | 80% |
| Middleware | 90% | 95% | - | 92% |

**Target**: Minimum 80% overall coverage

### By File Type

```
backend/src/
├─ routes/       80%+ coverage
├─ middleware/   90%+ coverage
├─ controllers/  85%+ coverage
├─ services/     85%+ coverage
├─ utils/        90%+ coverage
└─ config/       skip (external config)

frontend/src/
├─ components/   60%+ coverage
├─ pages/        70%+ coverage
├─ utils/        85%+ coverage
└─ hooks/        80%+ coverage
```

---

## Testing Workflow

### 1. Local Development

**Before committing**:
```bash
# Backend
cd backend
npm test                    # Run all tests
npm run test:watch        # Watch mode for development

# Frontend
npm test                    # Run all tests
npm run test:watch        # Watch mode

# Check coverage
npm test -- --coverage
```

**Exit criteria for commit**:
- [ ] All tests passing
- [ ] Coverage not decreased
- [ ] No console warnings/errors
- [ ] Code formatted (prettier)
- [ ] Linted (eslint)

### 2. Pull Request Testing

When PR is created, GitHub Actions automatically:
1. Run all unit tests
2. Run all integration tests
3. Generate coverage report
4. Comment coverage delta on PR
5. Block merge if coverage < 80% on new code

**PR Checklist** (required before merge):
- [ ] All tests passing (CI)
- [ ] Code coverage maintained
- [ ] At least 1 approval
- [ ] No merge conflicts

### 3. Staging Environment

Before deploying to staging:
```bash
# Run full E2E test suite
npm run test:e2e

# Monitor performance
npm run lighthouse  # Frontend
npm run k6          # Backend load test
```

**Staging deploys** run E2E tests automatically

### 4. Production Deployment

Before going live:
- [ ] All tests passing in staging
- [ ] E2E journey tests: 100% passing
- [ ] Performance tests: meet thresholds
- [ ] Security tests: all passing
- [ ] Manual regression on staging
- [ ] Smoke test after deploy to prod

---

## Test Infrastructure

### Test Database

**Use isolated test database** for integration tests:

```javascript
// backend/tests/setup.js
import { createClient } from '@supabase/supabase-js';

export const setupTestDB = async () => {
  const supabase = createClient(
    process.env.SUPABASE_TEST_URL,
    process.env.SUPABASE_TEST_KEY
  );

  // Clear all tables
  await supabase.from('goals').delete().neq('id', '');
  await supabase.from('profiles').delete().neq('id', '');
  // ... etc

  return supabase;
};

beforeEach(async () => {
  await setupTestDB();
});
```

### Test Data Fixtures

```javascript
// backend/tests/fixtures/users.js
export const testUsers = {
  student: {
    email: 'student@example.com',
    password: 'ValidPass123',
    full_name: 'Student User',
    stage: 'student'
  },
  resident: {
    email: 'resident@example.com',
    password: 'ValidPass123',
    full_name: 'Resident User',
    stage: 'resident'
  },
  mentor: {
    email: 'mentor@example.com',
    password: 'ValidPass123',
    full_name: 'Mentor User',
    stage: 'faculty'
  }
};

export const testGoals = {
  basic: {
    title: 'Learn Echocardiography',
    description: 'Master echo imaging techniques',
    timeline: 'three_months'
  }
};

// Usage:
import { testUsers, testGoals } from '../fixtures';

test('user can create goal', async () => {
  const user = await signupUser(testUsers.student);
  const goal = await createGoal(testGoals.basic, user.id);
  expect(goal.title).toBe('Learn Echocardiography');
});
```

### Mock Service Worker (MSW)

Mock API responses in frontend tests:

```javascript
// frontend/tests/mocks/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      access_token: 'test-token',
      user: { id: '123', email: 'test@example.com' }
    });
  }),

  // Profile endpoints
  http.get('/api/profile/:userId', ({ params }) => {
    return HttpResponse.json({
      id: params.userId,
      full_name: 'Test User',
      headline: 'Medical Student'
    });
  }),

  // Goals endpoints
  http.post('/api/goals', () => {
    return HttpResponse.json({ id: 'goal-123', title: 'New Goal' }, { status: 201 });
  })
];

// In test setup:
import { setupServer } from 'msw/node';
export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Performance Testing

### Load Testing (Backend)

Use k6 for load testing:

```javascript
// tests/performance/api-load.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.1']
  }
};

export default function () {
  // Simulate user creating goal
  const payload = JSON.stringify({
    title: 'Learn Something',
    description: 'Test goal',
    timeline: 'three_months'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    }
  };

  http.post('http://localhost:3000/api/goals', payload, params);
}
```

**Run**: `k6 run tests/performance/api-load.js`

### Frontend Performance

Use Lighthouse:

```javascript
// tests/performance/lighthouse.js
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port
  };

  const runnerResult = await lighthouse(url, options);
  
  console.log('Performance score:', runnerResult.lhr.categories.performance.score * 100);
  console.log('Accessibility score:', runnerResult.lhr.categories.accessibility.score * 100);

  await chromeLauncher.kill(chrome.pid);

  // Assert thresholds
  expect(runnerResult.lhr.categories.performance.score).toBeGreaterThan(0.9);
}

// Run: await runLighthouse('http://localhost:5173');
```

---

## Security Testing

### Input Validation Testing

```javascript
test('SQL injection attempts are blocked', async () => {
  const maliciousInput = "'; DROP TABLE users; --";
  
  const res = await client
    .post('/api/goals')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: maliciousInput });

  // Should safely escape/reject
  expect(res.status).not.toBe(500);
  expect(res.body).not.toContain('SQL');
});

test('XSS attempts are blocked', async () => {
  const xssAttempt = '<script>alert("xss")</script>';
  
  const res = await client
    .post('/api/profile')
    .set('Authorization', `Bearer ${token}`)
    .send({ bio: xssAttempt });

  expect(res.status).toBe(200);
  // Should be escaped
  expect(res.body.bio).not.toContain('<script>');
});

test('CSRF tokens are required', async () => {
  const res = await client
    .post('/api/goals')
    .send({ title: 'Test' }); // No CSRF token

  expect(res.status).toBe(403);
});
```

---

## Continuous Integration (GitHub Actions)

**File**: `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: cd backend && npm install
      - run: cd backend && npm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          directory: ./backend/coverage

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          directory: ./coverage

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install && cd backend && npm install
      - run: npm run dev &
      - run: cd backend && npm run dev &
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Test Reporting & Metrics

### Coverage Reports

Generate and track coverage:

```bash
# Backend
npm test -- --coverage --coverageReporters=json

# Frontend
npm test -- --coverage --coverageReporters=json

# Merge reports
npm run coverage:merge
npm run coverage:report  # HTML report in coverage/
```

### Trend Tracking

Store coverage metrics over time:

```json
// metrics.json
[
  {
    "date": "2024-01-20",
    "backend_coverage": 82.5,
    "frontend_coverage": 71.2,
    "total_coverage": 78.9
  }
]
```

Monitor in dashboard (GitHub Actions artifacts)

---

## Testing Checklist for Each PR

```markdown
## PR Testing Checklist

- [ ] All unit tests passing locally
- [ ] All integration tests passing locally
- [ ] Coverage not decreased
- [ ] New code has tests (80%+ coverage)
- [ ] Edge cases tested
- [ ] Error cases tested
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] CSRF protection in place
- [ ] Rate limiting tested (if applicable)
- [ ] Performance acceptable
- [ ] Console has no errors/warnings
- [ ] Code formatted (prettier)
- [ ] Linted (eslint)
- [ ] Documentation updated
- [ ] Manual smoke test done
```

---

## Success Metrics

| Metric | Target | Owner | Frequency |
|--------|--------|-------|-----------|
| Test Coverage | 80%+ | QA | Every PR |
| Test Pass Rate | 100% | QA | Every run |
| Avg Unit Test Time | < 1 sec | Backend | Weekly |
| Avg Integration Test Time | < 10 sec | Backend | Weekly |
| E2E Test Duration | < 5 min/journey | QA | Per release |
| Bug Escape Rate | < 5% to production | QA | Monthly |
| Performance Score | 90+ (Lighthouse) | Frontend | Per release |

---

## Testing Timeline

### Weeks 1-2: Foundation
- [ ] Set up test infrastructure
- [ ] Write auth tests
- [ ] Achieve 80% coverage on auth

### Weeks 3-4: Core Features
- [ ] Write profile tests
- [ ] Write goal CRUD tests
- [ ] Achieve 75%+ overall coverage

### Weeks 5-6: Integration
- [ ] Write E2E tests for critical journeys
- [ ] Set up CI/CD
- [ ] Performance testing

### Weeks 7+: Maintenance
- [ ] Add tests for new features
- [ ] Monitor coverage
- [ ] Performance regression testing

---

**Status**: Testing Strategy Complete  
**Next Step**: Execute during development  
**Maintained By**: QA Team & Engineers
