/* MindScore AI — vanilla JS front-end for the FastAPI /predict endpoint */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const form = $("form");
  const btn = $("predictBtn");
  const resetBtn = $("resetBtn");
  const errorEl = $("error");
  const scoreText = $("scoreText");
  const bandEl = $("band");
  const interp = $("interpretation");
  const prog = $("prog");
  const card = $("resultCard");
  const apiBase = $("apiBase");
  const apiDot = $("apiDot");

  const CIRC = 2 * Math.PI * 92; // 578.05
  const sliders = Array.from(document.querySelectorAll('input[type="range"]'));

  /* ---------- sliders ---------- */
  function paintSlider(el) {
    const min = +el.min, max = +el.max;
    const pct = ((+el.value - min) / (max - min)) * 100;
    el.style.setProperty("--fill", pct + "%");
    const out = $(el.id + "_v");
    if (out) out.textContent = (+el.value).toFixed(1) + (el.dataset.unit || "");
  }
  sliders.forEach((s) => {
    paintSlider(s);
    s.addEventListener("input", () => paintSlider(s));
  });

  /* ---------- gauge ---------- */
  function bandFor(score) {
    if (score < 4) return { label: "Low wellbeing", g1: "#f43f5e", g2: "#fb923c",
      text: "The model predicts a low wellbeing score. Heavy screen time, short sleep or high stress are usually the strongest drivers — small, consistent changes to sleep and phone unlocks tend to move this score the most." };
    if (score < 7) return { label: "Moderate", g1: "#f59e0b", g2: "#facc15",
      text: "A moderate wellbeing score. There is real room to improve: aim for steadier sleep, more physical activity and fewer unplanned social-media sessions during study blocks." };
    return { label: "Healthy range", g1: "#6d5cff", g2: "#22d3ee",
      text: "A healthy predicted wellbeing score. Your balance of sleep, study, activity and digital usage looks sustainable — keep the routine consistent." };
  }

  function render(score) {
    const clamped = Math.max(0, Math.min(10, score));
    const b = bandFor(clamped);
    card.style.setProperty("--g1", b.g1);
    card.style.setProperty("--g2", b.g2);
    prog.style.strokeDashoffset = String(CIRC - (clamped / 10) * CIRC);
    bandEl.textContent = b.label;
    interp.textContent = b.text;
    card.classList.remove("pop");
    void card.offsetWidth;
    card.classList.add("pop");
    countTo(clamped);
  }

  let rafId;
  function countTo(target) {
    cancelAnimationFrame(rafId);
    const from = parseFloat(scoreText.textContent) || 0;
    const t0 = performance.now(), dur = 1100;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      scoreText.textContent = (from + (target - from) * eased).toFixed(2);
      if (p < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
  }

  function resetGauge() {
    cancelAnimationFrame(rafId);
    prog.style.strokeDashoffset = String(CIRC);
    card.style.setProperty("--g1", "#6d5cff");
    card.style.setProperty("--g2", "#22d3ee");
    scoreText.textContent = "--";
    bandEl.textContent = "Awaiting input";
    interp.textContent = "Fill in the form and run the model to see a predicted mental wellbeing score.";
  }

  /* ---------- payload ---------- */
  function buildPayload() {
    const num = (id) => parseFloat($(id).value);
    const p = {
      age: parseInt($("age").value, 10),
      gender: $("gender").value,
      country: $("country").value,
      academic_level: $("academic_level").value,
      most_used_platform: $("most_used_platform").value,
      purpose_of_use: $("purpose_of_use").value,
      avg_daily_usage_hours: num("avg_daily_usage_hours"),
      daily_unlocks: parseInt($("daily_unlocks").value, 10),
      study_hours: num("study_hours"),
      physical_activity_hours: num("physical_activity_hours"),
      sleep_hours_per_night: num("sleep_hours_per_night"),
      stress_level: $("stress_level").value,
    };
    if (!Number.isFinite(p.age) || p.age < 10 || p.age > 100) throw new Error("Age must be between 10 and 100.");
    if (!Number.isFinite(p.daily_unlocks) || p.daily_unlocks < 0) throw new Error("Daily unlocks must be 0 or more.");
    return p;
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function baseUrl() {
    return (apiBase.value || "").trim().replace(/\/+$/, "") || "http://127.0.0.1:8000";
  }

  /* ---------- submit ---------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.hidden = true;

    let payload;
    try { payload = buildPayload(); }
    catch (err) { showError(err.message); return; }

    btn.classList.add("loading");
    btn.disabled = true;
    btn.querySelector(".label").textContent = "Analysing…";

    try {
      const res = await fetch(baseUrl() + "/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let detail = "Request failed (" + res.status + ").";
        try {
          const j = await res.json();
          if (Array.isArray(j.detail)) detail = j.detail.map((d) => (d.loc ? d.loc.slice(-1)[0] + ": " : "") + d.msg).join(" · ");
          else if (typeof j.detail === "string") detail = j.detail;
        } catch (_) {}
        throw new Error(detail);
      }

      const data = await res.json();
      const score = Number(data.predicted_mental_health_score);
      if (!Number.isFinite(score)) throw new Error("Unexpected response from the model.");
      apiDot.className = "dot ok";
      render(score);
    } catch (err) {
      apiDot.className = "dot bad";
      const offline = err instanceof TypeError;
      showError(offline
        ? "Could not reach the API at " + baseUrl() + ". Start it with `python -m uvicorn main:app --reload` and check the URL above."
        : err.message);
    } finally {
      btn.classList.remove("loading");
      btn.disabled = false;
      btn.querySelector(".label").textContent = "Predict My MindScore";
    }
  });

  /* ---------- reset ---------- */
  resetBtn.addEventListener("click", () => {
    form.reset();
    sliders.forEach(paintSlider);
    errorEl.hidden = true;
    apiDot.className = "dot";
    resetGauge();
  });

  resetGauge();
})();
