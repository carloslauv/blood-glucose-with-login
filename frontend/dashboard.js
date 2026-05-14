requireAuth();

function glucoseClass(level) {
  if (level < 70) return "level-low";
  if (level <= 100) return "level-normal";
  if (level <= 140) return "level-warning";
  return "level-high";
}

function formatDate(str) {
  if (!str) return "—";
  const d = new Date(str);
  return isNaN(d) ? str : d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

function formatType(t) {
  return { fasting: "Fasting", post_meal: "Post-meal", bedtime: "Bedtime", random: "Random" }[t] || t;
}

async function loadReadings() {
  const container = document.getElementById("readings-container");
  try {
    const readings = await apiFetch("/readings/");
    if (readings.length === 0) {
      container.innerHTML = '<div class="empty-state">No readings yet. Add your first reading above.</div>';
      return;
    }
    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Level (mg/dL)</th>
            <th>Type</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${readings.map(r => `
            <tr>
              <td>${formatDate(r.recorded_at)}</td>
              <td><span class="badge ${glucoseClass(r.glucose_level)}">${r.glucose_level}</span></td>
              <td><span class="type-badge">${formatType(r.reading_type)}</span></td>
              <td>${r.notes || "—"}</td>
              <td><button class="btn-delete" title="Delete" onclick="deleteReading(${r.id})">✕</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>`;
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Error loading readings: ${err.message}</div>`;
  }
}

async function deleteReading(id) {
  if (!confirm("Delete this reading?")) return;
  try {
    await apiFetch(`/readings/${id}`, { method: "DELETE" });
    loadReadings();
  } catch (err) {
    alert(err.message);
  }
}

async function handleAddReading(e) {
  e.preventDefault();
  const errEl = document.getElementById("add-error");
  errEl.style.display = "none";

  const recordedAt = document.getElementById("recorded-at").value;
  const body = {
    glucose_level: parseFloat(document.getElementById("glucose").value),
    reading_type: document.getElementById("reading-type").value,
    notes: document.getElementById("notes").value.trim() || null,
    recorded_at: recordedAt ? new Date(recordedAt).toISOString() : null,
  };

  try {
    await apiFetch("/readings/", { method: "POST", body: JSON.stringify(body) });
    document.getElementById("add-form").reset();
    loadReadings();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = "block";
  }
}

async function loadUsername() {
  try {
    const user = await apiFetch("/auth/me");
    document.getElementById("username-display").textContent = `Hi, ${user.username}`;
  } catch (_) {}
}

loadUsername();
loadReadings();
