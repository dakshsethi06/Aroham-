const router = require("express").Router();
const supabase = require("../config/supabase");

// GET /api/auth/email-by-phone - Lookup email associated with a phone number
router.get("/email-by-phone", async (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: "Phone number is required" });
  try {
    const { data, error } = await supabase
      .from("users")
      .select("email")
      .eq("phone", phone.trim())
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "No account found with this phone number" });
    res.json({ email: data.email });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/signup - Email & password signup
router.post("/signup", async (req, res) => {
  const {
    email, password, fullName, phone, otp,
    address, gender, dob, tob, pobCity, pobState, pobCountry
  } = req.body;

  try {
    if (otp !== "1234") {
      return res.status(400).json({ error: "Invalid OTP. Please enter 1234." });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    if (!phone || !/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
    }
    if (!password || password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters and contain at least one letter and one number" });
    }

    // Create user in Supabase auth using email + password (marks email_confirm: true to bypass verification)
    const { data, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone }
    });

    if (authErr) throw authErr;
    if (!data.user) throw new Error("Failed to create user account");

    // Insert user details into public users table
    const { error: profErr } = await supabase
      .from("users")
      .insert({
        id: data.user.id,
        full_name: fullName,
        phone,
        email,
        gender,
        dob,
        tob: tob || null,
        pob_city: pobCity || null,
        pob_state: pobState || null,
        pob_country: pobCountry || null,
        address: address || null
      });

    if (profErr) throw profErr;
    res.json({ success: true, message: "Account created successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const requireAuth = require("../middleware/auth");

// GET /api/auth/profile - Fetch profile details
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .maybeSingle();

    if (error) throw error;
    res.json(data || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/profile - Update profile details
router.post("/profile", requireAuth, async (req, res) => {
  const { fullName, phone, gender, dob, tob, pobCity, pobState, pobCountry, address } = req.body;
  if (!phone || !/^\d{10}$/.test(phone.trim())) {
    return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
  }
  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        full_name: fullName,
        phone: phone ? phone.trim() : null,
        gender: gender || null,
        dob: dob || null,
        tob: tob || null,
        pob_city: pobCity || null,
        pob_state: pobState || null,
        pob_country: pobCountry || null,
        address: address || null
      })
      .eq("id", req.user.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

