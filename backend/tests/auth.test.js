import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';

// Test configuration
const API_URL = 'http://localhost:3000/api';
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPass123',
  full_name: 'Test User',
  college: 'MIT',
  stage: 'student'
};

let accessToken = '';
let refreshToken = '';
let verificationToken = '';

async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) options.body = JSON.stringify(body);
  if (accessToken && !endpoint.includes('/signup') && !endpoint.includes('/login')) {
    options.headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, options);
  const data = await res.json();
  return { status: res.status, data };
}

describe('Authentication API', () => {
  
  describe('POST /auth/signup', () => {
    it('should reject invalid password (no uppercase)', async () => {
      const { status, data } = await request('POST', '/auth/signup', {
        ...TEST_USER,
        password: 'testpass123'
      });
      assert.strictEqual(status, 400);
      assert(data.error.includes('uppercase'));
    });

    it('should reject invalid password (no number)', async () => {
      const { status, data } = await request('POST', '/auth/signup', {
        ...TEST_USER,
        password: 'TestPass'
      });
      assert.strictEqual(status, 400);
      assert(data.error.includes('number'));
    });

    it('should reject invalid password (too short)', async () => {
      const { status, data } = await request('POST', '/auth/signup', {
        ...TEST_USER,
        password: 'Test1'
      });
      assert.strictEqual(status, 400);
      assert(data.error.includes('8 characters'));
    });

    it('should successfully create user with valid credentials', async () => {
      const { status, data } = await request('POST', '/auth/signup', TEST_USER);
      assert.strictEqual(status, 201);
      assert(data.email === TEST_USER.email);
      assert(data.debug_link);
      verificationToken = data.debug_link.split('token=')[1];
    });

    it('should reject duplicate email', async () => {
      const { status, data } = await request('POST', '/auth/signup', TEST_USER);
      assert.strictEqual(status, 409);
      assert(data.error.includes('already registered'));
    });

    it('should reject missing required fields', async () => {
      const { status } = await request('POST', '/auth/signup', {
        email: 'test@example.com'
      });
      assert.strictEqual(status, 400);
    });
  });

  describe('POST /auth/verify-email', () => {
    it('should reject invalid token', async () => {
      const { status, data } = await request('POST', '/auth/verify-email', {
        token: 'invalid-token'
      });
      assert.strictEqual(status, 400);
      assert(data.error.includes('Invalid'));
    });

    it('should verify valid token', async () => {
      assert(verificationToken, 'No verification token available');
      const { status, data } = await request('POST', '/auth/verify-email', {
        token: verificationToken
      });
      assert.strictEqual(status, 200);
      assert(data.message.includes('successfully'));
    });

    it('should reject already-used token', async () => {
      const { status } = await request('POST', '/auth/verify-email', {
        token: verificationToken
      });
      assert.strictEqual(status, 400);
    });
  });

  describe('POST /auth/login', () => {
    it('should reject wrong password', async () => {
      const { status } = await request('POST', '/auth/login', {
        email: TEST_USER.email,
        password: 'WrongPassword1'
      });
      assert.strictEqual(status, 401);
    });

    it('should reject non-existent user', async () => {
      const { status } = await request('POST', '/auth/login', {
        email: 'nonexistent@example.com',
        password: 'SomePass123'
      });
      assert.strictEqual(status, 401);
    });

    it('should successfully login with correct credentials', async () => {
      const { status, data } = await request('POST', '/auth/login', {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      assert.strictEqual(status, 200);
      assert(data.access_token);
      assert(data.refresh_token);
      assert(data.user.email === TEST_USER.email);
      
      accessToken = data.access_token;
      refreshToken = data.refresh_token;
    });

    it('should rate limit after 5 failed attempts', async () => {
      const rateLimitTestUser = {
        email: `ratelimit-${Date.now()}@example.com`,
        password: 'RateLimitTest123',
        full_name: 'Rate Test',
        college: 'Stanford',
        stage: 'student'
      };

      await request('POST', '/auth/signup', rateLimitTestUser);

      for (let i = 0; i < 5; i++) {
        const { status } = await request('POST', '/auth/login', {
          email: rateLimitTestUser.email,
          password: 'WrongPassword1'
        });
        assert.strictEqual(status, 401);
      }

      const { status } = await request('POST', '/auth/login', {
        email: rateLimitTestUser.email,
        password: rateLimitTestUser.password
      });
      assert.strictEqual(status, 429);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should reject invalid refresh token', async () => {
      const { status } = await request('POST', '/auth/refresh', {
        refresh_token: 'invalid-token'
      });
      assert(status === 400 || status === 401);
    });

    it('should refresh tokens with valid refresh token', async () => {
      const { status, data } = await request('POST', '/auth/refresh', {
        refresh_token: refreshToken
      });
      assert.strictEqual(status, 200);
      assert(data.access_token);
      assert(data.refresh_token);
      
      accessToken = data.access_token;
      refreshToken = data.refresh_token;
    });
  });

  describe('GET /auth/me', () => {
    it('should reject missing token', async () => {
      const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      };
      const res = await fetch(`${API_URL}/auth/me`, options);
      assert.strictEqual(res.status, 401);
    });

    it('should reject invalid token', async () => {
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token'
        }
      };
      const res = await fetch(`${API_URL}/auth/me`, options);
      assert.strictEqual(res.status, 401);
    });

    it('should return user profile with valid token', async () => {
      const { status, data } = await request('GET', '/auth/me');
      assert.strictEqual(status, 200);
      assert(data.id);
      assert(data.email === TEST_USER.email);
      assert(data.profile);
      assert(data.profile.full_name === TEST_USER.full_name);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const { status, data } = await request('POST', '/auth/logout');
      assert.strictEqual(status, 200);
      assert(data.message.includes('successfully'));
    });
  });
});

console.log('\n✅ All auth tests defined. Run with: node --test backend/tests/auth.test.js');
console.log('⚠️  Ensure backend is running (npm run dev) before running tests');
console.log('⚠️  Ensure Supabase is configured in backend/.env before running tests');
