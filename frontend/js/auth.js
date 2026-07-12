// ---------- Auth (Supabase email/password) ----------

async function getUser() {
  const { data } = await db.auth.getSession();
  return data.session?.user || null;
}

async function requireLogin() {
  const user = await getUser();
  if (!user) {
    showToast("Please login first");
    setTimeout(() => (window.location.href = ROOT + "pages/login.html"), 900);
    return null;
  }
  return user;
}

async function updateAuthLink() {
  const link = document.getElementById("auth-link");
  if (!link) return;
  const user = await getUser();
  
  const profileLink = document.getElementById("profile-nav-link");
  const ordersLink = document.getElementById("orders-nav-link");
  const adminLink = document.getElementById("admin-nav-link");
  const astrologerLink = document.getElementById("astrologer-nav-link");
  const chatLink = document.getElementById("chat-nav-link");
  const astroLoginBtn = document.getElementById("astro-login-btn"); // navbar "Astrologer Login" button

  if (user) {
    link.textContent = "Logout";
    link.href = "#";
    link.onclick = async (e) => {
      e.preventDefault();
      await db.auth.signOut();
      localStorage.removeItem("aroham_cart");
      if (typeof updateCartBadge === "function") {
        updateCartBadge();
      }
      showToast("Logged out");
      setTimeout(() => (window.location.href = ROOT + "index.html"), 800);
    };

    // Hide the Astrologer Login navbar button when logged in
    if (astroLoginBtn) astroLoginBtn.classList.add("hidden");
    
    // Check user's role to toggle the right links
    try {
      const role = user.user_metadata?.role;

      if (role === "astrologer") {
        if (astrologerLink) astrologerLink.classList.remove("hidden");
        if (profileLink) profileLink.classList.add("hidden");
        if (ordersLink) ordersLink.classList.add("hidden");
        if (chatLink) chatLink.classList.add("hidden");
      } else {
        if (astrologerLink) astrologerLink.classList.add("hidden");
        if (profileLink) profileLink.classList.remove("hidden");
        if (ordersLink) ordersLink.classList.remove("hidden");
        if (chatLink) chatLink.classList.remove("hidden");
      }
    } catch (_) {
      if (profileLink) profileLink.classList.remove("hidden");
      if (ordersLink) ordersLink.classList.remove("hidden");
    }

    // Only show Admin link if backend confirms this email is whitelisted
    if (adminLink) {
      try {
        const session = (await db.auth.getSession()).data.session;
        const r = await fetch(API_BASE + "/admin/check", { headers: { Authorization: "Bearer " + session.access_token } });
        if (r.ok) adminLink.classList.remove("hidden");
      } catch (_) { /* not admin, stay hidden */ }
    }
  } else {
    link.textContent = "Login";
    link.href = ROOT + "pages/login.html";
    link.onclick = null;
    
    // Show Astrologer Login button when logged out
    if (astroLoginBtn) astroLoginBtn.classList.remove("hidden");

    if (profileLink) profileLink.classList.add("hidden");
    if (ordersLink) ordersLink.classList.add("hidden");
    if (adminLink) adminLink.classList.add("hidden");
    if (astrologerLink) astrologerLink.classList.add("hidden");
    if (chatLink) chatLink.classList.add("hidden");
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const emailOrPhone = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Validation checks (Bug 3)
  if (!emailOrPhone) return showToast("Email or Phone number is required");
  if (!password) return showToast("Password is required");
  if (password.length < 8) return showToast("Password must be at least 8 characters");

  let email = emailOrPhone;
  // If it's digits, it's a phone number (Bug 2)
  if (/^\d+$/.test(emailOrPhone)) {
    if (emailOrPhone.length !== 10) {
      return showToast("Phone number must be exactly 10 digits");
    }
    showToast("Looking up phone number...");
    try {
      const res = await fetch(API_BASE + "/auth/email-by-phone?phone=" + encodeURIComponent(emailOrPhone));
      const data = await res.json();
      if (!res.ok || !data.email) {
        return showToast(data.error || "No account found with this phone number");
      }
      email = data.email;
    } catch (err) {
      return showToast("Failed to lookup phone number");
    }
  } else {
    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return showToast("Please enter a valid email address");
    }
  }

  showToast("Logging in...");
  const { data: authData, error } = await db.auth.signInWithPassword({ email, password });
  if (error) return showToast(error.message);
  
  // Clear local cart of previous user (Bug 5)
  localStorage.removeItem("aroham_cart");
  if (typeof updateCartBadge === "function") {
    updateCartBadge();
  }

  showToast("Welcome back!");
  const role = authData.user?.user_metadata?.role;
  await handlePostLoginRedirect(role);
}

async function handlePostLoginRedirect(role) {
  if (role === "astrologer") {
    setTimeout(() => (window.location.href = ROOT + "pages/astrologer-dashboard.html"), 900);
    return;
  }
  
  const intentStr = localStorage.getItem("aroham_buy_now_intent");
  if (intentStr) {
    try {
      const intent = JSON.parse(intentStr);
      localStorage.removeItem("aroham_buy_now_intent");
      showToast("Adding item to cart...");
      await api("/cart/buy-now", { method: "POST", body: JSON.stringify({ productId: intent.productId, qty: intent.qty }) });
      setTimeout(() => (window.location.href = ROOT + "pages/cart.html?checkout=buy_now"), 900);
      return;
    } catch (e) {
      console.error("Failed to process buy now intent:", e);
    }
  }
  
  setTimeout(() => (window.location.href = ROOT + "index.html"), 900);
}

async function handleSignup(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (password.length < 8) return showToast("Password must be at least 8 characters");
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return showToast("Password must contain at least one letter and one number");
  }
  const { error } = await db.auth.signUp({ email, password });
  if (error) return showToast(error.message);
  showToast("Account created! You can login now.");
}

async function checkRedirect() {
  const user = await getUser();
  if (user) {
    const path = window.location.pathname;
    if (path.endsWith("login.html") || path.endsWith("signup.html")) {
      // Check role — astrologers always go to their dashboard
      try {
        const role = user.user_metadata?.role;

        if (role === "astrologer") {
          window.location.href = ROOT + "pages/astrologer-dashboard.html";
          return;
        }
      } catch (_) {}
      window.location.href = ROOT + "index.html";
    }
  }
}

function switchAuthTab(tab) {
  const signinView = document.getElementById("signin-view");
  const signupView = document.getElementById("signup-view");
  const tabSignin = document.getElementById("tab-signin");
  const tabSignup = document.getElementById("tab-signup");
  if (!signinView || !signupView) return;

  if (tab === "signin") {
    signinView.classList.remove("hidden");
    signupView.classList.add("hidden");
    tabSignin.classList.add("active");
    tabSignup.classList.remove("active");
  } else {
    signupView.classList.remove("hidden");
    signinView.classList.add("hidden");
    tabSignup.classList.add("active");
    tabSignin.classList.remove("active");
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "Hide";
  } else {
    input.type = "password";
    btn.textContent = "Show";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateAuthLink();
  checkRedirect();
  const params = new URLSearchParams(window.location.search);
  if (params.get("tab") === "signup") {
    switchAuthTab("signup");
  }
});
