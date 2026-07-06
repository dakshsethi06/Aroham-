// ---------- Custom signup with OTP handling ----------
window.isPhoneVerified = false;

function triggerPhoneVerification() {
  const phone = document.getElementById("phone").value.trim();
  if (!phone) return showToast("Please enter phone number first");
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
  document.getElementById("phone").readOnly = true;
  document.getElementById("btn-verify-phone").classList.add("hidden");
  document.getElementById("phone-verified-badge").classList.remove("hidden");
  showToast("Phone verified successfully! ✓"); closeOtpModal();
}

async function handleDoneSubmit(e) {
  e.preventDefault();
  if (!window.isPhoneVerified) { return showToast("Please verify your phone number first"); }

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const fullName = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const gender = document.getElementById("gender").value;
  const dob = document.getElementById("dob").value;
  const tob = document.getElementById("tob").value || null;
  const address = document.getElementById("address").value.trim() || null;
  const pobVal = document.getElementById("pob").value.trim();

  // Client-side Validation Checks (Bug 3)
  if (!fullName) return showToast("Full Name is required");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast("Please enter a valid email address");
  if (!phone || !/^\d{10}$/.test(phone)) return showToast("Please enter a valid 10-digit phone number");
  if (!password || password.length < 6) return showToast("Password must be at least 6 characters");
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
