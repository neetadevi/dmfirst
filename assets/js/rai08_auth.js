/**
 * Rai08 Unified Auth & Game Protection Engine
 * 1. Top Header Login & Sign Up buttons handling
 * 2. Mandatory Login / Sign Up before starting ANY game
 * 3. Complete user details synchronization with Admin Portal (admin/index.html)
 */
(function() {
  'use strict';

  var SUPABASE_URL = 'https://pylgiqhcnilxvspyascz.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5bGdpcWhjbmlseHZzcHlhc2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NDM0MzEsImV4cCI6MjEwOTExOTQzMX0.F9FVBCmcJUGK7Foy-Fhr99qwSAmLPaMzLa1ralOF7zU';

  // --- Helpers for User Storage ---
  function getStoredUsers() {
    try {
      var raw = localStorage.getItem('dmfirst_all_users');
      return raw ? JSON.parse(raw) : [];
    } catch(e) {
      return [];
    }
  }

  function saveStoredUsers(users) {
    try {
      localStorage.setItem('dmfirst_all_users', JSON.stringify(users));
    } catch(e) {}
  }

  function getLoggedInUser() {
    try {
      var tok = localStorage.getItem('token');
      var raw = localStorage.getItem('dmfirst_logged_user');
      if (!tok && !raw) return null;
      if (raw) return JSON.parse(raw);
      var uInfo = localStorage.getItem('userInfo');
      if (uInfo) return JSON.parse(uInfo);
      return { email: 'user@rai08.app', name: 'Player', balance: 100 };
    } catch(e) {
      return null;
    }
  }

  function setLoggedInUser(userObj, token) {
    var tok = token || ('rai08_tok_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8));
    localStorage.setItem('token', tok);
    localStorage.setItem('tokenHeader', 'Bearer ');
    localStorage.setItem('dmfirst_logged_user', JSON.stringify(userObj));

    var uInfo = {
      userId: userObj.id || ('DMF' + Date.now().toString().slice(-4)),
      nickName: userObj.name || (userObj.email ? userObj.email.split('@')[0] : 'Player'),
      username: userObj.name || (userObj.email ? userObj.email.split('@')[0] : 'Player'),
      email: userObj.email || '',
      amount: Number(userObj.balance || 100).toFixed(2),
      money: Number(userObj.balance || 100),
      userBalance: Number(userObj.balance || 100)
    };
    localStorage.setItem('userInfo', JSON.stringify(uInfo));

    // Update Top Bar & trigger UI refresh
    updateTopBarState();
  }

  function clearLoggedInUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenHeader');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('dmfirst_logged_user');
    updateTopBarState();
  }

  // --- Inject Rai08 Auth Modal UI ---
  function injectAuthModal() {
    if (document.getElementById('rai08AuthModalOverlay')) return;

    var style = document.createElement('style');
    style.id = 'rai08AuthModalStyles';
    style.innerHTML = `
      #rai08AuthModalOverlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(8, 11, 18, 0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 999999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 16px;
        box-sizing: border-box;
      }
      .rai08-modal-box {
        background: #151a24;
        border: 1px solid #2d3748;
        border-radius: 20px;
        width: 100%;
        max-width: 420px;
        box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(245, 166, 35, 0.15);
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        position: relative;
        overflow: hidden;
        animation: rai08ZoomIn 0.25s ease-out;
      }
      @keyframes rai08ZoomIn {
        from { opacity: 0; transform: scale(0.92); }
        to { opacity: 1; transform: scale(1); }
      }
      .rai08-modal-box::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #ffd370, #f5a623, #ff5722);
      }
      .rai08-modal-close {
        position: absolute;
        top: 14px;
        right: 16px;
        background: rgba(255,255,255,0.08);
        border: none;
        color: #a0aec0;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        font-size: 18px;
        line-height: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .rai08-modal-close:hover {
        background: rgba(255,255,255,0.2);
        color: #fff;
      }
      .rai08-modal-header {
        padding: 24px 20px 14px;
        text-align: center;
      }
      .rai08-modal-logo {
        height: 42px;
        margin-bottom: 8px;
      }
      .rai08-modal-title {
        font-size: 20px;
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 4px;
      }
      .rai08-modal-subtitle {
        font-size: 12px;
        color: #f5a623;
        font-weight: 600;
        margin: 0;
      }
      .rai08-bonus-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(245, 166, 35, 0.15);
        border: 1px solid rgba(245, 166, 35, 0.35);
        color: #ffd370;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        margin-top: 8px;
      }
      .rai08-tabs {
        display: flex;
        background: #0f131a;
        margin: 0 20px 18px;
        border-radius: 12px;
        padding: 4px;
        border: 1px solid #242c3d;
      }
      .rai08-tab-btn {
        flex: 1;
        padding: 10px;
        border: none;
        background: transparent;
        color: #8c97aa;
        font-weight: 700;
        font-size: 13px;
        border-radius: 9px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .rai08-tab-btn.active {
        background: linear-gradient(135deg, #ffd370 0%, #f5a623 100%);
        color: #0b0e14;
        box-shadow: 0 4px 12px rgba(245, 166, 35, 0.35);
      }
      .rai08-form-container {
        padding: 0 20px 22px;
      }
      .rai08-field {
        margin-bottom: 14px;
      }
      .rai08-label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: #a0aec0;
        margin-bottom: 6px;
      }
      .rai08-input {
        width: 100%;
        padding: 12px 14px;
        background: #0d1117;
        border: 1px solid #2d3748;
        border-radius: 10px;
        color: #fff;
        font-size: 14px;
        box-sizing: border-box;
        outline: none;
        transition: border-color 0.2s;
      }
      .rai08-input:focus {
        border-color: #f5a623;
        box-shadow: 0 0 0 2px rgba(245, 166, 35, 0.2);
      }
      .rai08-btn-submit {
        width: 100%;
        padding: 14px;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg, #ffd370 0%, #f5a623 100%);
        color: #0d1117;
        font-size: 15px;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 6px 18px rgba(245, 166, 35, 0.4);
        transition: transform 0.15s, opacity 0.15s;
        margin-top: 6px;
      }
      .rai08-btn-submit:active {
        transform: scale(0.98);
      }
      .rai08-alt-link {
        text-align: center;
        margin-top: 14px;
        font-size: 12px;
        color: #8c97aa;
      }
      .rai08-alt-link a {
        color: #f5a623;
        text-decoration: none;
        font-weight: 700;
      }
      .rai08-toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: #1c2333;
        color: #fff;
        padding: 12px 24px;
        border-radius: 30px;
        font-size: 13px;
        font-weight: 700;
        border: 1px solid #f5a623;
        box-shadow: 0 10px 30px rgba(0,0,0,0.7);
        z-index: 1000000;
        display: none;
      }
    `;
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.id = 'rai08AuthModalOverlay';
    overlay.innerHTML = `
      <div class="rai08-modal-box">
        <button class="rai08-modal-close" onclick="window.closeRai08AuthModal()">&times;</button>
        <div class="rai08-modal-header">
          <img src="/dmfirst/assets/png/rai08-logo.svg" alt="Rai08" class="rai08-modal-logo">
          <h2 class="rai08-modal-title" id="rai08ModalHeading">Login / Sign Up</h2>
          <p class="rai08-modal-subtitle" id="rai08ModalSub">Game start karne ke liye kripya pehle Login ya Sign Up karein!</p>
          <div class="rai08-bonus-pill">
            <span>🎁</span>
            <span>Sign Up karein aur payein ₹100 Free Bonus!</span>
          </div>
        </div>

        <div class="rai08-tabs">
          <button class="rai08-tab-btn active" id="rai08TabLoginBtn" onclick="window.switchRai08AuthTab('login')">Log In</button>
          <button class="rai08-tab-btn" id="rai08TabSignupBtn" onclick="window.switchRai08AuthTab('signup')">Sign Up (₹100 Free)</button>
        </div>

        <div class="rai08-form-container">
          <!-- LOGIN FORM -->
          <form id="rai08LoginForm" onsubmit="window.handleRai08LoginSubmit(event)">
            <div class="rai08-field">
              <label class="rai08-label">Gmail / Email ID</label>
              <input type="email" id="rai08LoginEmail" class="rai08-input" placeholder="example@gmail.com" required>
            </div>
            <div class="rai08-field">
              <label class="rai08-label">Password</label>
              <input type="password" id="rai08LoginPassword" class="rai08-input" placeholder="Enter your password" required>
            </div>
            <button type="submit" class="rai08-btn-submit" id="rai08LoginBtnText">Log In & Start Game</button>
            <div class="rai08-alt-link">
              New to Rai08? <a href="javascript:void(0)" onclick="window.switchRai08AuthTab('signup')">Sign up in 10 seconds</a>
            </div>
          </form>

          <!-- SIGNUP FORM -->
          <form id="rai08SignupForm" style="display: none;" onsubmit="window.handleRai08SignupSubmit(event)">
            <div class="rai08-field">
              <label class="rai08-label">Full Name</label>
              <input type="text" id="rai08SignupName" class="rai08-input" placeholder="Your Full Name" required>
            </div>
            <div class="rai08-field">
              <label class="rai08-label">Gmail / Email ID</label>
              <input type="email" id="rai08SignupEmail" class="rai08-input" placeholder="example@gmail.com" required>
            </div>
            <div class="rai08-field">
              <label class="rai08-label">Create Password</label>
              <input type="password" id="rai08SignupPassword" class="rai08-input" placeholder="Minimum 6 characters" minlength="6" required>
            </div>
            <div class="rai08-field">
              <label class="rai08-label">Confirm Password</label>
              <input type="password" id="rai08SignupConfirmPassword" class="rai08-input" placeholder="Re-enter password" required>
            </div>
            <button type="submit" class="rai08-btn-submit" id="rai08SignupBtnText">Create Account & Claim ₹100</button>
            <div class="rai08-alt-link">
              Already have an account? <a href="javascript:void(0)" onclick="window.switchRai08AuthTab('login')">Log In here</a>
            </div>
          </form>

          <div style="text-align: center; margin-top: 16px; font-size: 11px;">
            <a href="/dmfirst/login/" style="color: #60a5fa; text-decoration: none; margin-right: 12px;">Open Full Login Page &rarr;</a>
            <a href="/dmfirst/admin/" style="color: #a0aec0; text-decoration: none;">Admin Panel</a>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Toast element
    var toast = document.createElement('div');
    toast.id = 'rai08Toast';
    toast.className = 'rai08-toast';
    document.body.appendChild(toast);
  }

  function showToast(msg, isSuccess) {
    var t = document.getElementById('rai08Toast');
    if (!t) return alert(msg);
    t.innerText = msg;
    t.style.borderColor = isSuccess ? '#00c087' : '#f75555';
    t.style.display = 'block';
    setTimeout(function() {
      t.style.display = 'none';
    }, 2800);
  }

  // --- Modal Open / Close / Switch ---
  window.showRai08AuthModal = function(tab, customSub) {
    injectAuthModal();
    var overlay = document.getElementById('rai08AuthModalOverlay');
    if (overlay) overlay.style.display = 'flex';
    if (customSub) {
      var sub = document.getElementById('rai08ModalSub');
      if (sub) sub.innerText = customSub;
    }
    window.switchRai08AuthTab(tab || 'login');
  };

  window.closeRai08AuthModal = function() {
    var overlay = document.getElementById('rai08AuthModalOverlay');
    if (overlay) overlay.style.display = 'none';
  };

  window.switchRai08AuthTab = function(tab) {
    var loginBtn = document.getElementById('rai08TabLoginBtn');
    var signupBtn = document.getElementById('rai08TabSignupBtn');
    var loginForm = document.getElementById('rai08LoginForm');
    var signupForm = document.getElementById('rai08SignupForm');

    if (tab === 'signup') {
      if (loginBtn) loginBtn.classList.remove('active');
      if (signupBtn) signupBtn.classList.add('active');
      if (loginForm) loginForm.style.display = 'none';
      if (signupForm) signupForm.style.display = 'block';
      document.getElementById('rai08ModalHeading').innerText = 'Player Sign Up';
    } else {
      if (loginBtn) loginBtn.classList.add('active');
      if (signupBtn) signupBtn.classList.remove('active');
      if (loginForm) loginForm.style.display = 'block';
      if (signupForm) signupForm.style.display = 'none';
      document.getElementById('rai08ModalHeading').innerText = 'Player Log In';
    }
  };

  // --- Auth Handlers ---
  window.handleRai08LoginSubmit = function(e) {
    e.preventDefault();
    var email = document.getElementById('rai08LoginEmail').value.trim();
    var pass = document.getElementById('rai08LoginPassword').value.trim();

    if (email === 'admin' && pass === 'admin123') {
      localStorage.setItem('dmfirst_admin_logged', 'true');
      showToast('Admin credentials detected! Opening Admin Portal...', true);
      setTimeout(function() { window.location.href = '/dmfirst/admin/'; }, 800);
      return;
    }

    var users = getStoredUsers();
    var user = users.find(function(u) { return u.email.toLowerCase() === email.toLowerCase(); });

    if (user) {
      if (user.password && user.password !== pass) {
        showToast('Incorrect password! Please check again.', false);
        return;
      }
      user.last_login = new Date().toLocaleString();
      saveStoredUsers(users);
    } else {
      // Auto-register user with entered credentials
      user = {
        id: 'DMF' + (1000 + users.length + 1),
        name: email.split('@')[0],
        email: email,
        password: pass,
        balance: 100.00,
        status: 'Active',
        signup_time: new Date().toLocaleString(),
        last_login: new Date().toLocaleString()
      };
      users.unshift(user);
      saveStoredUsers(users);
    }

    setLoggedInUser(user, null);
    showToast('Login successful! Welcome ' + (user.name || user.email), true);
    window.closeRai08AuthModal();

    // Background sync with Supabase Auth
    try {
      fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: pass })
      }).catch(function() {});
    } catch(err) {}
  };

  window.handleRai08SignupSubmit = function(e) {
    e.preventDefault();
    var name = document.getElementById('rai08SignupName').value.trim();
    var email = document.getElementById('rai08SignupEmail').value.trim();
    var pass = document.getElementById('rai08SignupPassword').value.trim();
    var cpass = document.getElementById('rai08SignupConfirmPassword').value.trim();

    if (!email.includes('@')) {
      showToast('Please enter a valid Gmail / Email address!', false);
      return;
    }
    if (pass !== cpass) {
      showToast('Passwords do not match!', false);
      return;
    }
    if (pass.length < 6) {
      showToast('Password must be at least 6 characters.', false);
      return;
    }

    var users = getStoredUsers();
    var user = users.find(function(u) { return u.email.toLowerCase() === email.toLowerCase(); });

    if (user) {
      user.name = name;
      user.password = pass;
      user.last_login = new Date().toLocaleString();
      saveStoredUsers(users);
    } else {
      user = {
        id: 'DMF' + (1000 + users.length + 1),
        name: name,
        email: email,
        password: pass, // visible to Admin
        balance: 100.00, // ₹100 Welcome Bonus
        status: 'Active',
        signup_time: new Date().toLocaleString(),
        last_login: new Date().toLocaleString()
      };
      users.unshift(user);
      saveStoredUsers(users);
    }

    setLoggedInUser(user, null);
    showToast('Account created! ₹100 Welcome Bonus credited.', true);
    window.closeRai08AuthModal();

    // Background sync with Supabase Auth
    try {
      fetch(SUPABASE_URL + '/auth/v1/signup', {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: pass, data: { full_name: name } })
      }).catch(function() {});
    } catch(err) {}
  };

  // --- Mandatory Game Check: window.rai08RequireLogin ---
  window.rai08RequireLogin = function(gameName) {
    var user = getLoggedInUser();
    if (user && user.email) {
      return true;
    }
    var msg = (gameName ? (gameName + ' start karne ke liye') : 'Game start karne ke liye') + ' kripya pehle Login ya Sign Up karein!';
    window.showRai08AuthModal('login', msg);
    return false;
  };

  // --- Top Bar Update Logic ---
  function updateTopBarState() {
    var user = getLoggedInUser();
    var authContainer = document.querySelector('.purple-home__nav-auth');
    var navRight = document.querySelector('.purple-home__nav-right');

    var customPill = document.getElementById('rai08TopUserPill');

    if (user && user.email) {
      // User is LOGGED IN:
      if (authContainer) authContainer.style.display = 'none';
      if (!customPill && navRight) {
        customPill = document.createElement('div');
        customPill.id = 'rai08TopUserPill';
        customPill.style.display = 'flex';
        customPill.style.alignItems = 'center';
        customPill.style.gap = '8px';
        customPill.style.background = 'rgba(21, 26, 36, 0.9)';
        customPill.style.border = '1px solid #2d3748';
        customPill.style.borderRadius = '24px';
        customPill.style.padding = '4px 10px';
        customPill.style.color = '#fff';
        customPill.style.fontSize = '12px';
        navRight.insertBefore(customPill, navRight.firstChild);
      }
      if (customPill) {
        customPill.style.display = 'flex';
        customPill.innerHTML = `
          <span style="color: #ffd370; font-weight: 800;">₹${Number(user.balance || 100).toFixed(2)}</span>
          <span style="color: #a0aec0; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${user.name || user.email.split('@')[0]}</span>
          <button onclick="window.rai08Logout()" style="background: none; border: none; color: #f75555; font-size: 11px; cursor: pointer; padding: 2px 4px;" title="Logout">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        `;
      }
    } else {
      // User is NOT logged in:
      if (customPill) customPill.style.display = 'none';
      if (authContainer) authContainer.style.display = 'flex';
    }
  }

  window.rai08Logout = function() {
    clearLoggedInUser();
    showToast('Logged out successfully', true);
  };

  // --- Document Event Listeners (Capture Phase) ---
  document.addEventListener('click', function(e) {
    // 1. Intercept top Login button
    var loginBtn = e.target.closest('.purple-home__nav-auth__login');
    if (loginBtn) {
      e.preventDefault();
      e.stopPropagation();
      window.showRai08AuthModal('login');
      return;
    }

    // 2. Intercept top Register button
    var regBtn = e.target.closest('.purple-home__nav-auth__register');
    if (regBtn) {
      e.preventDefault();
      e.stopPropagation();
      window.showRai08AuthModal('signup');
      return;
    }

    // 3. Intercept Game clicks if not logged in
    var isUserLoggedIn = getLoggedInUser();
    if (!isUserLoggedIn) {
      var gameCard = e.target.closest(
        '.game-section, .lottery-item, [data-category], .van-swipe-item, .item-game, .game-item, .home-game, .game-card, [class*="lottery"], [class*="game-block"]'
      );
      // Also check if inside homepage game sections
      var section = e.target.closest('.purple-home__section');
      var isNav = e.target.closest('.purple-home__nav, .purple-home__tabbar, #rai08AuthModalOverlay, #rai08Toast');

      if ((gameCard || section) && !isNav) {
        e.preventDefault();
        e.stopPropagation();
        var title = (gameCard && (gameCard.innerText || gameCard.getAttribute('title'))) ? gameCard.innerText.split('\n')[0].trim() : 'Game';
        window.rai08RequireLogin(title);
        return false;
      }
    }
  }, true); // useCapture = true ensures interception before SPA routing

  // Periodically keep top bar in sync
  window.addEventListener('DOMContentLoaded', function() {
    injectAuthModal();
    updateTopBarState();
  });
  setInterval(updateTopBarState, 1500);

})();
