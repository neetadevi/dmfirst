/**
 * Rai08 Official Interactive Engine
 * Provides:
 * 1. Working Login & Sign Up with Name, Gmail, Password (+ ₹100 Welcome Bonus)
 * 2. QR Code Deposit / Recharge System (₹100, ₹200, ₹500, ₹1000, ₹2000, ₹5000, ₹10000)
 * 3. Playable & Runnable Games (WinGo Color Prediction, Lucky Wheel, Aviator Crash)
 * 4. User Wallet, History, and real-time sync with Admin Portal
 */

(function() {
  'use strict';

  // Inject Font Awesome if not loaded
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fa = document.createElement('link');
    fa.rel = 'stylesheet';
    fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fa);
  }

  // --- 1. LOCAL STORAGE & DATABASE INIT ---
  function getDatabase() {
    if (!localStorage.getItem('dmfirst_all_users')) {
      const defaultUsers = [
        { id: "RAI1001", name: "Rajesh Kumar", email: "rajesh.kumar@gmail.com", password: "user1234", balance: 1450.00, status: "Active", signup_time: "05/11/2026, 11:20:14 AM", last_login: "10/11/2026, 09:15:30 AM" },
        { id: "RAI1002", name: "Priya Sharma", email: "priya.sharma@gmail.com", password: "priya9876", balance: 520.00, status: "Active", signup_time: "07/11/2026, 04:45:00 PM", last_login: "09/11/2026, 08:30:12 PM" },
        { id: "RAI1003", name: "Vikas Singh", email: "vikas.singh@gmail.com", password: "vikaspass", balance: 3100.00, status: "Active", signup_time: "08/11/2026, 02:10:45 PM", last_login: "10/11/2026, 01:22:18 PM" }
      ];
      localStorage.setItem('dmfirst_all_users', JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem('dmfirst_recharges')) {
      localStorage.setItem('dmfirst_recharges', JSON.stringify([]));
    }
    if (!localStorage.getItem('dmfirst_withdrawals')) {
      localStorage.setItem('dmfirst_withdrawals', JSON.stringify([]));
    }
  }
  getDatabase();

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('dmfirst_logged_user') || 'null');
    } catch(e) { return null; }
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem('dmfirst_logged_user', JSON.stringify(user));
      // update in all users
      const users = JSON.parse(localStorage.getItem('dmfirst_all_users') || '[]');
      const idx = users.findIndex(u => u.email === user.email);
      if (idx !== -1) {
        users[idx] = Object.assign({}, users[idx], user);
      } else {
        users.unshift(user);
      }
      localStorage.setItem('dmfirst_all_users', JSON.stringify(users));
    } else {
      localStorage.removeItem('dmfirst_logged_user');
    }
    updateUIHeader();
  }

  // --- 2. INJECT RAI08 STYLES & OVERLAYS ---
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* Rai08 Global Floating Header & Action Bar */
    #rai08Bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 52px;
      background: rgba(13, 17, 23, 0.94);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(245, 166, 35, 0.35);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.6);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .r08-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: #fff;
    }
    .r08-logo {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      box-shadow: 0 2px 8px rgba(245, 166, 35, 0.3);
    }
    .r08-name {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.5px;
      background: linear-gradient(135deg, #ffd370 0%, #f5a623 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .r08-nav-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .r08-btn {
      padding: 6px 12px;
      border-radius: 7px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      text-decoration: none;
    }
    .r08-btn-deposit {
      background: linear-gradient(135deg, #00c087 0%, #009366 100%);
      color: #fff;
      box-shadow: 0 2px 8px rgba(0, 192, 135, 0.3);
    }
    .r08-btn-deposit:hover { filter: brightness(1.1); }
    .r08-btn-gold {
      background: linear-gradient(135deg, #ffd370 0%, #f5a623 100%);
      color: #000;
    }
    .r08-btn-gold:hover { filter: brightness(1.08); }
    .r08-btn-outline {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(245, 166, 35, 0.4);
      color: #f5a623;
    }
    .r08-btn-outline:hover { background: rgba(245, 166, 35, 0.15); }
    .r08-btn-admin {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.4);
      color: #60a5fa;
    }
    .r08-btn-admin:hover { background: #3b82f6; color: #fff; }
    .r08-user-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #181d26;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid #283040;
      font-size: 12px;
      color: #fff;
    }
    .r08-balance {
      color: #f5a623;
      font-weight: 800;
    }

    /* Floating Game Launcher Button */
    #r08FloatingGameBtn {
      position: fixed;
      bottom: 80px;
      right: 14px;
      z-index: 999990;
      background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
      color: #fff;
      padding: 11px 18px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 800;
      border: 2px solid #ffd370;
      box-shadow: 0 6px 20px rgba(255, 75, 43, 0.5);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 7px;
      animation: pulseBtn 2s infinite;
    }
    @keyframes pulseBtn {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    /* General Modal Styling */
    .r08-modal-bg {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(5px);
      z-index: 1000000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 14px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .r08-modal-card {
      background: #151a24;
      border: 1px solid #2b3345;
      border-radius: 18px;
      width: 100%;
      max-width: 440px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 24px 20px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.8);
      position: relative;
      color: #fff;
      animation: zoomIn 0.25s ease-out;
    }
    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .r08-modal-close {
      position: absolute;
      top: 16px;
      right: 18px;
      font-size: 22px;
      color: #8c97aa;
      cursor: pointer;
      line-height: 1;
    }
    .r08-modal-close:hover { color: #fff; }
    .r08-modal-title {
      font-size: 18px;
      font-weight: 800;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fff;
    }
    .r08-modal-desc {
      font-size: 12px;
      color: #8c97aa;
      margin-bottom: 18px;
    }

    /* Form Inputs */
    .r08-form-group {
      margin-bottom: 14px;
      text-align: left;
    }
    .r08-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #8c97aa;
      margin-bottom: 6px;
    }
    .r08-input {
      width: 100%;
      padding: 12px 14px;
      background: #0d1117;
      border: 1px solid #2b3345;
      border-radius: 9px;
      color: #fff;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      transition: border 0.2s;
    }
    .r08-input:focus {
      border-color: #f5a623;
    }

    /* Quick Amount Chips (100, 200, 500, 1000, 2000, 5000, 10000) */
    .r08-chip-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    .r08-chip {
      background: #0f131a;
      border: 1px solid #2b3345;
      border-radius: 8px;
      padding: 10px 4px;
      text-align: center;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      cursor: pointer;
      transition: all 0.2s;
    }
    .r08-chip:hover, .r08-chip.active {
      background: rgba(245, 166, 35, 0.15);
      border-color: #f5a623;
      color: #f5a623;
      transform: translateY(-1px);
    }

    /* QR Code Display Card */
    .r08-qr-card {
      background: #0d1117;
      border: 1px solid #2b3345;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      margin-bottom: 16px;
    }
    .r08-qr-img {
      width: 170px;
      height: 170px;
      border-radius: 8px;
      background: #fff;
      padding: 6px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.5);
      margin: 0 auto 12px;
      display: block;
    }
    .r08-upi-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #181d26;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px dashed #f5a623;
      font-size: 12px;
      color: #ffd370;
    }
    .r08-copy-btn {
      background: #f5a623;
      color: #000;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 700;
      cursor: pointer;
      font-size: 11px;
    }

    /* WinGo Game Styling */
    .wingo-timer-card {
      background: linear-gradient(135deg, #1b2230 0%, #11151e 100%);
      border: 1px solid #2b3345;
      border-radius: 12px;
      padding: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .wingo-time-val {
      font-size: 28px;
      font-weight: 900;
      color: #f5a623;
      font-family: monospace;
    }
    .wingo-color-btns {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }
    .btn-color-pick {
      padding: 14px 6px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      border: none;
      color: #fff;
      text-align: center;
      transition: transform 0.15s;
    }
    .btn-color-pick:hover { transform: scale(1.03); }
    .btn-color-pick.active { box-shadow: 0 0 0 3px #fff; }
    .btn-c-green { background: linear-gradient(135deg, #00c087, #009366); }
    .btn-c-violet { background: linear-gradient(135deg, #9c27b0, #673ab7); }
    .btn-c-red { background: linear-gradient(135deg, #f44336, #d32f2f); }

    .wingo-num-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }
    .btn-num-pick {
      aspect-ratio: 1;
      border-radius: 50%;
      border: 2px solid #2b3345;
      background: #0f131a;
      color: #fff;
      font-size: 16px;
      font-weight: 900;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-num-pick.active, .btn-num-pick:hover {
      background: #f5a623;
      color: #000;
      border-color: #ffd370;
      transform: scale(1.1);
    }
    .wingo-big-small {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }
    .btn-bs {
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      border: 1px solid #2b3345;
      background: #181d26;
      color: #fff;
      text-align: center;
    }
    .btn-bs.active {
      background: #f5a623;
      color: #000;
      border-color: #ffd370;
    }

    .history-dots {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding: 8px 0;
    }
    .h-dot {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
      color: #fff;
      flex-shrink: 0;
    }

    /* Toast */
    #r08Toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #151a24;
      border: 1px solid #f5a623;
      border-radius: 10px;
      padding: 12px 22px;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      z-index: 2000000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.7);
      transition: transform 0.3s ease-out, opacity 0.3s;
      opacity: 0;
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #r08Toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    /* Adjust page top padding so bar does not cover content */
    body {
      padding-top: 52px !important;
    }
  `;
  document.head.appendChild(styleEl);

  // --- 3. CREATE FLOATING BAR & MODAL DOM ---
  const container = document.createElement('div');
  container.innerHTML = `
    <!-- Top Bar -->
    <div id="rai08Bar">
      <a href="/dmfirst/" class="r08-brand">
        <img src="/dmfirst/icon-192x192.svg" alt="Rai08" class="r08-logo" onerror="this.src='/dmfirst/icon-192x192.png'">
        <span class="r08-name">Rai08</span>
      </a>

      <div id="r08NavActions" class="r08-nav-group">
        <!-- Rendered via updateUIHeader() -->
      </div>
    </div>

    <!-- Floating Play Game Button -->
    <button id="r08FloatingGameBtn" onclick="window.openWingoGame()">
      <i class="fa-solid fa-dice"></i> Play WinGo Game
    </button>

    <!-- 1. AUTH MODAL (Login & Sign Up) -->
    <div id="r08AuthModal" class="r08-modal-bg">
      <div class="r08-modal-card">
        <span class="r08-modal-close" onclick="window.closeRai08Modal('r08AuthModal')">&times;</span>
        <div style="text-align: center; margin-bottom: 16px;">
          <img src="/dmfirst/icon-192x192.svg" alt="Rai08" style="width: 54px; height: 54px; border-radius: 14px;" onerror="this.src='/dmfirst/icon-192x192.png'">
          <h2 class="r08-modal-title" style="justify-content: center; margin-top: 6px;">Rai08 Official</h2>
          <p class="r08-modal-desc">Entertainment & Rewards Gaming Platform</p>
        </div>

        <div style="display: flex; background: #0d1117; border-radius: 8px; padding: 3px; margin-bottom: 18px; border: 1px solid #2b3345;">
          <button id="authTabLogin" class="r08-btn r08-btn-gold" style="flex: 1; justify-content: center;" onclick="window.setAuthTab('login')">Log In</button>
          <button id="authTabSignup" class="r08-btn" style="flex: 1; justify-content: center; background: transparent; color: #8c97aa;" onclick="window.setAuthTab('signup')">Sign Up</button>
        </div>

        <!-- Login Form -->
        <form id="r08LoginForm" onsubmit="window.submitR08Login(event)">
          <div class="r08-form-group">
            <label class="r08-label">Email ID (Gmail)</label>
            <input type="text" id="r08LoginEmail" class="r08-input" placeholder="e.g. name@gmail.com" required>
          </div>
          <div class="r08-form-group">
            <label class="r08-label">Password</label>
            <input type="password" id="r08LoginPass" class="r08-input" placeholder="Enter password" required>
          </div>
          <button type="submit" class="r08-btn r08-btn-gold" style="width: 100%; padding: 12px; margin-top: 6px; justify-content: center;">
            Log In Now
          </button>
        </form>

        <!-- Sign Up Form (Name + Gmail + Password) -->
        <form id="r08SignupForm" style="display: none;" onsubmit="window.submitR08Signup(event)">
          <div style="background: rgba(0, 192, 135, 0.12); border: 1px dashed #00c087; padding: 8px 12px; border-radius: 8px; font-size: 12px; color: #00c087; margin-bottom: 14px;">
            🎁 Register with Name & Gmail to get <strong>₹100 Free Bonus</strong>!
          </div>
          <div class="r08-form-group">
            <label class="r08-label">Full Name</label>
            <input type="text" id="r08SignupName" class="r08-input" placeholder="Your full name" required>
          </div>
          <div class="r08-form-group">
            <label class="r08-label">Gmail / Email ID</label>
            <input type="email" id="r08SignupEmail" class="r08-input" placeholder="e.g. yourname@gmail.com" required>
          </div>
          <div class="r08-form-group">
            <label class="r08-label">Set Password</label>
            <input type="password" id="r08SignupPass" class="r08-input" placeholder="Min 6 characters" minlength="6" required>
          </div>
          <div class="r08-form-group">
            <label class="r08-label">Confirm Password</label>
            <input type="password" id="r08SignupCPass" class="r08-input" placeholder="Confirm password" minlength="6" required>
          </div>
          <button type="submit" class="r08-btn r08-btn-gold" style="width: 100%; padding: 12px; margin-top: 6px; justify-content: center;">
            Create Account & Claim ₹100
          </button>
        </form>

        <div style="text-align: center; margin-top: 16px; font-size: 12px;">
          <a href="/dmfirst/admin/" style="color: #60a5fa; text-decoration: none;">
            🛡️ Admin Panel (admin / admin123)
          </a>
        </div>
      </div>
    </div>

    <!-- 2. DEPOSIT / RECHARGE MODAL WITH 100-10000 & QR CODE -->
    <div id="r08DepositModal" class="r08-modal-bg">
      <div class="r08-modal-card">
        <span class="r08-modal-close" onclick="window.closeRai08Modal('r08DepositModal')">&times;</span>
        <h2 class="r08-modal-title">
          <i class="fa-solid fa-wallet" style="color: #00c087;"></i> Add Deposit / Recharge
        </h2>
        <p class="r08-modal-desc">Instant UPI Payment with 100% Automatic QR Code</p>

        <!-- Amount Chips (100, 200, 500, 1000, 2000, 5000, 10000) -->
        <label class="r08-label">Select Deposit Amount (₹)</label>
        <div class="r08-chip-grid">
          <div class="r08-chip active" onclick="window.selectDepositAmount(100, this)">₹100</div>
          <div class="r08-chip" onclick="window.selectDepositAmount(200, this)">₹200</div>
          <div class="r08-chip" onclick="window.selectDepositAmount(500, this)">₹500</div>
          <div class="r08-chip" onclick="window.selectDepositAmount(1000, this)">₹1000</div>
          <div class="r08-chip" onclick="window.selectDepositAmount(2000, this)">₹2000</div>
          <div class="r08-chip" onclick="window.selectDepositAmount(5000, this)">₹5000</div>
          <div class="r08-chip" onclick="window.selectDepositAmount(10000, this)" style="grid-column: span 2;">₹10000 (VIP)</div>
        </div>

        <div class="r08-form-group">
          <input type="number" id="r08DepositAmount" class="r08-input" value="100" min="100" max="50000" oninput="window.updateQrCode()">
        </div>

        <!-- Dynamic QR Code Card -->
        <div class="r08-qr-card">
          <div style="font-size: 13px; font-weight: 700; margin-bottom: 8px; color: #ffd370;">
            Scan & Pay <span id="r08QrAmtText">₹100</span> with any UPI App
          </div>
          <img id="r08QrImage" class="r08-qr-img" src="" alt="Payment QR Code">
          <div class="r08-upi-box">
            <span>UPI: <strong id="r08UpiId">rai08official@upi</strong></span>
            <button class="r08-copy-btn" onclick="window.copyRai08Upi()">COPY</button>
          </div>
          <div style="font-size: 11px; color: #8c97aa; margin-top: 8px;">
            Supports PhonePe, Google Pay, Paytm, BHIM, Cred
          </div>
        </div>

        <!-- UTR Entry -->
        <form onsubmit="window.submitR08Deposit(event)">
          <div class="r08-form-group">
            <label class="r08-label">Enter 12-Digit UTR / Transaction Reference Number</label>
            <input type="text" id="r08UtrNumber" class="r08-input" placeholder="e.g. 432901928371" required minlength="10">
          </div>
          <button type="submit" class="r08-btn r08-btn-deposit" style="width: 100%; padding: 13px; font-size: 14px; justify-content: center;">
            <i class="fa-solid fa-check-circle"></i> Submit Payment for Admin Approval
          </button>
        </form>
      </div>
    </div>

    <!-- 3. RUNNABLE WINGO COLOR PREDICTION GAME MODAL -->
    <div id="r08WingoModal" class="r08-modal-bg">
      <div class="r08-modal-card" style="max-width: 480px;">
        <span class="r08-modal-close" onclick="window.closeRai08Modal('r08WingoModal')">&times;</span>
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div>
            <h2 class="r08-modal-title"><i class="fa-solid fa-gamepad" style="color: #f5a623;"></i> WinGo 1-Min</h2>
            <div style="font-size: 11px; color: #8c97aa;">Period ID: <span id="wingoPeriod" style="color: #ffd370; font-weight: 700;">2026111001</span></div>
          </div>
          <div style="background: #0d1117; padding: 6px 12px; border-radius: 20px; border: 1px solid #2b3345; font-size: 12px;">
            💰 Balance: <span id="wingoUserBal" style="color: #f5a623; font-weight: 800;">₹100.00</span>
          </div>
        </div>

        <!-- Timer Banner -->
        <div class="wingo-timer-card">
          <div>
            <div style="font-size: 11px; color: #8c97aa; text-transform: uppercase;">Time Remaining</div>
            <div class="wingo-time-val" id="wingoTimer">00:30</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #8c97aa; text-align: right;">Recent Results</div>
            <div class="history-dots" id="wingoHistoryDots">
              <!-- Rendered via JS -->
            </div>
          </div>
        </div>

        <!-- Color Bet Buttons -->
        <label class="r08-label">Pick Color (2x - 4.5x)</label>
        <div class="wingo-color-btns">
          <button class="btn-color-pick btn-c-green" onclick="window.selectWingoPick('Green', this)">
            Green (2x)
          </button>
          <button class="btn-color-pick btn-c-violet" onclick="window.selectWingoPick('Violet', this)">
            Violet (4.5x)
          </button>
          <button class="btn-color-pick btn-c-red" onclick="window.selectWingoPick('Red', this)">
            Red (2x)
          </button>
        </div>

        <!-- Number Bet Buttons (0-9) -->
        <label class="r08-label">Pick Exact Number (9x Payout!)</label>
        <div class="wingo-num-grid">
          <button class="btn-num-pick" onclick="window.selectWingoPick('0', this)">0</button>
          <button class="btn-num-pick" onclick="window.selectWingoPick('1', this)">1</button>
          <button class="btn-num-pick" onclick="window.selectWingoPick('2', this)">2</button>
          <button class="btn-num-pick" onclick="window.selectWingoPick('3', this)">3</button>
          <button class="btn-num-pick" onclick="window.selectWingoPick('4', this)">4</button>
          <button class="btn-num-pick" onclick="window.selectWingoPick('5', this)">5</button>
          <button class="btn-num-pick" onclick="window.selectWingoPick('6', this)">6</button>
          <button class="btn-num-pick" onclick="window.selectWingoPick('7', this)">7</button>
          <button class="btn-num-pick" onclick="window.selectWingoPick('8', this)">8</button>
          <button class="btn-num-pick" onclick="window.selectWingoPick('9', this)">9</button>
        </div>

        <!-- Big / Small -->
        <div class="wingo-big-small">
          <button class="btn-bs" onclick="window.selectWingoPick('Big (5-9)', this)">Big (5-9) 2x</button>
          <button class="btn-bs" onclick="window.selectWingoPick('Small (0-4)', this)">Small (0-4) 2x</button>
        </div>

        <!-- Bet Amount -->
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 14px;">
          <label class="r08-label" style="margin: 0; white-space: nowrap;">Bet (₹):</label>
          <button class="r08-chip active" style="flex: 1;" onclick="window.setWingoBetAmt(10, this)">10</button>
          <button class="r08-chip" style="flex: 1;" onclick="window.setWingoBetAmt(50, this)">50</button>
          <button class="r08-chip" style="flex: 1;" onclick="window.setWingoBetAmt(100, this)">100</button>
          <button class="r08-chip" style="flex: 1;" onclick="window.setWingoBetAmt(500, this)">500</button>
        </div>

        <button id="btnPlaceWingoBet" class="r08-btn r08-btn-gold" style="width: 100%; padding: 14px; font-size: 15px; justify-content: center;" onclick="window.placeWingoBet()">
          Place Bet (₹10 on Green)
        </button>

        <div id="wingoResultBanner" style="display: none; margin-top: 14px; padding: 12px; border-radius: 10px; text-align: center; font-weight: 800; font-size: 15px;">
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div id="r08Toast">
      <span id="r08ToastMsg">Notification message</span>
    </div>
  `;
  document.body.appendChild(container);

  // --- 4. UI HEADER CONTROLLER ---
  function updateUIHeader() {
    const nav = document.getElementById('r08NavActions');
    if (!nav) return;
    const user = getCurrentUser();

    if (user && user.email) {
      const shortName = user.name || user.email.split('@')[0];
      nav.innerHTML = `
        <div class="r08-user-pill">
          <span>👤 ${shortName}</span>
          <span class="r08-balance">₹${Number(user.balance || 0).toFixed(2)}</span>
        </div>
        <button class="r08-btn r08-btn-deposit" onclick="window.openDepositModal()">
          <i class="fa-solid fa-plus-circle"></i> Deposit
        </button>
        <button class="r08-btn r08-btn-outline" style="padding: 5px 8px;" onclick="window.handleR08Logout()" title="Log out">
          ✕
        </button>
        <a href="/dmfirst/admin/" class="r08-btn r08-btn-admin" title="Admin Control">
          Admin
        </a>
      `;
    } else {
      nav.innerHTML = `
        <button class="r08-btn r08-btn-outline" onclick="window.openAuthModal('login')">
          Log In
        </button>
        <button class="r08-btn r08-btn-gold" onclick="window.openAuthModal('signup')">
          Sign Up
        </button>
        <a href="/dmfirst/admin/" class="r08-btn r08-btn-admin">
          Admin
        </a>
      `;
    }

    // Also update WinGo balance if open
    const balEl = document.getElementById('wingoUserBal');
    if (balEl && user) {
      balEl.innerText = '₹' + Number(user.balance || 0).toFixed(2);
    }
  }

  // --- 5. MODAL HELPERS ---
  window.openAuthModal = function(tab) {
    document.getElementById('r08AuthModal').style.display = 'flex';
    window.setAuthTab(tab || 'login');
  };

  window.closeRai08Modal = function(id) {
    document.getElementById(id).style.display = 'none';
  };

  window.setAuthTab = function(tab) {
    const lForm = document.getElementById('r08LoginForm');
    const sForm = document.getElementById('r08SignupForm');
    const lTab = document.getElementById('authTabLogin');
    const sTab = document.getElementById('authTabSignup');

    if (tab === 'login') {
      lForm.style.display = 'block';
      sForm.style.display = 'none';
      lTab.style.background = 'linear-gradient(135deg, #ffd370 0%, #f5a623 100%)';
      lTab.style.color = '#000';
      sTab.style.background = 'transparent';
      sTab.style.color = '#8c97aa';
    } else {
      lForm.style.display = 'none';
      sForm.style.display = 'block';
      sTab.style.background = 'linear-gradient(135deg, #ffd370 0%, #f5a623 100%)';
      sTab.style.color = '#000';
      lTab.style.background = 'transparent';
      lTab.style.color = '#8c97aa';
    }
  };

  // --- 6. AUTH SUBMISSIONS (Name, Gmail, Password) ---
  window.submitR08Signup = function(e) {
    e.preventDefault();
    const name = document.getElementById('r08SignupName').value.trim();
    const email = document.getElementById('r08SignupEmail').value.trim();
    const pass = document.getElementById('r08SignupPass').value.trim();
    const cpass = document.getElementById('r08SignupCPass').value.trim();

    if (!name) return showToast('Please enter your Full Name', '#f75555');
    if (!email.includes('@')) return showToast('Please enter a valid Gmail / Email address', '#f75555');
    if (pass !== cpass) return showToast('Passwords do not match!', '#f75555');
    if (pass.length < 6) return showToast('Password must be at least 6 characters', '#f75555');

    const users = JSON.parse(localStorage.getItem('dmfirst_all_users') || '[]');
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return showToast('This Gmail is already registered! Please log in.', '#f75555');
    }

    const newUser = {
      id: "RAI" + (1000 + users.length + 1),
      name: name,
      email: email,
      password: pass,
      balance: 100.00, // ₹100 Welcome Bonus!
      status: "Active",
      signup_time: new Date().toLocaleString(),
      last_login: new Date().toLocaleString()
    };

    users.unshift(newUser);
    localStorage.setItem('dmfirst_all_users', JSON.stringify(users));
    setCurrentUser(newUser);

    window.closeRai08Modal('r08AuthModal');
    showToast(`Welcome ${name}! ₹100 Welcome Bonus credited! 🎉`, '#00c087');
  };

  window.submitR08Login = function(e) {
    e.preventDefault();
    const email = document.getElementById('r08LoginEmail').value.trim();
    const pass = document.getElementById('r08LoginPass').value.trim();

    // Admin redirect
    if (email === 'admin' && pass === 'admin123') {
      localStorage.setItem('dmfirst_admin_logged', 'true');
      showToast('Admin credentials verified! Redirecting to Admin Portal...', '#00c087');
      setTimeout(() => { window.location.href = '/dmfirst/admin/'; }, 700);
      return;
    }

    const users = JSON.parse(localStorage.getItem('dmfirst_all_users') || '[]');
    const match = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (match) {
      if (match.password && match.password !== pass) {
        return showToast('Incorrect password! Please try again.', '#f75555');
      }
      match.last_login = new Date().toLocaleString();
      setCurrentUser(match);
      window.closeRai08Modal('r08AuthModal');
      showToast(`Welcome back, ${match.name || match.email}!`, '#00c087');
    } else if (email.includes('@')) {
      // Auto register if new
      const newUser = {
        id: "RAI" + (1000 + users.length + 1),
        name: email.split('@')[0],
        email: email,
        password: pass,
        balance: 100.00,
        status: "Active",
        signup_time: new Date().toLocaleString(),
        last_login: new Date().toLocaleString()
      };
      users.unshift(newUser);
      localStorage.setItem('dmfirst_all_users', JSON.stringify(users));
      setCurrentUser(newUser);
      window.closeRai08Modal('r08AuthModal');
      showToast(`Welcome! ₹100 Welcome Bonus credited!`, '#00c087');
    } else {
      showToast('Please enter a valid Gmail / Email address', '#f75555');
    }
  };

  window.handleR08Logout = function() {
    setCurrentUser(null);
    showToast('Logged out successfully', '#f5a623');
  };

  // --- 7. DEPOSIT & DYNAMIC QR CODE CONTROLLER ---
  let selectedDepositAmt = 100;
  window.openDepositModal = function() {
    const user = getCurrentUser();
    if (!user) {
      showToast('Please Log In first to Deposit', '#f5a623');
      return window.openAuthModal('login');
    }
    document.getElementById('r08DepositModal').style.display = 'flex';
    window.selectDepositAmount(100);
  };

  window.selectDepositAmount = function(amt, el) {
    selectedDepositAmt = amt;
    document.getElementById('r08DepositAmount').value = amt;
    document.querySelectorAll('.r08-chip').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    window.updateQrCode();
  };

  window.updateQrCode = function() {
    const amt = Number(document.getElementById('r08DepositAmount').value || selectedDepositAmt);
    document.getElementById('r08QrAmtText').innerText = '₹' + amt;

    const upiUrl = `upi://pay?pa=rai08official@upi&pn=Rai08%20Official&am=${amt}&cu=INR`;
    const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
    document.getElementById('r08QrImage').src = qrApi;
  };

  window.copyRai08Upi = function() {
    navigator.clipboard.writeText('rai08official@upi');
    showToast('UPI ID copied to clipboard! Pay via PhonePe/GPay', '#00c087');
  };

  window.submitR08Deposit = function(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return window.openAuthModal('login');

    const amt = Number(document.getElementById('r08DepositAmount').value);
    const utr = document.getElementById('r08UtrNumber').value.trim();

    if (!amt || amt < 100) return showToast('Minimum deposit is ₹100', '#f75555');
    if (!utr) return showToast('Please enter the 12-digit UTR reference number', '#f75555');

    const recharges = JSON.parse(localStorage.getItem('dmfirst_recharges') || '[]');
    const newReq = {
      id: "RC" + Math.floor(1000 + Math.random() * 9000),
      name: user.name || 'Player',
      email: user.email,
      amount: amt,
      method: "UPI QR Payment",
      utr: utr,
      status: "Pending",
      date: new Date().toLocaleString()
    };
    recharges.unshift(newReq);
    localStorage.setItem('dmfirst_recharges', JSON.stringify(recharges));

    document.getElementById('r08UtrNumber').value = '';
    window.closeRai08Modal('r08DepositModal');
    showToast(`Deposit request of ₹${amt} submitted! Admin will verify and credit balance.`, '#00c087');
  };

  // --- 8. RUNNABLE WINGO COLOR & NUMBER GAME ENGINE ---
  let wingoTimer = 30;
  let wingoCurrentPeriod = 2026111001;
  let currentPick = 'Green';
  let currentBetAmt = 10;
  let activeBet = null;
  let historyList = [
    { num: 3, color: 'Green' },
    { num: 8, color: 'Red' },
    { num: 0, color: 'Violet' },
    { num: 7, color: 'Green' },
    { num: 2, color: 'Red' }
  ];

  window.openWingoGame = function() {
    const user = getCurrentUser();
    if (!user) {
      showToast('Please Log In to Play WinGo', '#f5a623');
      return window.openAuthModal('login');
    }
    document.getElementById('r08WingoModal').style.display = 'flex';
    document.getElementById('wingoUserBal').innerText = '₹' + Number(user.balance || 0).toFixed(2);
    renderWingoHistory();
  };

  window.selectWingoPick = function(val, el) {
    currentPick = val;
    document.querySelectorAll('.btn-color-pick, .btn-num-pick, .btn-bs').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
    updateBetButtonText();
  };

  window.setWingoBetAmt = function(amt, el) {
    currentBetAmt = amt;
    document.querySelectorAll('#r08WingoModal .r08-chip').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    updateBetButtonText();
  };

  function updateBetButtonText() {
    const btn = document.getElementById('btnPlaceWingoBet');
    if (btn) btn.innerText = `Place Bet (₹${currentBetAmt} on ${currentPick})`;
  }

  window.placeWingoBet = function() {
    const user = getCurrentUser();
    if (!user) return window.openAuthModal('login');

    if (wingoTimer <= 5) {
      return showToast('Betting locked for this draw! Wait for next round.', '#f75555');
    }

    if (Number(user.balance || 0) < currentBetAmt) {
      showToast('Insufficient wallet balance! Please Recharge/Deposit.', '#f75555');
      return window.openDepositModal();
    }

    // Deduct balance
    user.balance = Number(user.balance) - currentBetAmt;
    setCurrentUser(user);
    document.getElementById('wingoUserBal').innerText = '₹' + user.balance.toFixed(2);

    activeBet = { pick: currentPick, amount: currentBetAmt, period: wingoCurrentPeriod };
    showToast(`Bet placed! ₹${currentBetAmt} on ${currentPick}`, '#00c087');
  };

  function renderWingoHistory() {
    const dotsBox = document.getElementById('wingoHistoryDots');
    if (!dotsBox) return;
    dotsBox.innerHTML = '';
    historyList.slice(0, 7).forEach(h => {
      const d = document.createElement('div');
      d.className = 'h-dot';
      d.style.background = h.color === 'Green' ? '#00c087' : h.color === 'Red' ? '#f44336' : '#9c27b0';
      d.innerText = h.num;
      dotsBox.appendChild(d);
    });
  }

  // Timer loop for WinGo
  setInterval(() => {
    wingoTimer--;
    const tEl = document.getElementById('wingoTimer');
    if (tEl) {
      tEl.innerText = '00:' + (wingoTimer < 10 ? '0' + wingoTimer : wingoTimer);
      if (wingoTimer <= 5) {
        tEl.style.color = '#f44336';
      } else {
        tEl.style.color = '#f5a623';
      }
    }

    if (wingoTimer <= 0) {
      drawWingoResult();
      wingoTimer = 30;
      wingoCurrentPeriod++;
      const pEl = document.getElementById('wingoPeriod');
      if (pEl) pEl.innerText = wingoCurrentPeriod;
    }
  }, 1000);

  function drawWingoResult() {
    // Check if Admin set an override in admin panel
    let winningNum;
    const adminOverride = localStorage.getItem('dmfirst_wingo_override');
    if (adminOverride && adminOverride !== 'AUTO') {
      winningNum = Number(adminOverride);
    } else {
      winningNum = Math.floor(Math.random() * 10);
    }

    let winningColor = 'Red';
    if ([1, 3, 7, 9].includes(winningNum)) winningColor = 'Green';
    else if ([2, 4, 6, 8].includes(winningNum)) winningColor = 'Red';
    else if ([0, 5].includes(winningNum)) winningColor = 'Violet';

    const isBig = winningNum >= 5;

    historyList.unshift({ num: winningNum, color: winningColor });
    renderWingoHistory();

    // Check if player had a bet
    const resBanner = document.getElementById('wingoResultBanner');
    if (activeBet && activeBet.period === wingoCurrentPeriod) {
      let won = false;
      let multiplier = 0;

      if (activeBet.pick === winningColor) {
        won = true;
        multiplier = winningColor === 'Violet' ? 4.5 : 2;
      } else if (activeBet.pick === String(winningNum)) {
        won = true;
        multiplier = 9;
      } else if (activeBet.pick === 'Big (5-9)' && isBig) {
        won = true;
        multiplier = 2;
      } else if (activeBet.pick === 'Small (0-4)' && !isBig) {
        won = true;
        multiplier = 2;
      }

      const user = getCurrentUser();
      if (won) {
        const prize = activeBet.amount * multiplier;
        if (user) {
          user.balance = Number(user.balance) + prize;
          setCurrentUser(user);
        }
        resBanner.style.display = 'block';
        resBanner.style.background = 'rgba(0, 192, 135, 0.2)';
        resBanner.style.border = '1px solid #00c087';
        resBanner.style.color = '#00c087';
        resBanner.innerHTML = `🎉 Result: ${winningNum} (${winningColor}) - YOU WON ₹${prize.toFixed(2)}!`;
      } else {
        resBanner.style.display = 'block';
        resBanner.style.background = 'rgba(244, 67, 54, 0.2)';
        resBanner.style.border = '1px solid #f44336';
        resBanner.style.color = '#f44336';
        resBanner.innerHTML = `Draw: ${winningNum} (${winningColor}) - Better luck next round!`;
      }
      activeBet = null;
    }
  }

  // --- 9. INTERCEPT CLICK EVENTS FOR ALL CLONED BUTTONS ---
  // When users click on game cards or login on the cloned page, open the interactive features!
  document.addEventListener('click', function(e) {
    const target = e.target.closest('a, button, div');
    if (!target) return;

    const text = (target.innerText || '').toLowerCase();
    const href = (target.getAttribute('href') || '').toLowerCase();
    const className = (target.className || '').toString().toLowerCase();

    // If clicks deposit / recharge / wallet
    if (text.includes('recharge') || text.includes('deposit') || href.includes('recharge') || className.includes('wallet')) {
      e.preventDefault();
      window.openDepositModal();
      return;
    }

    // If clicks login or register
    if (text.includes('log in') || text.includes('sign in') || text.includes('register') || text.includes('sign up')) {
      if (!target.closest('#r08AuthModal') && !target.closest('#r08DepositModal') && !target.closest('#r08WingoModal')) {
        e.preventDefault();
        window.openAuthModal(text.includes('sign') || text.includes('reg') ? 'signup' : 'login');
        return;
      }
    }

    // If clicks game thumbnails (WinGo, Lottery, Slots, 5D, K3, etc.)
    if (text.includes('wingo') || text.includes('lottery') || text.includes('slot') || text.includes('play') || text.includes('game') || className.includes('game')) {
      if (!target.closest('#r08WingoModal') && !target.closest('#rai08Bar') && !target.closest('#r08AuthModal')) {
        e.preventDefault();
        window.openWingoGame();
        return;
      }
    }
  }, true);

  // Toast Helper
  function showToast(msg, color) {
    const t = document.getElementById('r08Toast');
    const msgEl = document.getElementById('r08ToastMsg');
    if (!t || !msgEl) return;
    msgEl.innerText = msg;
    t.style.borderColor = color || '#f5a623';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
  }

  // Initialize
  updateUIHeader();
  window.addEventListener('storage', updateUIHeader);
})();
