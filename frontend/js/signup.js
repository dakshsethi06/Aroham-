// ---------- Custom signup with OTP handling ----------
window.isPhoneVerified = false;

function triggerPhoneVerification() {
  const phone = document.getElementById("signup-phone").value.trim();
  if (!phone || !/^\d{10}$/.test(phone)) return showToast("Please enter a valid 10-digit phone number first");
  document.getElementById("otp-modal").classList.remove("hidden");
  document.getElementById("otp-input").focus();
}

function closeOtpModal() {
  document.getElementById("otp-modal").classList.add("hidden");
  document.getElementById("otp-input").value = "";
}

function verifyOtp(e) {
  e.preventDefault();
  const otp = document.getElementById("otp-input").value.trim();
  if (otp !== "1234") { return showToast("Invalid OTP. Enter 1234."); }
  window.isPhoneVerified = true;
  document.getElementById("signup-phone").readOnly = true;
  document.getElementById("btn-verify-phone").classList.add("hidden");
  document.getElementById("phone-verified-badge").classList.remove("hidden");
  showToast("Phone verified successfully! ✓"); 
  closeOtpModal();
  updateContinueButtonState();
}

function updateContinueButtonState() {
  const termsChecked = document.getElementById("signup-terms").checked;
  const btn = document.getElementById("btn-signup-continue");
  if (!btn) return;
  if (termsChecked && window.isPhoneVerified) {
    btn.removeAttribute("disabled");
    btn.style.background = ""; // Restore to primary button color
    btn.style.cursor = "pointer";
  } else {
    btn.setAttribute("disabled", "true");
    btn.style.background = "var(--muted)";
    btn.style.cursor = "not-allowed";
  }
}

function advanceToStep2(e) {
  e.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const phone = document.getElementById("signup-phone").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("signup-confirm-password").value;

  if (!name) return showToast("Please enter your full name");
  if (!window.isPhoneVerified) return showToast("Please verify your phone number first");
  if (password.length < 8) return showToast("Password must be at least 8 characters");
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return showToast("Password must contain at least one letter and one number");
  }
  if (password !== confirmPassword) return showToast("Passwords do not match");

  // Show Step 2, hide Step 1
  document.getElementById("signup-step-1").classList.add("hidden");
  document.getElementById("signup-step-2").classList.remove("hidden");
}

function goBackToStep1() {
  document.getElementById("signup-step-2").classList.add("hidden");
  document.getElementById("signup-step-1").classList.remove("hidden");
}

async function handleDoneSubmit(e) {
  e.preventDefault();
  
  const fullName = document.getElementById("signup-name").value.trim();
  const phone = document.getElementById("signup-phone").value.trim();
  const password = document.getElementById("signup-password").value;
  
  const email = document.getElementById("signup-email").value.trim();
  const gender = document.getElementById("signup-gender").value;
  const dob = document.getElementById("signup-dob").value;
  const tob = document.getElementById("signup-tob").value || null;
  const address = document.getElementById("signup-address").value.trim() || null;
  const pobVal = document.getElementById("signup-pob").value.trim();

  // Validate step 2
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast("Please enter a valid email address");
  if (!gender) return showToast("Gender is required");
  if (!dob) return showToast("Date of Birth is required");

  let pobCity = null, pobState = null, pobCountry = null;
  if (pobVal) {
    const parts = pobVal.split(",").map(s => s.trim());
    pobCity = parts[0] || null; pobState = parts[1] || null; pobCountry = parts[2] || null;
  }

  showToast("Creating account...");
  const payload = { email, password, fullName, phone, otp: "1234", address, gender, dob, tob, pobCity, pobState, pobCountry };
  try {
    let signupSuccess = false;
    try {
      const res = await fetch(API_BASE + "/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      const body = await res.json();
      if (res.ok) { signupSuccess = true; }
      else { console.warn("Backend failed, falling back:", body.error); }
    } catch (err) { console.warn("Backend offline/error, falling back:", err.message); }

    if (!signupSuccess) {
      const { data, error: authErr } = await db.auth.signUp({
        email, password, options: { data: { full_name: fullName, phone } }
      });
      if (authErr) throw authErr;
      if (!data.user) throw new Error("Signup failed");
      const { error: profErr } = await db.from("users").insert({
        id: data.user.id, full_name: fullName, phone, email, gender, dob, tob, pob_city: pobCity, pob_state: pobState, pob_country: pobCountry, address
      });
      if (profErr) { showToast("Account created, but database users table was missing."); }
    }

    showToast("Account created successfully! 🎉");

    // Auto-login (Bug 4)
    showToast("Logging in...");
    const { error: loginErr } = await db.auth.signInWithPassword({ email, password });
    if (loginErr) {
      showToast("Account created! Please log in.");
      setTimeout(() => { window.location.href = "login.html"; }, 1500);
    } else {
      showToast("Welcome to Aroham! 🎉");
      setTimeout(() => { window.location.href = "../index.html"; }, 1200);
    }
  } catch (err) { showToast(err.message); }
}

document.addEventListener("DOMContentLoaded", () => {
  const termsCheckbox = document.getElementById("signup-terms");
  if (termsCheckbox) {
    termsCheckbox.addEventListener("change", updateContinueButtonState);
  }
  const phoneInput = document.getElementById("signup-phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", updateContinueButtonState);
  }
});
