// ============================================================
// AROHAM – 3-Step Signup Flow
// Step 1 : Enter email OR phone → OTP verify
// Step 2 : Enter the other contact (email if phone was given, vice versa)
//           → OTP verify + Password
// Step 3 : Personal details → Submit
// ============================================================

// ---- State ----
const _s = {
  step1Contact: "",      // value entered in step 1
  step1Type: "",         // "email" | "phone"
  step1Verified: false,
  step2Contact: "",      // value entered in step 2
  step2Type: "",         // "email" | "phone" (opposite of step 1)
  step2Verified: false,
  email: "",
  phone: "",
};

// ---- Progress indicator ----
function goToStep(n) {
  [1, 2, 3].forEach(i => {
    const el = document.getElementById("signup-step-" + i);
    if (el) el.classList.toggle("hidden", i !== n);
    const dot = document.getElementById("dot-" + i);
    if (dot) {
      dot.style.background = i < n ? "#2ecc71" : i === n ? "var(--maroon)" : "var(--line)";
      dot.style.color = i <= n ? "#fff" : "var(--muted)";
    }
  });
  // Progress lines
  const l12 = document.getElementById("line-1-2");
  const l23 = document.getElementById("line-2-3");
  if (l12) l12.style.background = n > 1 ? "#2ecc71" : "var(--line)";
  if (l23) l23.style.background = n > 2 ? "#2ecc71" : "var(--line)";
}

// ---- STEP 1 ----

function s1DetectType(val) {
  const hint = document.getElementById("s1-contact-hint");
  const btn  = document.getElementById("s1-send-btn");
  val = val.trim();
  if (/^\d+$/.test(val)) {
    // Looks like phone
    if (val.length === 10) {
      hint.textContent = "✓ Looks like a phone number";
      hint.style.color = "#2ecc71";
      btn.removeAttribute("disabled");
      btn.style.opacity = "1";
    } else {
      hint.textContent = "Phone number must be 10 digits";
      hint.style.color = "var(--muted)";
      btn.setAttribute("disabled", "true");
      btn.style.opacity = "0.5";
    }
  } else if (val.includes("@")) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      hint.textContent = "✓ Looks like an email address";
      hint.style.color = "#2ecc71";
      btn.removeAttribute("disabled");
      btn.style.opacity = "1";
    } else {
      hint.textContent = "Please enter a valid email address";
      hint.style.color = "var(--muted)";
      btn.setAttribute("disabled", "true");
      btn.style.opacity = "0.5";
    }
  } else {
    hint.textContent = "Enter your email or 10-digit phone number";
    hint.style.color = "var(--muted)";
    btn.setAttribute("disabled", "true");
    btn.style.opacity = "0.5";
  }
}

async function s1SendOtp() {
  const val = document.getElementById("s1-contact").value.trim();
  const isPhone = /^\d{10}$/.test(val);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  if (!isPhone && !isEmail) return showToast("Please enter a valid email or 10-digit phone");

  // Check for already registered
  if (isEmail) {
    try {
      const res = await fetch(API_BASE + "/auth/check-email?email=" + encodeURIComponent(val));
      if (res.status === 409) {
        showAlreadyRegisteredPopup();
        return;
      }
    } catch (_) {}
  }

  _s.step1Contact = val;
  _s.step1Type = isPhone ? "phone" : "email";

  // Show OTP row
  document.getElementById("s1-otp-row").classList.remove("hidden");
  document.getElementById("s1-otp-input").value = "";
  document.getElementById("s1-otp-input").focus();
  showToast("OTP sent! Use 1234 (demo mode)");
}

function s1VerifyOtp() {
  const otp = document.getElementById("s1-otp-input").value.replace(/\s/g, '');
  if (otp !== "1234") return showToast("Invalid OTP. Enter 1234.");

  _s.step1Verified = true;
  document.getElementById("s1-verified-banner").classList.remove("hidden");
  document.getElementById("s1-otp-row").style.pointerEvents = "none";
  document.getElementById("s1-contact").readOnly = true;
  document.getElementById("s1-send-btn").classList.add("hidden");

  // Enable continue
  const btn = document.getElementById("s1-next-btn");
  btn.removeAttribute("disabled");
  btn.style.background = "";
  btn.style.cursor = "pointer";

  showToast("Verified! ✓");
}

function s1Proceed() {
  if (!_s.step1Verified) return showToast("Please verify your contact first");

  // Determine what the second step should ask for
  _s.step2Type = _s.step1Type === "phone" ? "email" : "phone";

  const label = document.getElementById("s2-contact-label");
  const input = document.getElementById("s2-contact");
  const sub   = document.getElementById("s2-sub");

  if (_s.step2Type === "email") {
    label.textContent = "Email Address";
    input.placeholder = "you@example.com";
    input.type = "email";
    sub.textContent = "Your phone is verified! Now add your email and set a password.";
  } else {
    label.textContent = "Phone Number";
    input.placeholder = "9876543210";
    input.type = "tel";
    input.maxLength = 10;
    sub.textContent = "Your email is verified! Now add your phone number and set a password.";
  }

  goToStep(2);
}

// ---- STEP 2 ----

function s2EnableSend() {
  const val = document.getElementById("s2-contact").value.trim();
  const btn = document.getElementById("s2-send-btn");
  const valid = _s.step2Type === "email"
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
    : /^\d{10}$/.test(val);

  if (valid) { btn.removeAttribute("disabled"); btn.style.opacity = "1"; }
  else        { btn.setAttribute("disabled", "true"); btn.style.opacity = "0.5"; }
}

async function s2SendOtp() {
  const val = document.getElementById("s2-contact").value.trim();
  const isEmail = _s.step2Type === "email";

  if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return showToast("Please enter a valid email address");
  if (!isEmail && !/^\d{10}$/.test(val)) return showToast("Phone number must be exactly 10 digits");

  // Check email duplicate
  if (isEmail) {
    try {
      const res = await fetch(API_BASE + "/auth/check-email?email=" + encodeURIComponent(val));
      if (res.status === 409) { showAlreadyRegisteredPopup(); return; }
    } catch (_) {}
  }

  _s.step2Contact = val;
  document.getElementById("s2-otp-row").classList.remove("hidden");
  document.getElementById("s2-otp-input").value = "";
  document.getElementById("s2-otp-input").focus();
  showToast("OTP sent! Use 1234 (demo mode)");
}

function s2VerifyOtp() {
  const otp = document.getElementById("s2-otp-input").value.replace(/\s/g, '');
  if (otp !== "1234") return showToast("Invalid OTP. Enter 1234.");

  _s.step2Verified = true;
  document.getElementById("s2-verified-banner").classList.remove("hidden");
  document.getElementById("s2-otp-row").style.pointerEvents = "none";
  document.getElementById("s2-contact").readOnly = true;
  document.getElementById("s2-send-btn").classList.add("hidden");

  // Resolve email and phone from both steps
  if (_s.step1Type === "email") {
    _s.email = _s.step1Contact;
    _s.phone = _s.step2Contact;
  } else {
    _s.phone = _s.step1Contact;
    _s.email = _s.step2Contact;
  }

  // Enable continue button (also needs terms check)
  _s._step2OtpDone = true;
  s2CheckContinue();
  showToast("Verified! ✓");
}

function s2CheckContinue() {
  const terms = document.getElementById("signup-terms")?.checked;
  const btn   = document.getElementById("s2-next-btn");
  if (!btn) return;
  if (_s._step2OtpDone && terms) {
    btn.removeAttribute("disabled");
    btn.style.background = "";
    btn.style.cursor = "pointer";
  } else {
    btn.setAttribute("disabled", "true");
    btn.style.background = "var(--muted)";
    btn.style.cursor = "not-allowed";
  }
}

function s2Proceed(e) {
  e.preventDefault();
  if (!_s.step2Verified) return showToast("Please verify your " + _s.step2Type + " first");
  const pass = document.getElementById("signup-password").value;
  const conf = document.getElementById("signup-confirm-password").value;
  if (pass.length < 8) return showToast("Password must be at least 8 characters");
  if (!/[a-zA-Z]/.test(pass) || !/\d/.test(pass)) return showToast("Password must contain letters and numbers");
  if (pass !== conf) return showToast("Passwords do not match");
  if (!document.getElementById("signup-terms")?.checked) return showToast("Please accept the terms");
  goToStep(3);
}

// ---- STEP 3 (final submit) ----

async function handleDoneSubmit(e) {
  e.preventDefault();

  const fullName = document.getElementById("signup-name").value.trim();
  const gender   = document.getElementById("signup-gender").value;
  const dob      = document.getElementById("signup-dob").value;
  const tob      = document.getElementById("signup-tob").value || null;
  const address  = document.getElementById("signup-address").value.trim() || null;
  const pobVal   = document.getElementById("signup-pob").value.trim();
  const password = document.getElementById("signup-password").value;

  if (!fullName)  return showToast("Please enter your full name");
  if (!gender)    return showToast("Gender is required");
  if (!dob)       return showToast("Date of Birth is required");
  if (!_s.email)  return showToast("Email is missing — please go back");
  if (!_s.phone)  return showToast("Phone is missing — please go back");

  let pobCity = null, pobState = null, pobCountry = null;
  if (pobVal) {
    const parts = pobVal.split(",").map(s => s.trim());
    pobCity = parts[0] || null; pobState = parts[1] || null; pobCountry = parts[2] || null;
  }

  const isAstrologerEl = document.getElementById("signup-as-astrologer");
  const isAstrologer   = isAstrologerEl ? (isAstrologerEl.value === "true" || isAstrologerEl.checked) : false;
  const role = isAstrologer ? "astrologer" : "user";

  showToast("Creating your account...");
  const payload = { email: _s.email, password, fullName, phone: _s.phone, otp: "1234", address, gender, dob, tob, pobCity, pobState, pobCountry, role };

  try {
    let signupSuccess = false;
    try {
      const res = await fetch(API_BASE + "/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      const body = await res.json();
      if (res.ok) {
        signupSuccess = true;
      } else if (res.status === 409) {
        showAlreadyRegisteredPopup(); return;
      } else {
        console.warn("Backend error:", body.error);
      }
    } catch (err) { console.warn("Backend offline:", err.message); }

    if (!signupSuccess) {
      const { data, error: authErr } = await db.auth.signUp({ email: _s.email, password });
      if (authErr) {
        if (authErr.message?.toLowerCase().includes("already registered")) { showAlreadyRegisteredPopup(); return; }
        throw authErr;
      }
      if (!data.user) throw new Error("Signup failed");
      await db.from("users").insert({
        id: data.user.id, full_name: fullName, phone: _s.phone, email: _s.email,
        gender, dob, tob, pob_city: pobCity, pob_state: pobState, pob_country: pobCountry, address, role
      });
    }

    showToast("Account created! 🎉");
    const { error: loginErr } = await db.auth.signInWithPassword({ email: _s.email, password });
    if (loginErr) {
      showToast("Account created! Please sign in."); setTimeout(() => location.href = "login.html", 1500);
    } else {
      showToast("Welcome to Aroham! 🙏");
      await handlePostLoginRedirect(role);
    }
  } catch (err) {
    if (err.message?.toLowerCase().includes("already registered")) showAlreadyRegisteredPopup();
    else showToast(err.message);
  }
}

// ---- Helpers ----

function showAlreadyRegisteredPopup() {
  const existing = document.getElementById("already-reg-popup");
  if (existing) existing.remove();
  const popup = document.createElement("div");
  popup.id = "already-reg-popup";
  popup.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:9999;";
  popup.innerHTML = `
    <div style="background:#fff;border-radius:18px;padding:36px 32px;max-width:360px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
      <div style="font-size:3rem;margin-bottom:12px;">🙏</div>
      <h3 style="font-family:'Fraunces',serif;color:var(--maroon);margin-bottom:8px;font-size:1.4rem;">Already Registered!</h3>
      <p style="color:var(--muted);font-size:0.9rem;line-height:1.5;margin-bottom:24px;">
        This email is already linked to an Aroham account.<br/>Please sign in instead.
      </p>
      <button onclick="document.getElementById('already-reg-popup').remove();switchAuthTab('signin');"
        style="width:100%;padding:13px;border-radius:50px;background:var(--maroon);color:#fff;font-weight:700;font-size:0.95rem;border:none;cursor:pointer;margin-bottom:10px;"
        onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">Sign In Instead</button>
      <button onclick="document.getElementById('already-reg-popup').remove();"
        style="width:100%;padding:11px;border-radius:50px;background:transparent;color:var(--muted);font-size:0.88rem;border:1.5px solid var(--line);cursor:pointer;">Use Different Email</button>
    </div>`;
  document.body.appendChild(popup);
}

// Legacy stubs (in case any inline handlers reference these old names)
function closeOtpModal() { document.getElementById("otp-modal")?.classList.add("hidden"); }
function triggerPhoneVerification() {}
function updateContinueButtonState() {}
function advanceToStep2() {}
function goBackToStep1() { goToStep(1); }
function checkEmailExists() {}
function clearEmailError() {}

// Wire up terms checkbox for step 2 continue button
document.addEventListener("DOMContentLoaded", () => {
  const terms = document.getElementById("signup-terms");
  if (terms) terms.addEventListener("change", s2CheckContinue);
  // Init step dots
  goToStep(1);
});
