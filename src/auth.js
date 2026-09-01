// Frontend Auth Pages - HTML + Vanilla JS

export function renderAuthPages(app) {
  const container = document.getElementById('app');

  // Login Page
  const loginHTML = `
    <div id="login-page" class="auth-page" style="display: none;">
      <div class="auth-container">
        <h1>Login to PulseUp</h1>
        <form id="login-form">
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Password" required />
          <button type="submit">Login</button>
          <p>Don't have an account? <a href="#signup">Sign up</a></p>
        </form>
        <div id="login-error" class="error" style="display: none;"></div>
      </div>
    </div>
  `;

  // Signup Page
  const signupHTML = `
    <div id="signup-page" class="auth-page" style="display: none;">
      <div class="auth-container">
        <h1>Sign Up for PulseUp</h1>
        <form id="signup-form">
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Password (min 8 chars)" required />
          <input type="text" name="full_name" placeholder="Full Name" required />
          <input type="text" name="college" placeholder="College/Institution" required />
          <select name="stage" required>
            <option value="">Select Stage</option>
            <option value="student">Student</option>
            <option value="resident">Resident</option>
            <option value="faculty">Faculty</option>
            <option value="other">Other</option>
          </select>
          <button type="submit">Sign Up</button>
          <p>Already have an account? <a href="#login">Login</a></p>
        </form>
        <div id="signup-error" class="error" style="display: none;"></div>
      </div>
    </div>
  `;

  // Email Verify Page
  const verifyHTML = `
    <div id="verify-page" class="auth-page" style="display: none;">
      <div class="auth-container">
        <h1>Verify Your Email</h1>
        <p id="verify-message">Checking verification token...</p>
        <div id="verify-error" class="error" style="display: none;"></div>
      </div>
    </div>
  `;

  container.innerHTML += loginHTML + signupHTML + verifyHTML;

  // Login Handler
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) throw new Error('Login failed');

      const data = await res.json();
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to home
      window.location.hash = '#home';
    } catch (err) {
      document.getElementById('login-error').textContent = err.message;
      document.getElementById('login-error').style.display = 'block';
    }
  });

  // Signup Handler
  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = {
      email: form.email.value,
      password: form.password.value,
      full_name: form.full_name.value,
      college: form.college.value,
      stage: form.stage.value
    };

    try {
      const res = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Signup failed');

      // Show verify page
      showPage('verify');
      document.getElementById('verify-message').textContent = 
        `Verification email sent to ${formData.email}. Check your inbox!`;
    } catch (err) {
      document.getElementById('signup-error').textContent = err.message;
      document.getElementById('signup-error').style.display = 'block';
    }
  });

  // Router for auth pages
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash === 'login') showPage('login');
    else if (hash === 'signup') showPage('signup');
    else if (hash === 'verify') showPage('verify');
  });

  function showPage(pageName) {
    document.querySelectorAll('.auth-page').forEach(p => p.style.display = 'none');
    const page = document.getElementById(pageName + '-page');
    if (page) page.style.display = 'block';
  }
}

// Auth utilities
export const auth = {
  getToken: () => localStorage.getItem('auth_token'),
  getUser: () => JSON.parse(localStorage.getItem('user') || 'null'),
  isLoggedIn: () => !!localStorage.getItem('auth_token'),
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.hash = '#login';
  },
  setToken: (token) => localStorage.setItem('auth_token', token)
};

// API helper with auth
export async function apiCall(endpoint, options = {}) {
  const token = auth.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`http://localhost:3000/api${endpoint}`, {
    ...options,
    headers
  });

  if (res.status === 401) {
    auth.logout();
    throw new Error('Unauthorized');
  }

  return res;
}
