import { useState } from "react";

// ── Objectives ────────────────────────────────────────────────────────────────
const OBJECTIVES = [
  "State a clear, evidence-backed position with no unstated assumptions",
  "Defend reasoning under direct challenge without deflecting or overclaiming",
  "Identify and address the weakest point in your own argument before it is exposed",
];

// ── BDC Tokens ────────────────────────────────────────────────────────────────
const RED    = "#E8192C";
const RED_L  = "#FDE8EA";
const NAVY   = "#1A2B4A";
const BORDER = "#DDE1E7";
const SANS   = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO   = "'Helvetica Neue', Helvetica, Arial, monospace";

const GRN    = "#0F6E56";  const GRN_L  = "#E1F5EE";
const AMB    = "#854F0B";  const AMB_L  = "#FAEEDA";
const EXAM   = "#7A1A1A";  const EXAM_L = "#FAECE7";

// ── System prompts ────────────────────────────────────────────────────────────
function buildSys(mode, ctx, history) {
  const base = `You are running a Pressure Test — a structured interrogation designed to stress-test a learner's position, plan, or argument before they present it in a high-stakes context.

YOUR ROLE: You are the Examiner. You are rigorous, specific, and fair. You are NOT hostile or theatrical. You ask the questions a smart, skeptical stakeholder would ask. Your goal is to stress-test thinking, not to defeat the learner.

LEARNER CONTEXT:
Role: ${ctx.role}
Defending: ${ctx.defending}
Their position: ${ctx.position}
Stakes: ${ctx.stakes || "Not specified"}

RULES:
- Ask ONE challenge per round. Never more.
- Be specific — always reference their actual words or claims.
- Never confirm that the learner is correct. Never validate before round 3.
- Never be cruel, sarcastic, or condescending. Be like a respected senior colleague who takes their work seriously enough to challenge it.
- Keep challenges under 45 words.`;

  if (mode === "open")
    return `${base}

This is Round 1 of 3. Read the learner's position carefully. Identify the single weakest assumption — the one that, if wrong, would undermine the whole argument. Open with ONE sharp, specific challenge targeting exactly that assumption.

Return ONLY valid JSON, no markdown:
{"challenge":"your challenge question — specific, direct, under 45 words","target":"the assumption you are probing — 1 short phrase","nudge":"one coaching sentence as an aside to the learner — what they should be thinking about as they respond"}`;

  if (mode === "press") {
    const historyBlock = history.map((h, i) =>
      `Round ${i + 1}:\nChallenge: ${h.challenge}\nLearner response: ${h.response}`
    ).join("\n\n");
    const round = history.length + 1;
    const isFinal = round === 3;

    return `${base}

Exchange so far:
${historyBlock}

This is Round ${round} of 3.${isFinal ? " This is the FINAL round." : ""}

Evaluate the learner's most recent response honestly:
- If they defended well: acknowledge it briefly (1 clause, e.g. "Fair — but...") then pivot to the next weakest point.
- If they deflected, were vague, or overclaimed: press directly on the same gap without repeating the same phrasing.
- On the final round only: after your challenge, signal whether the position held. Set done:true.

Return ONLY valid JSON, no markdown:
{"challenge":"your challenge — specific, direct, under 50 words","acknowledged":true or false,"nudge":"one coaching sentence for the learner","done":${isFinal ? "true" : "false"},"verdict":${isFinal ? '"held" or "partial" or "collapsed"' : "null"}}`;
  }

  if (mode === "debrief") {
    const historyBlock = history.map((h, i) =>
      `Round ${i + 1} — Challenge: ${h.challenge}\nLearner: ${h.response}`
    ).join("\n\n");

    return `${base}

Full exchange:
${historyBlock}

Evaluate the learner's performance against all three objectives. Be honest and specific. Reference their actual words. Identify their single weakest response by index (0, 1, or 2).

Return ONLY valid JSON, no markdown:
{"scores":[{"obj":"${OBJECTIVES[0]}","score":0-100,"fb":"1-2 sentence specific feedback referencing what they said"},{"obj":"${OBJECTIVES[1]}","score":0-100,"fb":"1-2 sentence specific feedback"},{"obj":"${OBJECTIVES[2]}","score":0-100,"fb":"1-2 sentence specific feedback"}],"overall":0-100,"weakestTurnIndex":0,"rewrite":"What you said: [quote their actual weakest response]. A stronger version: [rewrite it — specific, evidence-backed, no deflection]","before":"2-3 sentences of concrete advice for their real presentation or meeting — specific to their actual position and stakes"}`;
  }

  if (mode === "retry") {
    const weak = history[ctx.weakestTurnIndex];
    return `${base}

Original challenge (Round ${(ctx.weakestTurnIndex || 0) + 1}): ${weak?.challenge}
Original learner response: ${weak?.response}
New learner response: ${ctx.retryResponse}

Evaluate the new response honestly. Compare it to the original. Reward genuine improvement. If the new version still has gaps, name them specifically.

Return ONLY valid JSON, no markdown:
{"reaction":"how you as the Examiner would respond to this new attempt — 1-2 sentences","improvement":"what specifically got stronger in this version compared to the original — 1-2 sentences","remaining":"one thing still worth sharpening, if anything — 1 sentence, or null if the response is strong"}`;
  }
}

// ── API ───────────────────────────────────────────────────────────────────────
async function callClaude(mode, ctx, history = []) {
  const res = await fetch("https://bdc-api.nicholasmcgowan07.workers.dev", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      system: buildSys(mode, ctx, history),
      messages: [{ role: "user", content: "Run the Pressure Test now." }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}

function parseJSON(raw) {
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { return null; }
}

// ── Shared components ─────────────────────────────────────────────────────────
function Dots({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8A96A3", fontSize: 13, padding: "0.5rem 0" }}>
      {[0, 200, 400].map(d => (
        <span key={d} style={{ width: 5, height: 5, borderRadius: "50%", background: NAVY, display: "inline-block", animation: `pt-bounce 1.2s ${d}ms infinite`, opacity: 0.4 }} />
      ))}
      {label && <span style={{ marginLeft: 4, color: "#8A96A3" }}>{label}</span>}
      <style>{`@keyframes pt-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

const PHASES = ["Context", "Test", "Debrief"];
function PhaseBar({ phase }) {
  const map = { context: 0, test: 1, debrief: 2, retry: 2 };
  const idx = map[phase] ?? 0;
  return (
    <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: `1px solid ${BORDER}`, marginBottom: "1.75rem" }}>
      {PHASES.map((p, i) => (
        <div key={p} style={{
          flex: 1, padding: "0.45rem 0", textAlign: "center", fontSize: 11, fontWeight: 500,
          letterSpacing: "0.04em", fontFamily: MONO,
          borderRight: i < PHASES.length - 1 ? `1px solid ${BORDER}` : "none",
          background: i === idx ? NAVY : i < idx ? GRN_L : "#F8F9FB",
          color: i === idx ? "#fff" : i < idx ? GRN : "#8A96A3",
          transition: "all 0.3s",
        }}>{p}</div>
      ))}
    </div>
  );
}

function ScoreBar({ score }) {
  const c = score >= 70 ? GRN : score >= 45 ? AMB : RED;
  return (
    <div style={{ height: 5, background: BORDER, borderRadius: 3, marginBottom: 6, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${score}%`, background: c, borderRadius: 3, transition: "width 1.2s ease" }} />
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  wrap:   { fontFamily: SANS, maxWidth: 680, margin: "0 auto", padding: "1.5rem 1rem", color: NAVY },
  card:   { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "1.25rem", marginBottom: "1rem", boxShadow: "0 1px 4px rgba(26,43,74,0.06)" },
  label:  { fontSize: 11, fontWeight: 600, color: "#8A96A3", marginBottom: "0.4rem", display: "block", textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: MONO },
  input:  { width: "100%", border: `1.5px solid ${BORDER}`, borderRadius: 8, padding: "0.65rem 0.9rem", fontFamily: SANS, fontSize: 14, color: NAVY, background: "#fff", outline: "none", lineHeight: 1.5, boxSizing: "border-box", transition: "border-color 0.15s" },
  ta:     { width: "100%", border: `1.5px solid ${BORDER}`, borderRadius: 8, padding: "0.75rem 1rem", fontFamily: SANS, fontSize: 14, color: NAVY, background: "#fff", resize: "none", lineHeight: 1.6, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" },
  btnP:   (dis) => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "0.6rem 1.4rem", borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: dis ? "default" : "pointer", border: "none", background: RED, color: "#fff", fontFamily: SANS, opacity: dis ? 0.4 : 1, transition: "opacity 0.15s" }),
  btnG:   { display: "inline-flex", alignItems: "center", gap: 6, padding: "0.6rem 1.25rem", borderRadius: 50, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#F4F5F7", color: NAVY, border: `1px solid ${BORDER}`, fontFamily: SANS },
  err:    { background: "#FCEBEB", border: "1px solid #F09595", borderRadius: 8, padding: "1rem", fontSize: 13, color: "#501313", marginBottom: "1rem" },
  tag:    { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: RED, background: RED_L, padding: "3px 10px", borderRadius: 20, marginBottom: "0.875rem", fontFamily: MONO },
  objRow: { display: "flex", gap: 10, alignItems: "flex-start", marginBottom: "0.5rem", fontSize: 13.5, color: "#4A5568", lineHeight: 1.5 },
  objNum: { width: 20, height: 20, borderRadius: "50%", background: RED_L, color: RED, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, fontFamily: MONO },
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PressureTestPage() {
  const [phase, setPhase]         = useState("intro");
  const [ctx, setCtx]             = useState({ role: "", defending: "", position: "", stakes: "" });
  const [history, setHistory]     = useState([]);   // [{challenge, target, nudge, acknowledged, response}]
  const [currentChallenge, setCC] = useState(null); // current active challenge from AI
  const [currentNudge, setCN]     = useState(null);
  const [currentTarget, setCT]    = useState(null);
  const [response, setResponse]   = useState("");
  const [round, setRound]         = useState(0);
  const [verdict, setVerdict]     = useState(null); // "held"|"partial"|"collapsed"
  const [debrief, setDebrief]     = useState(null);
  const [retryText, setRetryText] = useState("");
  const [retryResult, setRetryResult] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const reset = () => {
    setPhase("intro"); setCtx({ role: "", defending: "", position: "", stakes: "" });
    setHistory([]); setCC(null); setCN(null); setCT(null); setResponse(""); setRound(0);
    setVerdict(null); setDebrief(null); setRetryText(""); setRetryResult(null);
    setLoading(false); setError(null);
  };

  const ctxReady = ctx.role.trim().length > 1
    && ctx.defending.trim().length > 3
    && ctx.position.trim().length > 20;

  // ── Start test ──
  const startTest = async () => {
    setLoading(true); setError(null); setPhase("test");
    try {
      const raw = await callClaude("open", ctx, []);
      const res = parseJSON(raw) || { challenge: "Walk me through the core assumption your entire argument rests on.", target: "foundational assumption", nudge: "Identify the one thing that, if wrong, would collapse your position." };
      setCC(res.challenge); setCN(res.nudge); setCT(res.target);
      setRound(1);
    } catch (e) { setError(e.message); setPhase("context"); }
    setLoading(false);
  };

  // ── Submit a response ──
  const submitResponse = async () => {
    if (!response.trim()) return;
    const newEntry = { challenge: currentChallenge, target: currentTarget, nudge: currentNudge, response: response.trim() };
    const newHistory = [...history, newEntry];
    setHistory(newHistory);
    setResponse(""); setCC(null); setCN(null); setCT(null);
    setLoading(true);

    try {
      if (newHistory.length >= 3) {
        // Move to debrief
        const raw = await callClaude("debrief", ctx, newHistory);
        const d = parseJSON(raw) || {
          scores: OBJECTIVES.map(o => ({ obj: o, score: 60, fb: "Review and strengthen the evidence behind your key claims." })),
          overall: 60, weakestTurnIndex: 0,
          rewrite: `What you said: "${newHistory[0].response}". A stronger version: Lead with the evidence, not the conclusion. Name the specific data or precedent that supports your claim before you assert it.`,
          before: `Before your real meeting, identify the three questions most likely to come up and prepare evidence-backed responses for each. Don't rehearse assertions — rehearse your reasoning.`,
        };
        setDebrief(d); setPhase("debrief");
      } else {
        // Press for next round
        const raw = await callClaude("press", ctx, newHistory);
        const res = parseJSON(raw) || { challenge: "How do you account for the risks you haven't mentioned?", acknowledged: false, nudge: "Be specific — name the risk and your mitigation.", done: false, verdict: null };
        setCC(res.challenge); setCN(res.nudge);
        setRound(r => r + 1);
        if (res.verdict) setVerdict(res.verdict);
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  // ── Retry ──
  const submitRetry = async () => {
    if (!retryText.trim()) return;
    setLoading(true);
    const weakIdx = debrief?.weakestTurnIndex ?? 0;
    try {
      const raw = await callClaude("retry", { ...ctx, weakestTurnIndex: weakIdx, retryResponse: retryText.trim() }, history);
      const res = parseJSON(raw) || { reaction: "A notably stronger response — the claim is now grounded in specific evidence.", improvement: "The new version names the evidence upfront and addresses the challenge directly rather than reframing it.", remaining: null };
      setRetryResult(res);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const weakTurn = debrief ? history[debrief.weakestTurnIndex] : null;
  const verdictConfig = {
    held:      { label: "Position held",       color: GRN,  bg: GRN_L,  icon: "✓" },
    partial:   { label: "Partially defended",  color: AMB,  bg: AMB_L,  icon: "~" },
    collapsed: { label: "Position needs work", color: RED,  bg: RED_L,  icon: "○" },
  };

  return (
    <div style={s.wrap}>
      <style>{`
        input:focus, textarea:focus { border-color: ${RED} !important; outline: none; }
        button:active { transform: scale(0.98); }
        @keyframes pt-fadein { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        .pt-in { animation: pt-fadein 0.3s ease both; }
      `}</style>

      {phase !== "intro" && <PhaseBar phase={phase} />}

      {error && (
        <div style={s.err}>
          <strong style={{ display: "block", marginBottom: 4 }}>Error</strong>{error}
          <button style={{ ...s.btnG, padding: "2px 10px", fontSize: 12, marginTop: 8 }} onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* ── Intro ── */}
      {phase === "intro" && (
        <div className="pt-in">
          <div style={s.tag}>
            <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3.5" fill="currentColor"/></svg>
            Stress-test your thinking · v1
          </div>
          <div style={{ fontSize: 26, fontWeight: 400, marginBottom: "0.4rem", lineHeight: 1.25, color: NAVY }}>The Pressure Test</div>
          <div style={{ fontSize: 14, color: "#4A5568", lineHeight: 1.75, marginBottom: "1.5rem" }}>
            You bring a plan, proposal, or argument. The AI plays a rigorous examiner — asking exactly the questions your stakeholders will ask. Three rounds. No easy passes. A full debrief at the end.
          </div>
          <div style={{ ...s.card, borderLeft: `3px solid ${RED}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A96A3", marginBottom: "0.75rem", fontFamily: MONO }}>By the end of this session</div>
            {OBJECTIVES.map((o, i) => (
              <div key={i} style={s.objRow}><div style={s.objNum}>{i + 1}</div><span>{o}</span></div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#8A96A3", lineHeight: 1.65, padding: "0.75rem 1rem", background: "#F8F9FB", borderRadius: 8, border: `1px solid ${BORDER}`, marginBottom: "1.25rem" }}>
            The examiner is not trying to defeat you. The goal is to surface the assumptions you haven't tested, the evidence you haven't gathered, and the objections you haven't answered — before the real meeting.
          </div>
          <button style={s.btnP(false)} onClick={() => setPhase("context")}>Set up your test</button>
        </div>
      )}

      {/* ── Context ── */}
      {phase === "context" && (
        <div className="pt-in">
          <PhaseBar phase="context" />
          <div style={s.card}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A96A3", marginBottom: "1rem", fontFamily: MONO }}>Tell the examiner what you're defending</div>
            <p style={{ fontSize: 13.5, color: "#4A5568", lineHeight: 1.65, marginBottom: "1.25rem" }}>
              The more specific you are, the sharper the challenge. Generic positions get generic questions.
            </p>
            <div style={{ marginBottom: "1rem" }}>
              <label style={s.label}>Your role</label>
              <input style={s.input} placeholder="e.g. Product Manager, Strategy Lead, Head of Design…" value={ctx.role} onChange={e => setCtx(c => ({ ...c, role: e.target.value }))} />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={s.label}>What are you defending?</label>
              <input style={s.input} placeholder="e.g. A roadmap decision, a business case, a hiring recommendation…" value={ctx.defending} onChange={e => setCtx(c => ({ ...c, defending: e.target.value }))} />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={s.label}>State your position</label>
              <textarea style={{ ...s.ta, minHeight: 112 }} placeholder="Write the argument, plan, or recommendation you want to pressure-test. Be specific — include the what, why, and how." value={ctx.position} onChange={e => setCtx(c => ({ ...c, position: e.target.value }))} rows={5} />
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={s.label}>What are the stakes? <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional but recommended)</span></label>
              <input style={s.input} placeholder="e.g. Board approval, a $2M budget sign-off, a team restructure…" value={ctx.stakes} onChange={e => setCtx(c => ({ ...c, stakes: e.target.value }))} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={s.btnP(!ctxReady)} onClick={startTest} disabled={!ctxReady || loading}>
                {loading ? "Preparing first challenge…" : "Start the test"}
              </button>
            </div>
            {loading && <div style={{ marginTop: "0.75rem" }}><Dots label="Reading your position…" /></div>}
          </div>
        </div>
      )}

      {/* ── Test ── */}
      {phase === "test" && (
        <div>
          {/* Disclaimer */}
          <div style={{ fontSize: 12, color: "#8A96A3", lineHeight: 1.6, padding: "0.65rem 1rem", background: "#F8F9FB", borderRadius: 8, border: `1px solid ${BORDER}`, marginBottom: "1rem" }}>
            Defending: <strong style={{ color: NAVY }}>{ctx.defending}</strong>
            <span style={{ marginLeft: 8, background: RED_L, color: RED, borderRadius: 4, padding: "1px 7px", fontSize: 11, fontWeight: 600, fontFamily: MONO }}>Round {round} of 3</span>
          </div>

          {/* Completed rounds */}
          {history.map((h, i) => (
            <div key={i} className="pt-in" style={{ marginBottom: "1.25rem" }}>
              {/* Challenge */}
              <div style={{ background: EXAM_L, border: `1px solid #F0CABA`, borderRadius: 10, padding: "1rem 1.125rem", marginBottom: "0.625rem" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: EXAM, marginBottom: 6, fontFamily: MONO, display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5.5" stroke={EXAM} strokeWidth="1.1"/><path d="M6 3.5v3M6 8v.8" stroke={EXAM} strokeWidth="1.2" strokeLinecap="round"/></svg>
                  Examiner · Round {i + 1}
                  {h.target && <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 20, background: "rgba(122,26,26,0.08)", color: EXAM, fontWeight: 600 }}>↳ {h.target}</span>}
                </div>
                <div style={{ fontSize: 14, color: EXAM, lineHeight: 1.65, fontWeight: 500 }}>{h.challenge}</div>
              </div>
              {/* Nudge */}
              {h.nudge && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: GRN, background: GRN_L, border: `1px solid #9FE1CB`, borderRadius: 8, padding: "0.55rem 0.875rem", marginBottom: "0.5rem" }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="6.5" cy="6.5" r="6" stroke={GRN} strokeWidth="1.1" fill="none"/><path d="M6.5 4v3.5M6.5 9v.5" stroke={GRN} strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span><strong>Coaching:</strong> {h.nudge}</span>
                </div>
              )}
              {/* Response */}
              <div style={{ fontSize: 13, color: "#4A5568", padding: "0.6rem 0.875rem", background: "#F8F9FB", borderRadius: 7, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${NAVY}` }}>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8A96A3", display: "block", marginBottom: 3, fontFamily: MONO }}>You said</span>
                {h.response}
              </div>
            </div>
          ))}

          {/* Active challenge */}
          {currentChallenge && !loading && (
            <div className="pt-in">
              <div style={{ background: EXAM_L, border: `1px solid #F0CABA`, borderRadius: 10, padding: "1rem 1.125rem", marginBottom: "0.625rem" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: EXAM, marginBottom: 6, fontFamily: MONO, display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5.5" stroke={EXAM} strokeWidth="1.1"/><path d="M6 3.5v3M6 8v.8" stroke={EXAM} strokeWidth="1.2" strokeLinecap="round"/></svg>
                  Examiner · Round {round}
                  {currentTarget && <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 20, background: "rgba(122,26,26,0.08)", color: EXAM, fontWeight: 600 }}>↳ {currentTarget}</span>}
                </div>
                <div style={{ fontSize: 14, color: EXAM, lineHeight: 1.65, fontWeight: 500 }}>{currentChallenge}</div>
              </div>
              {currentNudge && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: GRN, background: GRN_L, border: `1px solid #9FE1CB`, borderRadius: 8, padding: "0.55rem 0.875rem", marginBottom: "0.75rem" }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="6.5" cy="6.5" r="6" stroke={GRN} strokeWidth="1.1" fill="none"/><path d="M6.5 4v3.5M6.5 9v.5" stroke={GRN} strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span><strong>Coaching:</strong> {currentNudge}</span>
                </div>
              )}
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8A96A3", marginBottom: "0.4rem", fontFamily: MONO }}>Your response</div>
              <textarea style={{ ...s.ta, minHeight: 100, marginBottom: "0.75rem" }} value={response} onChange={e => setResponse(e.target.value)} placeholder="Defend your position. Be specific — assertions without evidence will be pressed further." disabled={loading} rows={4} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button style={s.btnP(loading || !response.trim())} onClick={submitResponse} disabled={loading || !response.trim()}>
                  {round < 3 ? "Submit response" : "Finish & get debrief"}
                </button>
              </div>
            </div>
          )}

          {loading && <Dots label={round === 0 ? "Reading your position…" : "Examiner is responding…"} />}
        </div>
      )}

      {/* ── Debrief ── */}
      {phase === "debrief" && (
        <div className="pt-in">
          {!debrief ? <div style={s.card}><Dots label="Generating your debrief…" /></div> : (
            <>
              {/* Overall score + verdict */}
              <div style={{ textAlign: "center", padding: "1.75rem 1.5rem", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: "1rem", boxShadow: "0 1px 4px rgba(26,43,74,0.06)" }}>
                <div style={{ fontSize: 56, fontWeight: 400, lineHeight: 1, color: debrief.overall >= 75 ? GRN : debrief.overall >= 50 ? AMB : RED, marginBottom: 6 }}>{debrief.overall}</div>
                <div style={{ fontSize: 13, color: "#8A96A3" }}>Overall score</div>
                {verdict && (() => {
                  const vc = verdictConfig[verdict] || verdictConfig.partial;
                  return (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: "0.75rem", padding: "4px 14px", borderRadius: 20, background: vc.bg, color: vc.color, fontSize: 12, fontWeight: 700, fontFamily: MONO, letterSpacing: "0.05em" }}>
                      <span>{vc.icon}</span> {vc.label}
                    </div>
                  );
                })()}
              </div>

              {/* Objective scores */}
              <div style={s.card}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A96A3", marginBottom: "0.875rem", fontFamily: MONO }}>Objective by objective</div>
                {debrief.scores.map((sc, i) => {
                  const c = sc.score >= 70 ? GRN : sc.score >= 45 ? AMB : RED;
                  return (
                    <div key={i} style={{ paddingBottom: "1rem", marginBottom: "1rem", borderBottom: i < debrief.scores.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                        <span style={{ color: c, fontSize: 15 }}>{sc.score >= 70 ? "✓" : sc.score >= 45 ? "~" : "○"}</span>
                        <span style={{ fontSize: 13.5, fontWeight: 500, color: NAVY }}>{sc.obj}</span>
                      </div>
                      <ScoreBar score={sc.score} />
                      <div style={{ fontSize: 13, color: "#4A5568", lineHeight: 1.6 }}>{sc.fb}</div>
                    </div>
                  );
                })}
              </div>

              {/* Rewrite */}
              <div style={{ background: AMB_L, border: `1px solid #FAC775`, borderRadius: 10, padding: "1.25rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.65rem" }}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 2l2.5 2.5-7.5 7.5H3v-2.5L10.5 2z" stroke={AMB} strokeWidth="1.2" strokeLinejoin="round" fill="none"/></svg>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: AMB, fontFamily: MONO }}>Your weakest response — and how to strengthen it</span>
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.75, color: "#412402" }}>{debrief.rewrite}</div>
              </div>

              {/* Before your real meeting */}
              <div style={{ background: GRN_L, border: `1px solid #9FE1CB`, borderRadius: 10, padding: "1.25rem", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.65rem" }}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2.5" width="13" height="11" rx="1.5" stroke={GRN} strokeWidth="1.2" fill="none"/><path d="M4.5 1v3M10.5 1v3M1 6h13" stroke={GRN} strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: GRN, fontFamily: MONO }}>Before your real meeting</span>
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.75, color: "#04342C" }}>{debrief.before}</div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button style={s.btnP(false)} onClick={() => { setRetryText(""); setRetryResult(null); setPhase("retry"); }}>
                  Retry your weakest response
                </button>
                <button style={s.btnG} onClick={reset}>Start over</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Retry ── */}
      {phase === "retry" && weakTurn && (
        <div className="pt-in">
          <div style={{ fontSize: 13.5, color: "#4A5568", lineHeight: 1.65, marginBottom: "1.25rem" }}>
            Review the suggested rewrite, then write your own improved version.
          </div>

          <div style={s.card}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A96A3", marginBottom: "0.5rem", fontFamily: MONO }}>The challenge</div>
            <div style={{ background: EXAM_L, border: `1px solid #F0CABA`, borderRadius: 8, padding: "0.875rem 1rem", marginBottom: "1rem", fontSize: 13.5, color: EXAM, lineHeight: 1.65, fontWeight: 500 }}>{weakTurn.challenge}</div>

            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A96A3", marginBottom: "0.5rem", fontFamily: MONO }}>Your original response</div>
            <div style={{ fontSize: 13, color: "#4A5568", padding: "0.75rem", background: "#F8F9FB", borderRadius: 7, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${NAVY}`, marginBottom: "1rem", lineHeight: 1.65 }}>{weakTurn.response}</div>

            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A96A3", marginBottom: "0.5rem", fontFamily: MONO }}>Suggested stronger version</div>
            <div style={{ fontSize: 13, color: "#412402", padding: "0.875rem", background: AMB_L, borderRadius: 8, marginBottom: "1.25rem", lineHeight: 1.7 }}>
              {debrief?.rewrite?.split("A stronger version:")[1]?.trim() || debrief?.rewrite?.split("stronger version")[1]?.replace(/^[: ]+/, "") || "Lead with your evidence, not your conclusion. Name the specific data, precedent, or rationale that grounds your claim before asserting it."}
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A96A3", marginBottom: "0.4rem", fontFamily: MONO }}>Your improved response</div>
            <textarea style={{ ...s.ta, minHeight: 100, marginBottom: "0.75rem" }} value={retryText} onChange={e => setRetryText(e.target.value)} placeholder="Write a stronger version — be specific, lead with evidence, address the challenge directly." disabled={loading} rows={4} />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={s.btnP(loading || !retryText.trim())} onClick={submitRetry} disabled={loading || !retryText.trim()}>Submit retry</button>
            </div>
            {loading && <div style={{ marginTop: "0.75rem" }}><Dots label="Evaluating your new response…" /></div>}
          </div>

          {retryResult && (
            <div className="pt-in" style={{ ...s.card, borderLeft: `3px solid ${GRN}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A96A3", marginBottom: "0.4rem", fontFamily: MONO }}>Examiner's reaction</div>
              <div style={{ fontSize: 13.5, color: EXAM, lineHeight: 1.65, padding: "0.75rem 1rem", background: EXAM_L, borderRadius: 8, marginBottom: "0.875rem" }}>{retryResult.reaction}</div>

              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A96A3", marginBottom: "0.4rem", fontFamily: MONO }}>What improved</div>
              <div style={{ fontSize: 13.5, color: "#4A5568", lineHeight: 1.65, marginBottom: retryResult.remaining ? "0.875rem" : "1.25rem" }}>{retryResult.improvement}</div>

              {retryResult.remaining && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8A96A3", marginBottom: "0.4rem", fontFamily: MONO }}>Still worth sharpening</div>
                  <div style={{ fontSize: 13, color: "#4A5568", lineHeight: 1.65, marginBottom: "1.25rem", padding: "0.625rem 0.875rem", background: AMB_L, borderRadius: 7 }}>{retryResult.remaining}</div>
                </>
              )}

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button style={s.btnG} onClick={() => setPhase("debrief")}>Back to debrief</button>
                <button style={s.btnG} onClick={reset}>Start over</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
