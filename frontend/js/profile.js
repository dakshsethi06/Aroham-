// ---------- Profile controller details handler ----------

async function fetchProfileDetails() {
  const user = await requireLogin();
  if (!user) return;

  try {
    const data = await api("/auth/profile");
    
    document.getElementById("prof-fullname").value = data.full_name || "";
    document.getElementById("prof-email").value = data.email || user.email || "";
    document.getElementById("prof-phone").value = data.phone || "";
    document.getElementById("prof-gender").value = data.gender || "";
    
    // Formatting date to YYYY-MM-DD
    if (data.dob) {
      try {
        const d = new Date(data.dob);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        document.getElementById("prof-dob").value = `${yyyy}-${mm}-${dd}`;
      } catch (e) {
        document.getElementById("prof-dob").value = data.dob;
      }
    } else {
      document.getElementById("prof-dob").value = "";
    }

    document.getElementById("prof-tob").value = data.tob || "";
    document.getElementById("prof-pob-city").value = data.pob_city || "";
    document.getElementById("prof-pob-state").value = data.pob_state || "";
    document.getElementById("prof-pob-country").value = data.pob_country || "India";
    document.getElementById("prof-address").value = data.address || "";

  } catch (e) {
    showToast("Failed to load profile details: " + e.message);
  }
}

async function saveProfileDetails(e) {
  e.preventDefault();
  
  const payload = {
    fullName: document.getElementById("prof-fullname").value.trim(),
    phone: document.getElementById("prof-phone").value.trim(),
    gender: document.getElementById("prof-gender").value,
    dob: document.getElementById("prof-dob").value || null,
    tob: document.getElementById("prof-tob").value || null,
    pobCity: document.getElementById("prof-pob-city").value.trim(),
    pobState: document.getElementById("prof-pob-state").value.trim(),
    pobCountry: document.getElementById("prof-pob-country").value.trim(),
    address: document.getElementById("prof-address").value.trim()
  };
  
  if (!/^\d{10}$/.test(payload.phone)) {
    return showToast("Phone number must be exactly 10 digits");
  }

  try {
    showToast("Saving details...");
    await api("/auth/profile", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    showToast("Sacred profile updated successfully! ✓");
  } catch (e) {
    showToast("Failed to save profile: " + e.message);
  }
}

document.addEventListener("DOMContentLoaded", fetchProfileDetails);
