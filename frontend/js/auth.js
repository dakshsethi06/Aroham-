// ---------- Auth (Supabase email/password) ----------

async function getUser() {
  const { data } = await db.auth.getUser();
  return data.user;
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
    
    if (profileLink) profileLink.classList.remove("hidden");
    if (ordersLink) ordersLink.classList.remove("hidden");
  } else {
    link.textContent = "Login";
    link.href = ROOT + "pages/login.html";
    link.onclick = null;
    
    if (profileLink) profileLink.classList.add("hidden");
    if (ordersLink) ordersLink.classList.add("hidden");
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
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return showToast(error.message);
  
  // Clear local cart of previous user (Bug 5)
  localStorage.removeItem("aroham_cart");
  if (typeof updateCartBadge === "function") {
    updateCartBadge();
  }

  showToast("Welcome back!");
  setTimeout(() => (window.location.href = ROOT + "index.html"), 900);
}

async function handleSignup(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (password.length < 6) return showToast("Password must be 6+ characters");
  const { error } = await db.auth.signUp({ email, password });
  if (error) return showToast(error.message);
  showToast("Account created! You can login now.");
}

async function checkRedirect() {
  const user = await getUser();
  if (user) {
    const path = window.location.pathname;
    if (path.endsWith("login.html") || path.endsWith("signup.html")) {
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
