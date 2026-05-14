requireAuth();

const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

function formatToolName(name) {
  return name.replace(/_/g, " ");
}

function appendMessage(role, text, toolCalls) {
  const div = document.createElement("div");
  div.className = `message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  div.appendChild(bubble);

  if (toolCalls && toolCalls.length > 0) {
    const toolsRow = document.createElement("div");
    toolsRow.className = "tools-used";
    toolsRow.title = "Tools the AI called to fetch your data";

    const uniqueTools = [...new Set(toolCalls)];
    uniqueTools.forEach(name => {
      const badge = document.createElement("span");
      badge.className = "tool-badge";
      badge.textContent = `⚙ ${formatToolName(name)}`;
      toolsRow.appendChild(badge);
    });
    div.appendChild(toolsRow);
  }

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function appendThinking() {
  const div = document.createElement("div");
  div.className = "thinking";
  div.id = "thinking-indicator";
  div.textContent = "Fetching your data and analyzing…";
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function removeThinking() {
  const el = document.getElementById("thinking-indicator");
  if (el) el.remove();
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  // Hide suggestions after first message
  const suggestionsEl = document.getElementById("suggestions");
  if (suggestionsEl) suggestionsEl.style.display = "none";

  inputEl.value = "";
  sendBtn.disabled = true;

  appendMessage("user", text, null);
  const thinking = appendThinking();

  try {
    const response = await apiFetch("/agent/chat", {
      method: "POST",
      body: JSON.stringify({ message: text }),
    });

    removeThinking();
    appendMessage("assistant", response.reply, response.tool_calls_made);
  } catch (err) {
    removeThinking();
    appendMessage("assistant", `Sorry, something went wrong: ${err.message}`, null);
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

function sendSuggestion(btn) {
  inputEl.value = btn.textContent;
  sendMessage();
}

function handleKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}
