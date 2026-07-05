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
  if (user) {
    link.textContent = "Logout";
    link.href = "#";
    link.onclick = async (e) => {
      e.preventDefault();
      await db.auth.signOut();
      showToast("Logged out");
      setTimeout(() => (window.location.href = ROOT + "index.html"), 800);
    };
  } else {
    link.textContent = "Login";
    link.href = ROOT + "pages/login.html";
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return showToast(error.message);
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

document.addEventListener("DOMContentLoaded", updateAuthLink);
