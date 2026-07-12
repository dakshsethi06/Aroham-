// ---------- Astrologer Dashboard Logic & Realtime Communication ----------

let activeSessionId = null;
let requestsSubscription = null;
let messagesSubscription = null;
let activeSessionSubscription = null;
let currentUser = null;
let activeRequests = {};

async function initAstrologerDashboard() {
  currentUser = await requireLogin();
  if (!currentUser) return;

  // Verify role
  try {
    const role = currentUser.user_metadata?.role;
    if (role !== "astrologer") {
      showToast("Access Denied: Astrologers Only");
      setTimeout(() => (window.location.href = "../index.html"), 1500);
      return;
    }
  } catch (err) {
    showToast("Verification failed: " + err.message);
    setTimeout(() => (window.location.href = "../index.html"), 1500);
    return;
  }

  // Set database state to online on load
  try {
    await db
      .from("users")
      .update({ is_online: true })
      .eq("id", currentUser.id);

    const toggle = document.getElementById("status-toggle");
    if (toggle) toggle.value = "online";
    const dot = document.getElementById("status-pulse-dot");
    if (dot) dot.classList.remove("offline");

    // Populate sidebar profile info
    const { data: profile } = await db
      .from("users")
      .select("full_name")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (profile) {
      const nameEl = document.getElementById("astro-profile-name");
      const avatarEl = document.getElementById("astro-profile-avatar");
      if (nameEl) nameEl.textContent = profile.full_name;
      if (avatarEl && profile.full_name) {
        avatarEl.textContent = profile.full_name.charAt(0).toUpperCase();
      }
    }

    // Load sessions count completed today
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const { count } = await db
      .from("chat_sessions")
      .select("*", { count: "exact", head: true })
      .eq("astrologer_id", currentUser.id)
      .eq("status", "COMPLETED")
      .gte("created_at", startOfDay.toISOString());

    const countEl = document.getElementById("stat-consultations-count");
    if (countEl) countEl.textContent = count || 0;

  } catch (err) {
    console.error("Failed to set status online or load profile summary:", err);
  }

  // Load existing session if any (for page reload recovery)
  checkExistingSession();
  
  // Listen for real-time consultation requests
  subscribeToRequests();
}

// 1. Recover active ACCEPTED session if any
async function checkExistingSession() {
  try {
    const { data: sessions, error } = await db
      .from("chat_sessions")
      .select("*")
      .eq("astrologer_id", currentUser.id)
      .eq("status", "ACCEPTED")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;
    if (sessions && sessions.length > 0) {
      const session = sessions[0];
      activeSessionId = session.id;
      
      // Get customer profile
      const { data: customerProfile } = await db
        .from("users")
        .select("*")
        .eq("id", session.user_id)
        .maybeSingle();

      const customerName = customerProfile ? customerProfile.full_name : "Customer";
      enterChatRoom(session.id, customerName, customerProfile);
    }
  } catch (err) {
    console.error("Failed to check active chat sessions:", err);
  }
}

// 2. Real-time subscription to incoming requests
function subscribeToRequests() {
  if (requestsSubscription) {
    db.removeChannel(requestsSubscription);
  }

  // Also query existing PENDING requests on load
  loadPendingRequests();

  requestsSubscription = db
    .channel("incoming-requests-channel")
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to insert/update/deletes
        schema: "public",
        table: "chat_sessions",
        filter: `astrologer_id=eq.${currentUser.id}`
      },
      (payload) => {
        const session = payload.new;
        const oldSession = payload.old;

        if (payload.eventType === "INSERT" && session.status === "PENDING") {
          addRequestToList(session);
        } else if (payload.eventType === "UPDATE") {
          if (session.status !== "PENDING") {
            removeRequestFromList(session.id);
            if (session.status === "COMPLETED" && session.id === activeSessionId) {
              showToast("Customer ended the consultation.");
              resetWorkspace();
            }
          }
        }
      }
    )
    .subscribe();
}

// 3. Load pending requests on startup
async function loadPendingRequests() {
  try {
    const { data: sessions, error } = await db
      .from("chat_sessions")
      .select("*")
      .eq("astrologer_id", currentUser.id)
      .eq("status", "PENDING")
      .order("created_at", { ascending: true });

    if (error) throw error;
    
    const container = document.getElementById("incoming-requests-list");
    if (sessions.length > 0) {
      container.innerHTML = "";
      sessions.forEach(session => addRequestToList(session));
    }
  } catch (err) {
    console.error("Failed to load initial pending requests:", err);
  }
}

// 4. Render request cards in sidebar
async function addRequestToList(session) {
  const container = document.getElementById("incoming-requests-list");
  if (!container) return;

  // Remove loading message if it exists
  const loading = container.querySelector(".loading");
  if (loading) loading.remove();

  // Prevent duplicate cards
  if (document.getElementById(`request-${session.id}`)) return;

  // Fetch customer details
  let customerName = "Aroham Customer";
  let metadataHTML = "Loading birth chart details...";

  try {
    const { data: customer, error } = await db
      .from("users")
      .select("*")
      .eq("id", session.user_id)
      .maybeSingle();

    if (!error && customer) {
      customerName = customer.full_name;
      metadataHTML = `
        <strong>Gender:</strong> ${customer.gender}<br/>
        <strong>DOB:</strong> ${new Date(customer.dob).toLocaleDateString()}<br/>
        ${customer.tob ? `<strong>TOB:</strong> ${customer.tob}<br/>` : ""}
        ${customer.pob_city ? `<strong>POB:</strong> ${customer.pob_city}, ${customer.pob_country || "India"}` : ""}
      `;
    }
  } catch (err) {
    console.error("Failed to fetch customer profile:", err);
  }

  const card = document.createElement("div");
  card.className = "request-card";
  card.id = `request-${session.id}`;

  card.innerHTML = `
    <div class="request-header">Consultation with ${customerName}</div>
    <div class="request-meta">
      ${metadataHTML}
    </div>
    <div class="action-row">
      <button class="btn-action btn-accept" onclick="acceptRequest('${session.id}', '${customerName}')">Accept</button>
      <button class="btn-action btn-decline" onclick="declineRequest('${session.id}')">Decline</button>
    </div>
  `;

  container.appendChild(card);
  activeRequests[session.id] = session;

  // Play alert ringtone
  playRingtone();
}

// Remove request card
function removeRequestFromList(sessionId) {
  const card = document.getElementById(`request-${sessionId}`);
  if (card) card.remove();
  
  delete activeRequests[sessionId];

  // Stop ringtone if no pending requests left
  if (Object.keys(activeRequests).length === 0) {
    stopRingtone();
  }

  // If request list is completely empty, restore placeholder text
  const container = document.getElementById("incoming-requests-list");
  if (container && container.children.length === 0) {
    container.innerHTML = `<p class="loading" style="padding: 20px 0;">No active requests. Waiting for customers…</p>`;
  }
}

// 5. Accept Request Flow
async function acceptRequest(sessionId, customerName) {
  if (activeSessionId) {
    return showToast("Please end your current active consultation before accepting a new one.");
  }

  try {
    const { data, error } = await db
      .from("chat_sessions")
      .update({ status: "ACCEPTED" })
      .eq("id", sessionId)
      .select();

    if (error) throw error;

    showToast(`Consultation with ${customerName} accepted!`);
    removeRequestFromList(sessionId);
    activeSessionId = sessionId;

    // Retrieve customer profile
    const { data: customerProfile } = await db
      .from("users")
      .select("*")
      .eq("id", data[0].user_id)
      .maybeSingle();

    enterChatRoom(sessionId, customerName, customerProfile);
  } catch (err) {
    showToast("Failed to accept request: " + err.message);
  }
}

// 6. Decline Request Flow
async function declineRequest(sessionId) {
  try {
    await db
      .from("chat_sessions")
      .update({ status: "DECLINED" })
      .eq("id", sessionId);

    showToast("Request declined.");
    removeRequestFromList(sessionId);
  } catch (err) {
    showToast("Failed to decline request: " + err.message);
  }
}

// 7. Enter Chat Workspace
function enterChatRoom(sessionId, customerName, customerProfile) {
  document.getElementById("placeholder-state").classList.add("hidden");
  document.getElementById("chat-room").classList.remove("hidden");

  // Update header details
  document.getElementById("chat-user-name").textContent = customerName;
  const avatarChar = customerName.charAt(0).toUpperCase();
  document.getElementById("chat-user-avatar").textContent = avatarChar;

  const detailsContainer = document.getElementById("chat-user-details");
  if (customerProfile) {
    detailsContainer.innerHTML = `
      DOB: ${new Date(customerProfile.dob).toLocaleDateString()} | 
      Gender: ${customerProfile.gender} 
      ${customerProfile.tob ? `| TOB: ${customerProfile.tob}` : ""} 
      ${customerProfile.pob_city ? `| POB: ${customerProfile.pob_city}` : ""}
    `;
  } else {
    detailsContainer.textContent = "Customer Profile Information unavailable.";
  }

  // Clear messages container
  const msgsContainer = document.getElementById("chat-messages");
  msgsContainer.innerHTML = `
    <div style="text-align: center; padding: 10px 0; color: var(--muted); font-size: 0.8rem; font-weight: 500;">
      🕉️ Secure consulting room initialized. You can now chat live with the customer.
    </div>
  `;

  // Load existing notes if any
  const notesTextarea = document.getElementById("astro-consultation-notes");
  if (notesTextarea) {
    notesTextarea.value = localStorage.getItem("notes_" + sessionId) || "";
  }

  loadExistingMessages(sessionId);
  subscribeToActiveMessages(sessionId);
  subscribeToActiveSessionChanges(sessionId);
}

// Fetch messages history
async function loadExistingMessages(sessionId) {
  try {
    const { data: messages, error } = await db
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (messages) {
      messages.forEach(msg => {
        appendMessageBubble(msg.message, msg.sender_id === currentUser.id);
      });
      scrollToBottom();
    }
  } catch (err) {
    console.error("Failed to load chat history:", err);
  }
}

// Subscribe to messages changes
function subscribeToActiveMessages(sessionId) {
  if (messagesSubscription) {
    db.removeChannel(messagesSubscription);
  }

  messagesSubscription = db
    .channel(`messages-${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `session_id=eq.${sessionId}`
      },
      (payload) => {
        const msg = payload.new;
        if (msg.sender_id !== currentUser.id) {
          appendMessageBubble(msg.message, false);
          scrollToBottom();
          playBeep(); // Play notification sound for new incoming message
        }
      }
    )
    .subscribe();
}

// Listen for direct session updates (e.g. user cancellations during chat)
function subscribeToActiveSessionChanges(sessionId) {
  if (activeSessionSubscription) {
    db.removeChannel(activeSessionSubscription);
  }

  activeSessionSubscription = db
    .channel(`active-session-${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "chat_sessions",
        filter: `id=eq.${sessionId}`
      },
      (payload) => {
        if (payload.new.status === "COMPLETED" || payload.new.status === "DECLINED") {
          showToast("The customer has closed the consultation session.");
          resetWorkspace();
        }
      }
    )
    .subscribe();
}

// Send Message
async function sendLiveMessage(e) {
  e.preventDefault();
  const input = document.getElementById("chat-input");
  if (!input) return;
  const text = input.value.trim();
  if (!text || !activeSessionId) return;

  input.value = "";
  appendMessageBubble(text, true);
  scrollToBottom();

  try {
    const { error } = await db
      .from("chat_messages")
      .insert([{
        session_id: activeSessionId,
        sender_id: currentUser.id,
        message: text
      }]);

    if (error) throw error;
  } catch (err) {
    showToast("Failed to send message: " + err.message);
  }
}

// Append bubble to DOM
function appendMessageBubble(message, isOutgoing) {
  const container = document.getElementById("chat-messages");
  if (!container) return;

  const bubble = document.createElement("div");
  
  if (message.startsWith("REMEDY:")) {
    const parts = message.replace("REMEDY:", "").split("|");
    const pName = parts[0] || "Remedy Product";
    const pEmoji = parts[1] || "ॐ";
    const pDesc = parts[2] || "Recommended spiritual protection";

    bubble.className = "chat-product-card";
    bubble.innerHTML = `
      <div class="chat-product-emoji">${pEmoji}</div>
      <div class="chat-product-info">
        <div class="chat-product-name">${pName}</div>
        <div class="chat-product-desc">${pDesc}</div>
      </div>
      <button class="chat-product-btn" onclick="window.open('../index.html#products', '_blank')">View Product</button>
    `;
  } else {
    bubble.className = `message-bubble ${isOutgoing ? "outgoing" : "incoming"}`;
    bubble.textContent = message;
  }

  container.appendChild(bubble);
}

// Scroll to bottom helper
function scrollToBottom() {
  const container = document.getElementById("chat-messages");
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// End Chat session
async function endChatSession() {
  if (!activeSessionId) return;

  try {
    await db
      .from("chat_sessions")
      .update({ status: "COMPLETED" })
      .eq("id", activeSessionId);

    showToast("Consultation ended.");
    resetWorkspace();
  } catch (err) {
    showToast("Failed to end consultation: " + err.message);
  }
}

// Cleanup workspace to idle state
function resetWorkspace() {
  activeSessionId = null;

  if (messagesSubscription) {
    db.removeChannel(messagesSubscription);
    messagesSubscription = null;
  }
  if (activeSessionSubscription) {
    db.removeChannel(activeSessionSubscription);
    activeSessionSubscription = null;
  }

  document.getElementById("placeholder-state").classList.remove("hidden");
  document.getElementById("chat-room").classList.add("hidden");
}

// Ringtone Helpers
function playRingtone() {
  const ring = document.getElementById("ringtone");
  if (ring) {
    ring.play().catch(() => {
      // Browsers restrict auto-play until interaction, ignore error
    });
  }
}

function stopRingtone() {
  const ring = document.getElementById("ringtone");
  if (ring) {
    ring.pause();
    ring.currentTime = 0;
  }
}

function playBeep() {
  // Play subtle incoming chat bubble beep
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5 note
    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.15);
  } catch (_) {}
}

async function toggleOnlineStatus() {
  const toggle = document.getElementById("status-toggle");
  const dot = document.getElementById("status-pulse-dot");
  if (!toggle || !dot) return;

  const isOnline = toggle.value === "online";
  
  if (isOnline) {
    dot.classList.remove("offline");
  } else {
    dot.classList.add("offline");
  }

  try {
    const { error } = await db
      .from("users")
      .update({ is_online: isOnline })
      .eq("id", currentUser.id);

    if (error) throw error;
    showToast(isOnline ? "You are now online" : "You are now offline");
  } catch (err) {
    showToast("Failed to update status: " + err.message);
    toggle.value = isOnline ? "offline" : "online";
    if (isOnline) {
      dot.classList.add("offline");
    } else {
      dot.classList.remove("offline");
    }
  }
}

async function recommendProduct(productName, emoji, description) {
  if (!activeSessionId) return showToast("No active consultation session.");
  
  const textPayload = `REMEDY:${productName}|${emoji}|${description}`;
  appendMessageBubble(textPayload, true);
  scrollToBottom();

  try {
    const { error } = await db
      .from("chat_messages")
      .insert([{
        session_id: activeSessionId,
        sender_id: currentUser.id,
        message: textPayload
      }]);

    if (error) throw error;
    showToast(`Recommended ${productName}!`);
  } catch (err) {
    showToast("Failed to recommend remedy: " + err.message);
  }
}

function saveScratchNotes() {
  if (!activeSessionId) return;
  const val = document.getElementById("astro-consultation-notes").value;
  localStorage.setItem("notes_" + activeSessionId, val);
}

document.addEventListener("DOMContentLoaded", initAstrologerDashboard);
