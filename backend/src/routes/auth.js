import express from 'express';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Rate limiting: Track failed login attempts per email
const loginAttempts = new Map();
const ATTEMPT_LIMIT = 5;
const LOCKOUT_DURATION = 60 * 60 * 1000; // 1 hour

function isLockedOut(email) {
  const record = loginAttempts.get(email);
  if (!record) return false;
  if (record.attempts >= ATTEMPT_LIMIT) {
    if (Date.now() - record.lastAttempt < LOCKOUT_DURATION) {
      return true;
    }
    loginAttempts.delete(email);
    return false;
  }
  return false;
}

function recordFailedAttempt(email) {
  const record = loginAttempts.get(email) || { attempts: 0, lastAttempt: 0 };
  record.attempts += 1;
  record.lastAttempt = Date.now();
  loginAttempts.set(email, record);
}

function clearAttempts(email) {
  loginAttempts.delete(email);
}

// Password validation
function validatePassword(password) {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isLongEnough = password.length >= 8;

  if (!isLongEnough) return { valid: false, error: 'Password must be at least 8 characters' };
  if (!hasUpperCase) return { valid: false, error: 'Password must contain uppercase letter' };
  if (!hasLowerCase) return { valid: false, error: 'Password must contain lowercase letter' };
  if (!hasNumber) return { valid: false, error: 'Password must contain number' };

  return { valid: true };
}

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, full_name, college, stage } = req.body;

    // Validation
    if (!email || !password || !full_name || !college || !stage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate password strength
    const pwdValidation = validatePassword(password);
    if (!pwdValidation.valid) {
      return res.status(400).json({ error: pwdValidation.error });
    }

    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false
    });

    if (authError) {
      return res.status(409).json({ error: 'Email already registered or invalid' });
    }

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        college,
        stage,
        verification_status: 'unverified'
      });

    if (profileError) {
      // Rollback auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: 'Failed to create profile' });
    }

    // Generate email verification token
    const tokenHash = crypto.randomBytes(32).toString('hex');
    const verificationLink = `http://localhost:5173/#/verify?token=${tokenHash}`;

    // Store token (expires in 24 hours)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('email_tokens')
      .insert({
        user_id: authData.user.id,
        token_hash: crypto.createHash('sha256').update(tokenHash).digest('hex'),
        email,
        expires_at: expiresAt
      });

    // TODO: Send actual verification email (implement with SendGrid/Resend)
    console.log(`Verification link: ${verificationLink}`);

    res.status(201).json({
      message: 'Verification email sent. Check your inbox.',
      email,
      debug_link: process.env.NODE_ENV === 'development' ? verificationLink : undefined
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check for rate limiting
    if (isLockedOut(email)) {
      return res.status(429).json({ 
        error: 'Too many failed attempts. Please try again in 1 hour.' 
      });
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.admin.signInWithPassword({
      email,
      password
    });

    if (error || !data?.session) {
      recordFailedAttempt(email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Clear failed attempts on successful login
    clearAttempts(email);

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error || !data?.session) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    // Token validation happens in middleware (not implemented yet)
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get full profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      id: data.user.id,
      email: data.user.email,
      profile
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    // Hash the token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find and validate token
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('email_tokens')
      .select('user_id, email, expires_at')
      .eq('token_hash', tokenHash)
      .single();

    if (tokenError || !tokenRecord) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Check if token is expired
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    // Update profile verification status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ verification_status: 'verified' })
      .eq('id', tokenRecord.user_id);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to verify email' });
    }

    // Delete used token
    await supabase
      .from('email_tokens')
      .delete()
      .eq('token_hash', tokenHash);

    res.json({ message: 'Email verified successfully!' });
  } catch (err) {
    next(err);
  }
});

export default router;
