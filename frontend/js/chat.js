// ---------- Client Live Chat & Routing controller ----------

let activeSessionId = null;
let sessionSubscription = null;
let messagesSubscription = null;
let onlineStatusSubscription = null;
let selectedAstroId = null;
let currentUser = null;

async function initChatPage() {
  currentUser = await requireLogin();
  if (!currentUser) return;

  loadAstrologers();
  checkExistingSession();
  subscribeToOnlineStatus();
}

// 1. Fetch & display astrologers
async function loadAstrologers() {
  const container = document.getElementById("astrologers-list");
  if (!container) return;

  try {
    const list = await api("/astrologers/list");
    container.innerHTML = "";

    if (list.length === 0) {
      container.innerHTML = `<p class="loading" style="color: var(--muted); font-size: 0.95rem;">No Vedic experts registered at the moment.</p>`;
      return;
    }

    list.forEach(astro => {
      const card = document.createElement("div");
      card.className = "astrologer-card";
      card.id = `astro-card-${astro.id}`;
      card.onclick = () => selectAstrologer(astro);

      const avatarChar = astro.full_name ? astro.full_name.charAt(0).toUpperCase() : "ॐ";
      const statusClass = astro.is_online ? "" : "offline";
      const statusText = astro.is_online ? "Online & Available" : "Offline";
      
      card.innerHTML = `
        <div class="astro-avatar">${avatarChar}</div>
        <div class="astro-info">
          <div class="astro-name">${astro.full_name}</div>
          <div class="astro-status ${statusClass}">
            <span class="status-dot ${statusClass}"></span> ${statusText}
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<p class="loading" style="color: var(--muted);">Failed to load Vedic experts.</p>`;
  }
}

// 2. Select astrologer
function selectAstrologer(astro) {
  if (activeSessionId) {
    return showToast("Please end your active consultation before starting a new one.");
  }

  // Deactivate all cards
  document.querySelectorAll(".astrologer-card").forEach(c => c.classList.remove("active"));
  // Activate selected card
  const selectedCard = document.getElementById(`astro-card-${astro.id}`);
  if (selectedCard) selectedCard.classList.add("active");

  selectedAstroId = astro.id;

  // Render preview inside workspace
  const workspace = document.getElementById("chat-workspace");
  const noChatState = document.getElementById("no-chat-state");
  if (noChatState) noChatState.classList.add("hidden");

  // Remove existing preview block if any
  const oldPreview = document.getElementById("astro-preview");
  if (oldPreview) oldPreview.remove();

  const preview = document.createElement("div");
  preview.id = "astro-preview";
  preview.style = "flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px;";
  
  const avatarChar = astro.full_name ? astro.full_name.charAt(0).toUpperCase() : "ॐ";
  const statusColor = astro.is_online ? "#2e7d32" : "var(--muted)";
  const statusClass = astro.is_online ? "" : "offline";
  const statusText = astro.is_online ? "Ready to accept consultation" : "Offline";
  const btnDisabled = astro.is_online ? "" : "disabled style='background: var(--muted); cursor: not-allowed; opacity: 0.6;'";

  preview.innerHTML = `
    <div class="astro-avatar" style="width: 90px; height: 90px; font-size: 2.2rem; margin-bottom: 20px; border-width: 3px;">${avatarChar}</div>
    <h2 style="color: var(--maroon); font-size: 1.8rem; margin-bottom: 8px;">${astro.full_name}</h2>
    <p style="color: ${statusColor}; font-weight: 600; font-size: 0.95rem; margin-bottom: 16px; display: inline-flex; align-items: center; gap: 8px;">
      <span class="status-dot ${statusClass}"></span> ${statusText}
    </p>
    <p style="max-width: 400px; font-size: 0.95rem; color: var(--muted); line-height: 1.5; margin-bottom: 30px;">
      ${astro.is_online 
        ? "Start a live consultation to get instant answers regarding wealth, career, relationships, protection, and customized gemstone remedies." 
        : "This expert is currently offline. You can check back later when they are online or consult another available astrologer."}
    </p>
    <button class="btn btn-primary" ${btnDisabled} style="padding: 14px 48px;" onclick="initiateConsultationRequest('${astro.id}')">Start Live Consultation &rarr;</button>
  `;
  workspace.appendChild(preview);
}

// 3. Check if user already has an active session (reconnection)
async function checkExistingSession() {
  try {
    const { data: sessions, error } = await db
      .from("chat_sessions")
      .select("*")
      .in("status", ["PENDING", "ACCEPTED"])
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) throw error;
    if (sessions && sessions.length > 0) {
      const activeSession = sessions[0];
      activeSessionId = activeSession.id;
      selectedAstroId = activeSession.astrologer_id;

      // Get astrologer profile
      const { data: astroProfile } = await db
        .from("users")
        .select("full_name")
        .eq("id", activeSession.astrologer_id)
        .maybeSingle();

      const astroName = astroProfile ? astroProfile.full_name : "Vedic Expert";

      if (activeSession.status === "PENDING") {
        showConnectingState();
        subscribeToSession(activeSessionId);
      } else if (activeSession.status === "ACCEPTED") {
        enterChatRoom(activeSessionId, astroName);
      }
    }
  } catch (err) {
    console.error("Failed to check active chat sessions:", err);
  }
}

// 4. Send live request
async function initiateConsultationRequest(astrologerId) {
  showConnectingState();

  try {
    const { data, error } = await db
      .from("chat_sessions")
      .insert([{
        user_id: currentUser.id,
        astrologer_id: astrologerId,
        status: "PENDING"
      }])
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Failed to request consultation");

    activeSessionId = data[0].id;
    subscribeToSession(activeSessionId);
    showToast("Consultation request sent!");
  } catch (err) {
    showToast(err.message);
    resetWorkspace();
  }
}

// Show connecting overlay
function showConnectingState() {
  const preview = document.getElementById("astro-preview");
  if (preview) preview.classList.add("hidden");
  document.getElementById("no-chat-state").classList.add("hidden");
  document.getElementById("connecting-state").classList.remove("hidden");
  document.getElementById("chat-room").classList.add("hidden");
}

// Cancel active request
async function cancelConsultationRequest() {
  if (!activeSessionId) return;

  try {
    await db
      .from("chat_sessions")
      .update({ status: "DECLINED" })
      .eq("id", activeSessionId);

    showToast("Request cancelled");
    cleanupSubscriptions();
    resetWorkspace();
  } catch (err) {
    showToast("Failed to cancel request: " + err.message);
  }
}

// 5. Subscribe to session changes
function subscribeToSession(sessionId) {
  if (sessionSubscription) {
    supabase.removeChannel(sessionSubscription);
  }

  sessionSubscription = db
    .channel(`session-${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "chat_sessions",
        filter: `id=eq.${sessionId}`
      },
      async (payload) => {
        const status = payload.new.status;
        if (status === "ACCEPTED") {
          // Fetch astrologer name
          const { data: astroProfile } = await db
            .from("users")
            .select("full_name")
            .eq("id", payload.new.astrologer_id)
            .maybeSingle();

          const name = astroProfile ? astroProfile.full_name : "Vedic Expert";
          showToast("Astrologer connected!");
          enterChatRoom(sessionId, name);
        } else if (status === "DECLINED" || status === "REJECTED") {
          showToast("The Vedic expert is currently unavailable. Please try again.");
          cleanupSubscriptions();
          resetWorkspace();
        } else if (status === "COMPLETED") {
          showToast("The consultation has ended.");
          cleanupSubscriptions();
          resetWorkspace();
        }
      }
    )
    .subscribe();
}

// 6. Enter Chat Workspace
function enterChatRoom(sessionId, astrologerName) {
  document.getElementById("connecting-state").classList.add("hidden");
  const preview = document.getElementById("astro-preview");
  if (preview) preview.classList.add("hidden");
  document.getElementById("no-chat-state").classList.add("hidden");
  document.getElementById("chat-room").classList.remove("hidden");

  // Update header
  document.getElementById("chat-astro-name").textContent = astrologerName;
  const avatarChar = astrologerName.charAt(0).toUpperCase();
  document.getElementById("chat-astro-avatar").textContent = avatarChar;

  // Clear messages container
  const msgsContainer = document.getElementById("chat-messages");
  msgsContainer.innerHTML = `
    <div style="text-align: center; padding: 10px 0; color: var(--muted); font-size: 0.8rem; font-weight: 500;">
      🕉️ Secure chat session initialized. Type below to begin your consultation.
    </div>
  `;

  loadExistingMessages(sessionId);
  subscribeToMessages(sessionId);
}

// Fetch messages history
async function loadExistingMessages(sessionId) {
  const container = document.getElementById("chat-messages");
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

// Subscribe to incoming messages
function subscribeToMessages(sessionId) {
  if (messagesSubscription) {
    supabase.removeChannel(messagesSubscription);
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
        // Check if message is already rendered (to prevent duplicates on user side insert)
        if (msg.sender_id !== currentUser.id) {
          appendMessageBubble(msg.message, false);
          scrollToBottom();
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

// Helper to scroll
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
    cleanupSubscriptions();
    resetWorkspace();
  } catch (err) {
    showToast("Failed to end chat: " + err.message);
  }
}

// Subscriptions cleanup
function cleanupSubscriptions() {
  if (sessionSubscription) {
    db.removeChannel(sessionSubscription);
    sessionSubscription = null;
  }
  if (messagesSubscription) {
    db.removeChannel(messagesSubscription);
    messagesSubscription = null;
  }
  if (onlineStatusSubscription) {
    db.removeChannel(onlineStatusSubscription);
    onlineStatusSubscription = null;
  }
}

// Reset workspace panel to original preview
function resetWorkspace() {
  activeSessionId = null;
  selectedAstroId = null;

  const workspace = document.getElementById("chat-workspace");
  const noChatState = document.getElementById("no-chat-state");
  const connectingState = document.getElementById("connecting-state");
  const chatRoom = document.getElementById("chat-room");
  const preview = document.getElementById("astro-preview");

  if (preview) preview.remove();
  if (noChatState) noChatState.classList.remove("hidden");
  if (connectingState) connectingState.classList.add("hidden");
  if (chatRoom) chatRoom.classList.add("hidden");

  document.querySelectorAll(".astrologer-card").forEach(c => c.classList.remove("active"));
}

function subscribeToOnlineStatus() {
  if (onlineStatusSubscription) {
    db.removeChannel(onlineStatusSubscription);
  }

  onlineStatusSubscription = db
    .channel("astrologers-status")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "users",
        filter: "role=eq.astrologer"
      },
      (payload) => {
        // Re-load the list of astrologers to reflect changes
        loadAstrologers();
        
        // If the updated astrologer is currently selected, re-select them to update the preview panel
        if (selectedAstroId === payload.new.id) {
          selectAstrologer(payload.new);
        }
      }
    )
    .subscribe();
}

document.addEventListener("DOMContentLoaded", initChatPage);
