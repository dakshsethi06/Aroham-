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
      if (res.ok) { signupSuccess = true; showToast("Account created successfully! 🎉"); }
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
      else { showToast("Account created successfully! 🎉"); }
    }
    setTimeout(() => { window.location.href = "login.html"; }, 2000);
  } catch (err) { showToast(err.message); }
}
