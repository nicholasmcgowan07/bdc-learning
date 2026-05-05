import { useState, useCallback, useEffect } from "react";

// ── Default topic (shown as placeholder in setup) ─────────────────────────────
const DEFAULT_TOPIC     = "Data Privacy in the Workplace";
const DEFAULT_SUBTOPICS = [
  "Personal Data & Privacy Risks",
  "Secure Data Handling",
  "Breach Detection & Response",
  "Regulatory Obligations",
];

// Build the runtime contract + subtopic list from user input
function buildContract(topic, subtopicLabels) {
  return {
    contract: {
      topic,
      objectives: subtopicLabels,
    },
    subtopics: subtopicLabels.map((label, i) => ({
      id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label,
      objIndex: i,
    })),
  };
}

// ── System prompts ────────────────────────────────────────────────────────────
function buildSys(mode, subtopic, contract) {
  const base = `CURRICULUM CONTRACT — FIXED, NEVER DEVIATE:
Topic: ${contract.topic}
Subtopics being assessed: ${contract.objectives.join(", ")}
GUARDRAIL: Before generating, confirm each question directly tests the stated sub-topic. Omit anything that drifts outside it.`;

  if (mode === "cluster") {
    return `${base}

You are generating a diagnostic question cluster for sub-topic: "${subtopic.label}"
Objective being assessed: "${contract.objectives[subtopic.objIndex]}"

Generate exactly 3 questions. Use a mix of types to probe understanding from different angles. Target the most common real-world mistakes employees make on this sub-topic. Distractors must be plausible — not obviously wrong.

Question types:
- mc: 4 options, exactly 1 correct. Best for conceptual understanding and common confusions. Use a workplace scenario in the stem.
- tf: True/False on a nuanced statement (not obviously true or false). Best for testing misconceptions.
- match: 3 pairs, linking terms to definitions or concepts to applications.

Use all three types across the cluster (one each).

Return ONLY valid JSON, no markdown:
{
  "questions": [
    {
      "type": "mc",
      "stem": "Scenario-based question (30-60 words, grounded in a real workplace moment)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "rationale": "Why this is correct, and why the most tempting wrong answer fails"
    },
    {
      "type": "tf",
      "stem": "Statement to evaluate as true or false (20-40 words, non-obvious)",
      "correct": true,
      "rationale": "Explanation of why true or false"
    },
    {
      "type": "match",
      "stem": "Match each term to its correct definition",
      "pairs": [
        {"left": "Term A", "right": "Definition A"},
        {"left": "Term B", "right": "Definition B"},
        {"left": "Term C", "right": "Definition C"}
      ]
    }
  ]
}`;
  }

  if (mode === "analyze") {
    return `${base}

You are analyzing a learner's answer pattern on sub-topic: "${subtopic.label}".

CRITICAL: Do NOT just score. Read the specific combination of errors to identify what misconception or mental model gap they reveal. A learner who misses Q1 and Q3 has a different gap than one who misses Q2 and Q3, even at the same score.

Routes:
- ADVANCE: Strong performance (2-3 correct), no critical misconception detected. No remediation needed.
- REINFORCE: 2 correct but one answer reveals a specific gap worth addressing before moving on.
- REMEDIATE: Multiple errors, or one error that reveals a fundamental misconception in the underlying concept.

Return ONLY valid JSON, no markdown:
{
  "pattern": "1–2 sentences — what does this specific combination of answers reveal about the learner's mental model?",
  "gap": "The one specific misconception or knowledge gap driving these errors (omit if ADVANCE)",
  "route": "ADVANCE",
  "routeReason": "1 sentence — why this specific route for this specific pattern",
  "remediation": "2–3 sentences of direct, targeted explanation addressing the exact gap. Concrete workplace examples. (Required for REMEDIATE and REINFORCE; omit entirely for ADVANCE.)"
}`;
  }

  if (mode === "debrief") {
    return `${base}

Generate a final debrief for a learner who has completed the full adaptive question pack on "${contract.topic}". Be specific and honest. Reference actual performance across sub-topics.

Return ONLY valid JSON, no markdown:
{
  "scores": [
    {"obj": "full objective text", "score": 0-100, "fb": "1–2 sentence personalised feedback — specific to what they got right or wrong"},
    {"obj": "...", "score": 0-100, "fb": "..."},
    {"obj": "...", "score": 0-100, "fb": "..."},
    {"obj": "...", "score": 0-100, "fb": "..."}
  ],
  "overall": 0-100,
  "strengthSummary": "1–2 sentences about what they clearly understood",
  "priorityAction": "The single most important thing to review before applying this at work — specific and actionable, not generic"
}`;
  }

  return base;
}

async function callClaude(messages, mode, subtopic, contract) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s hard timeout
  try {
    const res = await fetch("https://bdc-api.nicholasmcgowan07.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: buildSys(mode, subtopic, contract),
        messages,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.content[0].text;
  } catch (e) {
    if (e.name === "AbortError") throw new Error("Request timed out — please try again.");
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

function parseJSON(raw) {
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { return null; }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isCorrect(question, response) {
  if (question.type === "mc")    return response === question.correct;
  if (question.type === "tf")    return response === question.correct;
  if (question.type === "match") {
    if (!response || typeof response !== "object") return false;
    return question.pairs.every((_, i) => response[i] === i);
  }
  return false;
}

function isAnswered(question, response) {
  if (question.type === "mc")    return response !== undefined && response !== null;
  if (question.type === "tf")    return response !== undefined && response !== null;
  if (question.type === "match") {
    if (!response || typeof response !== "object") return false;
    return question.pairs.every((_, i) => response[i] !== undefined);
  }
  return false;
}

function initResponse(question) {
  return question.type === "match" ? {} : undefined;
}

// ── BDC Brand Tokens ──────────────────────────────────────────────────────────
const BDC_RED    = "#E8192C";
const BDC_NAVY   = "#1A2B4A";
const BDC_RED_L  = "#FDE8EA";
const BDC_BORDER = "#DDE1E7";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// Aliases kept for internal use
const IND   = BDC_RED;
const IND_L = BDC_RED_L;

const t = {
  wrap:      { fontFamily: SANS, maxWidth: 680, margin: "0 auto", padding: "1.5rem 1rem", color: BDC_NAVY, background: "#F8F9FB", minHeight: "100vh" },
  card:      { background: "#FFFFFF", border: `1px solid ${BDC_BORDER}`, borderRadius: 10, padding: "1.25rem", marginBottom: "1rem", boxShadow: "0 1px 4px rgba(26,43,74,0.06)" },
  sec:       { fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8A96A3", marginBottom: "0.875rem" },
  btnP:      (dis) => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "0.6rem 1.25rem", borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: dis ? "default" : "pointer", border: "none", background: BDC_RED, color: "#fff", fontFamily: SANS, opacity: dis ? 0.45 : 1 }),
  btnG:      { display: "inline-flex", alignItems: "center", gap: 6, padding: "0.6rem 1.25rem", borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: "pointer", background: "#FFFFFF", color: BDC_NAVY, border: `1.5px solid ${BDC_BORDER}`, fontFamily: SANS },
  tag:       { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: BDC_RED, background: BDC_RED_L, padding: "3px 10px", borderRadius: 20, marginBottom: "0.75rem" },
  objRow:    { display: "flex", gap: 10, alignItems: "flex-start", marginBottom: "0.5rem", fontSize: 13.5, color: "#4A5568", lineHeight: 1.5 },
  objBadge:  { width: 20, height: 20, borderRadius: "50%", background: BDC_RED_L, color: BDC_RED, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  errBox:    { background: "#FCEBEB", border: "1px solid #F09595", borderRadius: 8, padding: "1rem", fontSize: 13, color: "#501313", marginBottom: "1rem" },
  phaseBar:  { display: "flex", borderRadius: 6, overflow: "hidden", border: `1px solid ${BDC_BORDER}`, marginBottom: "1.75rem" },
  phaseStep: (active, done) => ({ flex: 1, padding: "0.45rem 0", textAlign: "center", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", borderRight: `1px solid ${BDC_BORDER}`, background: active ? BDC_RED : done ? "#E1F5EE" : "#F4F5F7", color: active ? "#fff" : done ? "#0F6E56" : "#8A96A3", transition: "all 0.3s" }),
  rationaleBox: { marginTop: "0.75rem", fontSize: 12.5, color: "#4A5568", background: "#F4F5F7", borderRadius: 6, padding: "0.65rem 0.875rem", lineHeight: 1.6 },
};

// ── Shared components ─────────────────────────────────────────────────────────
function Dots({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8A96A3", fontSize: 13, padding: "0.5rem 0" }}>
      {[0, 200, 400].map((d) => <span key={d} style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block", animation: `bounce 1.2s ${d}ms infinite` }} />)}
      {label && <span style={{ marginLeft: 4 }}>{label}</span>}
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

const PHASE_LABELS = ["Setup", "Topic 1", "Topic 2", "Topic 3", "Topic 4", "Results"];

function PhaseBar({ subtopicIndex, phase }) {
  const activeIdx = phase === "setup" ? 0 : phase === "debrief" ? 5 : subtopicIndex + 1;
  return (
    <div style={t.phaseBar}>
      {PHASE_LABELS.map((p, i) => (
        <div key={p} style={{ ...t.phaseStep(i === activeIdx, i < activeIdx), ...(i === PHASE_LABELS.length - 1 ? { borderRight: "none" } : {}) }}>{p}</div>
      ))}
    </div>
  );
}

function ContractPanel({ contract }) {
  if (!contract) return null;
  return (
    <div style={{ borderLeft: `3px solid ${BDC_RED}`, borderRadius: "0 10px 10px 0", padding: "1rem 1.25rem", marginBottom: "1.5rem", background: "#FFFFFF", border: `1px solid ${BDC_BORDER}`, boxShadow: "0 1px 4px rgba(26,43,74,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.6 }}>
            <rect x="2.5" y="6" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <circle cx="7" cy="9.5" r="1" fill="currentColor" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: BDC_RED }}>{contract.topic}</span>
        </div>
      </div>
      {contract.objectives.map((o, i) => (
        <div key={i} style={t.objRow}><div style={t.objBadge}>{i + 1}</div><span>{o}</span></div>
      ))}
    </div>
  );
}

// ── Question types ────────────────────────────────────────────────────────────
function MCQuestion({ q, response, onChange, submitted }) {
  return (
    <>
      <div style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1.65, marginBottom: "0.875rem" }}>{q.stem}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
        {q.options.map((opt, i) => {
          const selected = response === i;
          const correct  = submitted && i === q.correct;
          const wrong    = submitted && selected && i !== q.correct;
          return (
            <button key={i} onClick={() => !submitted && onChange(i)}
              style={{
                textAlign: "left", padding: "0.7rem 0.9rem", borderRadius: 8,
                border: `1.5px solid ${correct ? "#1D9E75" : wrong ? "#C44" : selected ? IND : BDC_BORDER}`,
                background: correct ? "#E1F5EE" : wrong ? "#FCEBEB" : selected ? IND_L : "#FFFFFF",
                fontSize: 13.5, color: correct ? "#085041" : wrong ? "#501313" : selected ? IND : BDC_NAVY,
                cursor: submitted ? "default" : "pointer", fontFamily: SANS, lineHeight: 1.5,
                display: "flex", alignItems: "center", gap: 10,
              }}>
              <span style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0, fontSize: 11, fontWeight: 700,
                border: `1.5px solid ${correct ? "#1D9E75" : wrong ? "#C44" : selected ? IND : BDC_BORDER}`,
                background: (correct || wrong || selected) ? (correct ? "#1D9E75" : wrong ? "#C44" : IND) : "transparent",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {submitted && correct ? "✓" : submitted && wrong ? "✗" : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {submitted && q.rationale && <div style={t.rationaleBox}>💡 {q.rationale}</div>}
    </>
  );
}

function TFQuestion({ q, response, onChange, submitted }) {
  return (
    <>
      <div style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1.65, marginBottom: "0.875rem" }}>{q.stem}</div>
      <div style={{ display: "flex", gap: "0.6rem" }}>
        {[{ val: true, label: "True" }, { val: false, label: "False" }].map(({ val, label }) => {
          const selected = response === val;
          const correct  = submitted && val === q.correct;
          const wrong    = submitted && selected && val !== q.correct;
          return (
            <button key={String(val)} onClick={() => !submitted && onChange(val)}
              style={{
                flex: 1, padding: "0.7rem", borderRadius: 8, fontWeight: 600, fontSize: 14,
                border: `1.5px solid ${correct ? "#1D9E75" : wrong ? "#C44" : selected ? IND : BDC_BORDER}`,
                background: correct ? "#E1F5EE" : wrong ? "#FCEBEB" : selected ? IND_L : "#FFFFFF",
                color: correct ? "#085041" : wrong ? "#501313" : selected ? IND : "#4A5568",
                cursor: submitted ? "default" : "pointer", fontFamily: SANS,
              }}>
              {submitted && correct ? "✓ " : submitted && wrong ? "✗ " : ""}{label}
            </button>
          );
        })}
      </div>
      {submitted && q.rationale && <div style={t.rationaleBox}>💡 {q.rationale}</div>}
    </>
  );
}

function MatchQuestion({ q, response, onChange, submitted }) {
  const resp = response || {};
  const [selectedLeft, setSelectedLeft] = useState(null);

  // Deterministic shuffle — stable across re-renders for the same question instance
  const [shuffledRight] = useState(() => {
    const arr = q.pairs.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(i * 0.6180339) % i;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  const handleLeft = (li) => {
    if (submitted) return;
    setSelectedLeft(selectedLeft === li ? null : li);
  };

  const handleRight = (actualRi) => {
    if (submitted || selectedLeft === null) return;
    const newResp = { ...resp };
    Object.keys(newResp).forEach((k) => { if (newResp[k] === actualRi) delete newResp[k]; });
    newResp[selectedLeft] = actualRi;
    onChange(newResp);
    setSelectedLeft(null);
  };

  const matchedRightOf = (li) => (resp[li] !== undefined ? resp[li] : null);
  const leftPairedTo   = (actualRi) => Object.entries(resp).find(([, v]) => v === actualRi)?.[0];

  const allCorrect = q.pairs.every((_, i) => resp[i] === i);

  return (
    <>
      <div style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1.65, marginBottom: "0.5rem" }}>{q.stem}</div>
      {selectedLeft !== null && !submitted && (
        <div style={{ fontSize: 12, color: IND, marginBottom: "0.6rem", padding: "0.4rem 0.75rem", background: IND_L, borderRadius: 6 }}>
          Now click a definition to pair with: <strong>{q.pairs[selectedLeft].left}</strong>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 0.75rem" }}>
        {/* Left column — terms */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8A96A3", marginBottom: 2 }}>Terms</div>
          {q.pairs.map((pair, li) => {
            const mr      = matchedRightOf(li);
            const sel     = selectedLeft === li;
            const correct = submitted && mr === li;
            const wrong   = submitted && mr !== null && mr !== li;
            const missed  = submitted && mr === null;
            return (
              <button key={li} onClick={() => handleLeft(li)}
                style={{
                  textAlign: "left", padding: "0.55rem 0.7rem", borderRadius: 7, fontSize: 13, lineHeight: 1.4,
                  border: `1.5px solid ${correct ? "#1D9E75" : (wrong || missed) ? "#C44" : sel ? IND : mr !== null ? IND : BDC_BORDER}`,
                  background: correct ? "#E1F5EE" : (wrong || missed) ? "#FCEBEB" : sel ? IND_L : mr !== null ? "#F0F4FF" : "#FFFFFF",
                  color: correct ? "#085041" : (wrong || missed) ? "#501313" : sel ? IND : BDC_NAVY,
                  cursor: submitted ? "default" : "pointer", fontFamily: SANS, fontWeight: sel ? 600 : 400,
                }}>
                {submitted ? (correct ? "✓ " : "✗ ") : ""}{pair.left}
              </button>
            );
          })}
        </div>
        {/* Right column — definitions (shuffled) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#8A96A3", marginBottom: 2 }}>Definitions</div>
          {shuffledRight.map((actualRi) => {
            const pair    = q.pairs[actualRi];
            const leftKey = leftPairedTo(actualRi);
            const matched = leftKey !== undefined;
            const correct = submitted && matched && parseInt(leftKey) === actualRi;
            const wrong   = submitted && matched && parseInt(leftKey) !== actualRi;
            return (
              <button key={actualRi} onClick={() => handleRight(actualRi)}
                style={{
                  textAlign: "left", padding: "0.55rem 0.7rem", borderRadius: 7, fontSize: 13, lineHeight: 1.4,
                  border: `1.5px solid ${correct ? "#1D9E75" : wrong ? "#C44" : matched ? IND : selectedLeft !== null ? IND + "44" : BDC_BORDER}`,
                  background: correct ? "#E1F5EE" : wrong ? "#FCEBEB" : matched ? "#F0F4FF" : selectedLeft !== null ? IND_L + "44" : "#FFFFFF",
                  color: correct ? "#085041" : wrong ? "#501313" : BDC_NAVY,
                  cursor: submitted ? "default" : (selectedLeft !== null && !matched) ? "pointer" : "default",
                  fontFamily: SANS,
                }}>
                {pair.right}
              </button>
            );
          })}
        </div>
      </div>
      {submitted && !allCorrect && (
        <div style={{ marginTop: "0.75rem", background: "#FAEEDA", border: "1px solid #FAC775", borderRadius: 6, padding: "0.65rem 0.875rem" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#412402", marginBottom: 5 }}>Correct pairings:</div>
          {q.pairs.map((pair, i) => (
            <div key={i} style={{ fontSize: 12.5, color: "#412402", marginBottom: 2 }}>• <strong>{pair.left}</strong> → {pair.right}</div>
          ))}
        </div>
      )}
    </>
  );
}

// ── Loading with retry ────────────────────────────────────────────────────────
function LoadingCluster({ onRetry }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${BDC_BORDER}`, borderRadius: 10, padding: "1.5rem 1.25rem", marginBottom: "1rem", boxShadow: "0 1px 4px rgba(26,43,74,0.06)" }}>
      <Dots label="Generating questions…" />
      {slow && (
        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "#F4F5F7", borderRadius: 8 }}>
          <span style={{ fontSize: 12.5, color: "#4A5568" }}>Taking longer than expected.</span>
          <button onClick={onRetry} style={{ fontSize: 12, fontWeight: 700, color: BDC_RED, background: "none", border: `1.5px solid ${BDC_RED}`, borderRadius: 50, padding: "4px 14px", cursor: "pointer", fontFamily: SANS }}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

function QuestionBlock({ q, index, response, onChange, submitted }) {
  const typeLabel = { mc: "Multiple Choice", tf: "True / False", match: "Matching" }[q.type] || q.type;
  const answered  = isAnswered(q, response);
  return (
    <div style={{ ...t.card, borderLeft: answered && !submitted ? `3px solid ${IND}` : `1px solid ${BDC_BORDER}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
        <span style={{ ...t.sec, marginBottom: 0 }}>Question {index + 1}</span>
        <span style={{ fontSize: 11, color: "#8A96A3", background: "#ECEEF2", padding: "2px 8px", borderRadius: 4 }}>{typeLabel}</span>
      </div>
      {q.type === "mc"    && <MCQuestion    q={q} response={response} onChange={onChange} submitted={submitted} />}
      {q.type === "tf"    && <TFQuestion    q={q} response={response} onChange={onChange} submitted={submitted} />}
      {q.type === "match" && <MatchQuestion q={q} response={response} onChange={onChange} submitted={submitted} />}
    </div>
  );
}

// ── Routing Card ──────────────────────────────────────────────────────────────
const ROUTE_STYLES = {
  ADVANCE:   { bg: "#E1F5EE", border: "#9FE1CB", color: "#085041", label: "✓  Advancing to next topic" },
  REINFORCE: { bg: "#FAEEDA", border: "#FAC775", color: "#412402", label: "↑  Reinforcing before continuing" },
  REMEDIATE: { bg: "#FCEBEB", border: "#F09595", color: "#501313", label: "⚑  Targeted remediation" },
};

function RoutingCard({ routing, onContinue, isLast, loading }) {
  const rs = ROUTE_STYLES[routing.route] || ROUTE_STYLES.REINFORCE;
  return (
    <div style={{ ...t.card, borderLeft: `3px solid ${rs.border}`, background: rs.bg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.875rem", gap: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: rs.color, flexShrink: 0 }}>{rs.label}</div>
        <div style={{ fontSize: 12, color: rs.color, opacity: 0.75, textAlign: "right" }}>{routing.routeReason}</div>
      </div>
      <div style={{ fontSize: 13.5, color: rs.color, lineHeight: 1.65, marginBottom: routing.remediation ? "0.875rem" : 0 }}>
        <strong>Pattern:</strong> {routing.pattern}
      </div>
      {routing.remediation && (
        <div style={{ padding: "0.875rem 1rem", background: "rgba(255,255,255,0.55)", borderRadius: 8, border: `1px solid ${rs.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: rs.color, marginBottom: 6 }}>Targeted guidance</div>
          <div style={{ fontSize: 13.5, color: rs.color, lineHeight: 1.7 }}>{routing.remediation}</div>
        </div>
      )}
      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
        <button style={t.btnP(loading)} onClick={onContinue} disabled={loading}>
          {loading ? "Loading…" : isLast ? "View results" : "Next topic →"}
        </button>
      </div>
    </div>
  );
}


// ── Under the Hood ────────────────────────────────────────────────────────────
const DARK = "#0F1117";
const DARK2 = "#1A1E2A";
const DARK3 = "#252B3B";
const DARK_BORDER = "#2E3650";
const CODE = "#E2E8F0";
const DIM  = "#8A97B0";
const HL   = BDC_RED;

const PIPELINE_STEPS = [
  {
    phase: "Setup",
    color: "#6C63FF",
    bg: "#1E1A2E",
    steps: [
      { label: "User configures topic + subtopics", detail: "Free-text inputs define the full curriculum contract. No API call yet — all client-side." },
      { label: "✦ Suggest for me (optional)", detail: "One Haiku call: given the topic, generate 4 concrete, testable subtopic labels. The result pre-fills the inputs; the user can edit before starting." },
    ],
  },
  {
    phase: "Cluster generation",
    color: BDC_RED,
    bg: "#1E0A0D",
    steps: [
      { label: "buildSys('cluster', subtopic, contract)", detail: "Assembles the system prompt from the live contract. Instructs the model to generate exactly 3 questions — one MC, one TF, one Match — targeting real workplace mistakes for that subtopic." },
      { label: "Haiku API call → raw JSON", detail: "Returns a questions[] array. Each question includes stem, correct answer(s), and a rationale explaining the most common wrong-answer trap." },
      { label: "parseJSON + render", detail: "JSON is parsed and each question is rendered into its typed component (MCQuestion, TFQuestion, MatchQuestion). Responses are initialised as undefined / empty object." },
    ],
  },
  {
    phase: "Answer & submit",
    color: "#1D9E75",
    bg: "#0A1E18",
    steps: [
      { label: "Learner answers all 3 questions", detail: "Submit is locked until isAnswered() returns true for every question. Match requires all 3 pairs to be assigned." },
      { label: "submitted = true → show rationale", detail: "Each question reveals correct/wrong state and the rationale text. No API call yet — all pre-generated." },
    ],
  },
  {
    phase: "Pattern analysis",
    color: "#BA7517",
    bg: "#1E1200",
    steps: [
      { label: "buildSys('analyze', subtopic, contract)", detail: "Prompt instructs the model to read the specific combination of errors — not just a score. A learner wrong on Q1+Q3 reveals a different gap than Q2+Q3 at the same score." },
      { label: "Haiku API call → route + remediation", detail: "Returns: pattern (what the error combination reveals), gap (the specific misconception), route (ADVANCE / REINFORCE / REMEDIATE), routeReason, and optional remediation text." },
      { label: "RoutingCard renders", detail: "Route is displayed with targeted guidance. ADVANCE skips remediation. REINFORCE shows one gap note. REMEDIATE shows a full targeted explanation before continuing." },
    ],
  },
  {
    phase: "Debrief",
    color: "#4A90D9",
    bg: "#0A1422",
    steps: [
      { label: "buildSys('debrief', null, contract)", detail: "All 4 subtopic results are summarised — label, score, route taken, gap identified, pattern — and passed as the full performance record." },
      { label: "Haiku API call → scores + insight", detail: "Returns objective-by-objective scores (0–100), overall score, strengthSummary (what they clearly understood), and priorityAction (one specific, actionable thing to do before applying this at work)." },
      { label: "Adaptive path visualised", detail: "Each subtopic is shown with its score and route badge, so the learner sees exactly where the AI routed them and why." },
    ],
  },
];

const QUESTION_TYPES = [
  {
    type: "mc",
    label: "Multiple Choice",
    icon: "⊙",
    color: "#6C63FF",
    bg: "#1E1A2E",
    desc: "4 options, exactly 1 correct. Stem is a workplace scenario (30–60 words). Distractors must be plausible — not obviously wrong. Best for conceptual understanding and surfacing common confusions.",
    prompt: `"type": "mc",
"stem": "Scenario-based (30-60 words)",
"options": ["A","B","C","D"],
"correct": 0,
"rationale": "Why correct + why the best wrong answer fails"`,
  },
  {
    type: "tf",
    label: "True / False",
    icon: "⊠",
    color: "#1D9E75",
    bg: "#0A1E18",
    desc: "A nuanced statement (20–40 words) the learner evaluates as true or false. Non-obvious — if the answer is clear from phrasing, the exercise has no diagnostic value. Best for testing misconceptions directly.",
    prompt: `"type": "tf",
"stem": "Nuanced statement (non-obvious)",
"correct": true,
"rationale": "Why true or false"`,
  },
  {
    type: "match",
    label: "Matching",
    icon: "⇌",
    color: "#BA7517",
    bg: "#1E1200",
    desc: "3 term–definition pairs. The right column is shuffled on render. Learner clicks a term then clicks its definition. All 3 must be paired before submit. Best for vocabulary, frameworks, and concept–application links.",
    prompt: `"type": "match",
"stem": "Match each term to its definition",
"pairs": [
  {"left":"Term","right":"Definition"},
  ...
]`,
  },
];

function UnderTheHood({ setupTopic, setupSubs }) {
  const [open, setOpen] = useState(false);
  const [tab,  setTab]  = useState("pipeline");

  const sampleContract = {
    topic: setupTopic || DEFAULT_TOPIC,
    objectives: (setupSubs || DEFAULT_SUBTOPICS).filter(s => s.trim()),
  };

  const clusterPromptPreview = `CURRICULUM CONTRACT — FIXED, NEVER DEVIATE:
Topic: ${sampleContract.topic}
Subtopics: ${sampleContract.objectives.join(", ")}
GUARDRAIL: Confirm each question directly tests the stated sub-topic.

You are generating a diagnostic question cluster for sub-topic:
"${sampleContract.objectives[0] || "Subtopic 1"}"

Generate exactly 3 questions (one mc, one tf, one match).
Target the most common real-world mistakes on this sub-topic.
Distractors must be plausible — not obviously wrong.`;

  const analyzePromptPreview = `[same contract header]

You are analyzing a learner's answer pattern on:
"${sampleContract.objectives[0] || "Subtopic 1"}"

CRITICAL: Do NOT just score. Read the specific combination
of errors to identify what misconception they reveal.
A learner wrong on Q1+Q3 has a different gap than Q2+Q3.

Routes: ADVANCE · REINFORCE · REMEDIATE`;

  const debriefPromptPreview = `[same contract header]

Generate a final debrief for:
"${sampleContract.topic}"

Performance record includes: sub-topic label, score,
route taken, gap identified, pattern detected.

Return: scores[], overall, strengthSummary, priorityAction`;

  const tabStyle = (id) => ({
    padding: "0.4rem 0.875rem", fontSize: 11, fontWeight: 700,
    letterSpacing: "0.06em", textTransform: "uppercase",
    border: "none", cursor: "pointer", fontFamily: SANS,
    borderRadius: 4,
    background: tab === id ? BDC_RED : "transparent",
    color: tab === id ? "#fff" : DIM,
    transition: "all 0.15s",
  });

  const codeBlock = (text) => (
    <pre style={{ fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: 11.5, lineHeight: 1.7, color: CODE, background: DARK3, borderRadius: 6, padding: "0.875rem 1rem", overflowX: "auto", margin: "0.5rem 0 0", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {text}
    </pre>
  );

  return (
    <div style={{ marginBottom: "1.25rem", borderRadius: 10, overflow: "hidden", border: `1px solid ${DARK_BORDER}` }}>
      {/* Toggle header */}
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.875rem 1.125rem", background: DARK2, border: "none", cursor: "pointer",
        fontFamily: SANS, textAlign: "left",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, opacity: 0.6 }}>⚙</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: DIM }}>Under the hood</span>
          <span style={{ fontSize: 10, color: BDC_RED, background: "#1E0A0D", padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>AI breakdown</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
          <path d="M2 4l4 4 4-4" stroke={DIM} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      </button>

      {open && (
        <div style={{ background: DARK, padding: "0 1.125rem 1.125rem" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, padding: "0.75rem 0 0.875rem", borderBottom: `1px solid ${DARK_BORDER}`, marginBottom: "1rem" }}>
            {[
              { id: "pipeline",  label: "Pipeline" },
              { id: "prompts",   label: "Prompts" },
              { id: "qtypes",    label: "Question types" },
              { id: "routing",   label: "Routing logic" },
            ].map(({ id, label }) => (
              <button key={id} style={tabStyle(id)} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>

          {/* ── Pipeline tab ── */}
          {tab === "pipeline" && (
            <div>
              <p style={{ fontSize: 12.5, color: DIM, lineHeight: 1.65, marginBottom: "1.25rem" }}>
                Every assessment run makes <strong style={{ color: CODE }}>6 API calls minimum</strong> — one cluster generation and one pattern analysis per subtopic, plus one final debrief. The optional "Suggest" call adds one more at setup.
              </p>
              {PIPELINE_STEPS.map((section, si) => (
                <div key={si} style={{ marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: section.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: section.color }}>{section.phase}</span>
                  </div>
                  {section.steps.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: "0.375rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 3 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: DARK_BORDER, border: `1.5px solid ${section.color}`, flexShrink: 0 }} />
                        {i < section.steps.length - 1 && <div style={{ width: 1, flex: 1, background: DARK_BORDER, marginTop: 3 }} />}
                      </div>
                      <div style={{ paddingBottom: "0.5rem" }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: CODE, marginBottom: 2 }}>{step.label}</div>
                        <div style={{ fontSize: 12, color: DIM, lineHeight: 1.55 }}>{step.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* ── Prompts tab ── */}
          {tab === "prompts" && (
            <div>
              <p style={{ fontSize: 12.5, color: DIM, lineHeight: 1.65, marginBottom: "1rem" }}>
                All three modes share the same contract header — built live from the topic and subtopics the user configured. Below is what each system prompt looks like for your current setup.
              </p>
              {[
                { label: "mode: cluster", color: BDC_RED, preview: clusterPromptPreview, note: "Runs once per subtopic (×4). Returns a questions[] array with mc, tf, and match items." },
                { label: "mode: analyze", color: "#BA7517", preview: analyzePromptPreview, note: "Runs after each cluster submit. Receives the full answer summary including which specific options were selected." },
                { label: "mode: debrief", color: "#4A90D9", preview: debriefPromptPreview, note: "Runs once at the end. Receives all 4 subtopic results including route, gap, and pattern for each." },
              ].map(({ label, color, preview, note }) => (
                <div key={label} style={{ marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", padding: "2px 8px", borderRadius: 4, background: color + "22", color }}>{label}</span>
                    <span style={{ fontSize: 11, color: DIM }}>→ claude-haiku-4-5</span>
                  </div>
                  {codeBlock(preview)}
                  <div style={{ fontSize: 11.5, color: DIM, marginTop: 6, lineHeight: 1.5 }}>↳ {note}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── Question types tab ── */}
          {tab === "qtypes" && (
            <div>
              <p style={{ fontSize: 12.5, color: DIM, lineHeight: 1.65, marginBottom: "1rem" }}>
                Each cluster always contains exactly one of each type. The cluster prompt specifies all three — the model is never allowed to repeat a type or skip one.
              </p>
              {QUESTION_TYPES.map(({ type, label, icon, color, bg, desc, prompt }) => (
                <div key={type} style={{ background: bg, border: `1px solid ${color}22`, borderRadius: 8, padding: "0.875rem 1rem", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16, color }}>{icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: "0.04em" }}>{label}</span>
                    <code style={{ fontSize: 10, color: color + "BB", background: color + "11", padding: "1px 7px", borderRadius: 4 }}>{type}</code>
                  </div>
                  <p style={{ fontSize: 12.5, color: DIM, lineHeight: 1.6, marginBottom: 8 }}>{desc}</p>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: DIM, marginBottom: 4 }}>JSON shape</div>
                  {codeBlock(prompt)}
                </div>
              ))}
            </div>
          )}

          {/* ── Routing logic tab ── */}
          {tab === "routing" && (
            <div>
              <p style={{ fontSize: 12.5, color: DIM, lineHeight: 1.65, marginBottom: "1rem" }}>
                Routing is the core differentiator from a static quiz. The model doesn't just threshold a score — it reads which specific questions were wrong and infers the underlying misconception.
              </p>

              {[
                { route: "ADVANCE", color: "#1D9E75", bg: "#0A1E18", border: "#1D9E7533",
                  trigger: "2–3 correct, no critical misconception in the error pattern.",
                  outcome: "No remediation shown. Learner proceeds immediately to the next subtopic.",
                  example: "Wrong on Q2 (TF) only → likely a knowledge gap on one nuance, not a fundamental flaw." },
                { route: "REINFORCE", color: "#BA7517", bg: "#1E1200", border: "#BA751733",
                  trigger: "2 correct, but one answer reveals a specific gap worth addressing.",
                  outcome: "A targeted one-paragraph note is shown before continuing. Gap is named explicitly.",
                  example: "Correct MC + Match, wrong TF → misconception on a specific statement, not the whole concept." },
                { route: "REMEDIATE", color: BDC_RED, bg: "#1E0A0D", border: BDC_RED + "33",
                  trigger: "Multiple errors, or one error that signals a fundamental misconception in the underlying concept.",
                  outcome: "A full targeted explanation with concrete examples is shown. The gap is directly addressed before moving on.",
                  example: "Wrong MC + TF → the error pattern suggests the learner has an inverted mental model of the core idea." },
              ].map(({ route, color, bg, border, trigger, outcome, example }) => (
                <div key={route} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "0.875rem 1rem", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", padding: "2px 10px", borderRadius: 20, background: color + "22", color }}>{route}</span>
                  </div>
                  {[
                    { label: "Trigger condition", val: trigger },
                    { label: "What the learner sees", val: outcome },
                    { label: "Example pattern", val: example },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ marginBottom: 6 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: color + "99", marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 12.5, color: DIM, lineHeight: 1.55 }}>{val}</div>
                    </div>
                  ))}
                </div>
              ))}

              <div style={{ background: DARK2, borderRadius: 8, padding: "0.875rem 1rem", marginTop: "0.75rem" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: DIM, marginBottom: 6 }}>What the analyze prompt receives</div>
                {codeBlock(`Q1 [MC]: Scenario stem…
→ Selected option 2 ("Option C") — INCORRECT (correct was option 0: "Option A")

Q2 [TF]: Statement to evaluate…
→ Selected false — CORRECT

Q3 [MATCH]: Match each term…
→ Incorrectly matched: Term B, Term C`)}
                <div style={{ fontSize: 11.5, color: DIM, marginTop: 8, lineHeight: 1.55 }}>The model sees which specific option was chosen, not just right/wrong — enabling it to name the exact misconception driving the wrong answer.</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdaptiveQuestionPackPage() {
  // ── Setup state ──
  const [setupTopic,    setSetupTopic]    = useState(DEFAULT_TOPIC);
  const [setupSubs,     setSetupSubs]     = useState([...DEFAULT_SUBTOPICS]);
  const [suggestLoading,setSuggestLoading]= useState(false);

  // ── Active contract (set on Begin) ──
  const [contract,      setContract]      = useState(null);
  const [subtopics,     setSubtopics]     = useState([]);

  // ── Assessment state ──
  const [phase,         setPhase]         = useState("setup");
  const [subtopicIndex, setSubtopicIndex] = useState(0);
  const [cluster,       setCluster]       = useState(null);
  const [responses,     setResponses]     = useState([]);
  const [submitted,     setSubmitted]     = useState(false);
  const [routing,       setRouting]       = useState(null);
  const [allResults,    setAllResults]    = useState([]);
  const [debrief,       setDebrief]       = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  const reset = () => {
    setPhase("setup"); setSubtopicIndex(0); setCluster(null);
    setResponses([]); setSubmitted(false); setRouting(null);
    setAllResults([]); setDebrief(null); setLoading(false); setError(null);
    setContract(null); setSubtopics([]);
  };

  // Suggest subtopics from topic using AI
  const suggestSubtopics = async () => {
    if (!setupTopic.trim()) return;
    setSuggestLoading(true);
    try {
      const res = await fetch("https://bdc-api.nicholasmcgowan07.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 300,
          system: `You are an instructional designer. Given a workplace training topic, suggest exactly 4 distinct subtopics that together cover the most critical knowledge areas for employee competency. Each subtopic should be concrete and testable with scenario-based questions.\n\nReturn ONLY valid JSON, no markdown:\n{"subtopics":["Subtopic 1","Subtopic 2","Subtopic 3","Subtopic 4"]}`,
          messages: [{ role: "user", content: `Topic: "${setupTopic.trim()}"` }],
        }),
      });
      const data = await res.json();
      const parsed = parseJSON(data.content[0].text);
      if (parsed?.subtopics?.length === 4) setSetupSubs(parsed.subtopics);
    } catch (e) { /* silently fail — user can edit manually */ }
    setSuggestLoading(false);
  };

  const beginAssessment = () => {
    const { contract: c, subtopics: s } = buildContract(
      setupTopic.trim() || DEFAULT_TOPIC,
      setupSubs.map(s => s.trim()).filter(Boolean).slice(0, 4)
    );
    setContract(c); setSubtopics(s);
    setPhase("cluster"); loadCluster(0, c, s);
  };

  const setupReady = setupTopic.trim().length > 3 && setupSubs.filter(s => s.trim().length > 2).length === 4;

  const loadCluster = useCallback(async (stIdx, c, s) => {
    const subtopic = (s || subtopics)[stIdx];
    const activeContract = c || contract;
    setLoading(true); setCluster(null); setResponses([]); setSubmitted(false); setRouting(null);
    try {
      const raw = await callClaude(
        [{ role: "user", content: `Generate the diagnostic question cluster for "${subtopic.label}" now.` }],
        "cluster", subtopic, activeContract
      );
      const parsed = parseJSON(raw);
      if (parsed?.questions?.length) {
        setCluster(parsed);
        setResponses(parsed.questions.map(initResponse));
      } else throw new Error("Unexpected response format — please retry.");
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  // beginAssessment defined above in state block

  const setResponse = (qIdx, val) =>
    setResponses((prev) => { const n = [...prev]; n[qIdx] = val; return n; });

  const allAnswered = cluster
    ? cluster.questions.every((q, i) => isAnswered(q, responses[i]))
    : false;

  const submitCluster = async () => {
    setSubmitted(true); setLoading(true);
    const subtopic = subtopics[subtopicIndex];
    try {
      const summary = cluster.questions.map((q, i) => {
        const r = responses[i]; let respStr = "";
        if (q.type === "mc")
          respStr = `Selected option ${r} ("${q.options[r]}") — ${r === q.correct ? "CORRECT" : `INCORRECT (correct was option ${q.correct}: "${q.options[q.correct]}")`}`;
        else if (q.type === "tf")
          respStr = `Selected ${r} — ${r === q.correct ? "CORRECT" : "INCORRECT"}`;
        else if (q.type === "match") {
          const wrongPairs = q.pairs.filter((_, pi) => r?.[pi] !== pi).map((p) => p.left);
          respStr = wrongPairs.length === 0
            ? "All 3 pairs correctly matched"
            : `Incorrectly matched: ${wrongPairs.join(", ")}`;
        }
        return `Q${i + 1} [${q.type.toUpperCase()}]: ${q.stem}\n→ ${respStr}`;
      }).join("\n\n");

      const raw = await callClaude(
        [{ role: "user", content: `Analyse these responses for the sub-topic "${subtopic.label}":\n\n${summary}` }],
        "analyze", subtopic
      );
      setRouting(parseJSON(raw) || {
        pattern: "Mixed performance across the cluster.",
        gap: "Application of concepts in workplace scenarios",
        route: "REINFORCE",
        routeReason: "One concept needs reinforcement before continuing.",
        remediation: "Review how these concepts apply to your day-to-day work tasks.",
      });
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const continueNext = async () => {
    const newResults = [
      ...allResults,
      { subtopic: subtopics[subtopicIndex], questions: cluster.questions, responses, routing },
    ];
    setAllResults(newResults);
    const nextIdx = subtopicIndex + 1;
    if (nextIdx < subtopics.length) {
      setSubtopicIndex(nextIdx);
      loadCluster(nextIdx, contract, subtopics);
    } else {
      setPhase("debrief"); setLoading(true);
      try {
        const summary = newResults.map((r) => {
          const score = r.questions.reduce((acc, q, i) => acc + (isCorrect(q, r.responses[i]) ? 1 : 0), 0);
          return `Sub-topic: ${r.subtopic.label}\nScore: ${score}/${r.questions.length}\nRoute taken: ${r.routing?.route}\nGap identified: ${r.routing?.gap || "none"}\nPattern: ${r.routing?.pattern || "n/a"}`;
        }).join("\n\n");

        const raw = await callClaude(
          [{ role: "user", content: `Generate the final debrief. Full performance record:\n\n${summary}` }],
          "debrief", null
        );
        setDebrief(parseJSON(raw) || {
          scores: contract.objectives.map((o) => ({
            obj: o, score: 65,
            fb: "Solid baseline — review the gaps flagged during the assessment before applying this at work.",
          })),
          overall: 65,
          strengthSummary: "Demonstrated baseline awareness of core data privacy principles.",
          priorityAction: "Review the targeted guidance shown after each topic where you were routed to remediation or reinforcement.",
        });
      } catch (e) { setError(e.message); }
      setLoading(false);
    }
  };

  const subtopic    = subtopics[subtopicIndex] || { label: "", objIndex: 0 };
  const isLastTopic = subtopicIndex === subtopics.length - 1;
  const scoreColor  = (s) => s >= 75 ? "#1D9E75" : s >= 50 ? "#BA7517" : "#A32D2D";

  return (
    <div style={t.wrap}>
      <PhaseBar subtopicIndex={subtopicIndex} phase={phase} />
      {["cluster", "debrief"].includes(phase) && <ContractPanel contract={contract} />}

      {error && (
        <div style={t.errBox}>
          <strong style={{ display: "block", marginBottom: 4 }}>Error</strong>{error}
          <button style={{ ...t.btnG, padding: "2px 10px", fontSize: 12, marginLeft: 10 }} onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* ── Intro ── */}
      {phase === "setup" && (
        <>
          <div style={t.tag}>
            <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3.5" fill="currentColor" /></svg>
            Adaptive Question Pack · v1
          </div>
          <div style={{ fontSize: 22, fontWeight: 400, marginBottom: "0.4rem", lineHeight: 1.3, color: BDC_NAVY }}>Configure your assessment</div>
          <div style={{ fontSize: 14, color: "#4A5568", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            Enter your topic and four subtopics — or use the defaults and start immediately. The AI generates all questions from your input.
          </div>

          {/* Topic input */}
          <div style={t.card}>
            <div style={t.sec}>Topic</div>
            <input
              value={setupTopic}
              onChange={e => setSetupTopic(e.target.value)}
              placeholder="e.g. Workplace Health & Safety, Anti-Money Laundering, GDPR…"
              style={{ width: "100%", border: `1.5px solid ${BDC_BORDER}`, borderRadius: 8, padding: "0.65rem 0.9rem", fontFamily: SANS, fontSize: 14, color: BDC_NAVY, background: "#FFFFFF", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Subtopics */}
          <div style={t.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
              <span style={t.sec}>Subtopics (4 required)</span>
              <button
                onClick={suggestSubtopics}
                disabled={!setupTopic.trim() || suggestLoading}
                style={{ fontSize: 12, fontWeight: 700, color: setupTopic.trim() ? BDC_RED : "#8A96A3", background: "none", border: `1.5px solid ${setupTopic.trim() ? BDC_RED : BDC_BORDER}`, borderRadius: 50, padding: "4px 14px", cursor: setupTopic.trim() && !suggestLoading ? "pointer" : "default", fontFamily: SANS, display: "flex", alignItems: "center", gap: 6 }}>
                {suggestLoading ? <><Dots /><span>Suggesting…</span></> : "✦ Suggest for me"}
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {setupSubs.map((sub, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ ...t.objBadge, flexShrink: 0 }}>{i + 1}</div>
                  <input
                    value={sub}
                    onChange={e => { const n = [...setupSubs]; n[i] = e.target.value; setSetupSubs(n); }}
                    placeholder={`Subtopic ${i + 1}`}
                    style={{ flex: 1, border: `1.5px solid ${sub.trim().length > 2 ? BDC_BORDER : "#FAC775"}`, borderRadius: 8, padding: "0.55rem 0.8rem", fontFamily: SANS, fontSize: 13.5, color: BDC_NAVY, background: "#FFFFFF", outline: "none" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Routing explainer */}
          <div style={{ ...t.card, background: "#F4F5F7" }}>
            <div style={t.sec}>How adaptive routing works</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { badge: "ADVANCE",   color: "#1D9E75", bg: "#E1F5EE", desc: "Strong performance — move directly to the next topic" },
                { badge: "REINFORCE", color: "#BA7517", bg: "#FAEEDA", desc: "Good understanding with one specific gap — targeted note before continuing" },
                { badge: "REMEDIATE", color: "#A32D2D", bg: "#FCEBEB", desc: "A misconception detected — focused explanation before moving on" },
              ].map(({ badge, color, bg, desc }) => (
                <div key={badge} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#4A5568" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: bg, color, flexShrink: 0 }}>{badge}</span>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          <UnderTheHood setupTopic={setupTopic} setupSubs={setupSubs} />

          <button style={t.btnP(!setupReady)} onClick={beginAssessment} disabled={!setupReady}>
            Begin assessment →
          </button>
        </>
      )}

      {/* ── Cluster ── */}
      {phase === "cluster" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{subtopic.label}</div>
              <div style={{ fontSize: 12, color: "#8A96A3" }}>
                Subtopic {subtopicIndex + 1} of {subtopics.length} · 3 questions
              </div>
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {subtopics.map((_, i) => (
                <div key={i} style={{
                  width: i === subtopicIndex ? 20 : 8, height: 8, borderRadius: 4,
                  background: i < subtopicIndex ? "#1D9E75" : i === subtopicIndex ? IND : BDC_BORDER,
                  transition: "all 0.3s",
                }} />
              ))}
            </div>
          </div>

          {loading && !cluster && (
            <LoadingCluster onRetry={() => loadCluster(subtopicIndex, contract, subtopics)} />
          )}

          {cluster && cluster.questions.map((q, i) => (
            <QuestionBlock
              key={`${subtopicIndex}-${i}`}
              q={q} index={i}
              response={responses[i]}
              onChange={(val) => setResponse(i, val)}
              submitted={submitted}
            />
          ))}

          {cluster && !submitted && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
              <button style={t.btnP(!allAnswered || loading)} onClick={submitCluster} disabled={!allAnswered || loading}>
                {loading ? "Analysing…" : "Submit answers"}
              </button>
            </div>
          )}

          {submitted && loading && !routing && (
            <div style={t.card}><Dots label="Reading your answer pattern…" /></div>
          )}

          {submitted && routing && (
            <RoutingCard routing={routing} onContinue={continueNext} isLast={isLastTopic} loading={loading} />
          )}
        </>
      )}

      {/* ── Debrief ── */}
      {phase === "debrief" && (
        <>
          {!debrief ? (
            <div style={t.card}><Dots label="Generating your results…" /></div>
          ) : (
            <>
              {/* Overall score */}
              <div style={{ textAlign: "center", padding: "1.5rem", background: "#F4F5F7", border: `1px solid ${BDC_BORDER}`, borderRadius: 10, marginBottom: "1rem" }}>
                <div style={{ fontSize: 52, fontWeight: 500, lineHeight: 1, color: scoreColor(debrief.overall), marginBottom: 4 }}>{debrief.overall}</div>
                <div style={{ fontSize: 13, color: "#4A5568" }}>Overall score across all objectives</div>
              </div>

              {/* Objective breakdown */}
              <div style={t.card}>
                <div style={t.sec}>Objective-by-objective</div>
                {debrief.scores.map((sc, i) => {
                  const c = scoreColor(sc.score);
                  return (
                    <div key={i} style={{ paddingBottom: "1rem", marginBottom: "1rem", borderBottom: i < debrief.scores.length - 1 ? `1px solid ${BDC_BORDER}` : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, fontSize: 13.5, fontWeight: 500 }}>
                        <span style={{ color: c, fontSize: 16 }}>{sc.score >= 70 ? "✓" : sc.score >= 45 ? "~" : "○"}</span>
                        <span>{sc.obj}</span>
                      </div>
                      <div style={{ height: 5, background: BDC_BORDER, borderRadius: 3, marginBottom: 5, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${sc.score}%`, background: c, borderRadius: 3, transition: "width 1s ease" }} />
                      </div>
                      <div style={{ fontSize: 13, color: "#4A5568", lineHeight: 1.6 }}>{sc.fb}</div>
                    </div>
                  );
                })}
              </div>

              {/* Strength summary */}
              <div style={{ background: "#E1F5EE", border: "1px solid #9FE1CB", borderRadius: 10, padding: "1.25rem", marginBottom: "1rem" }}>
                <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "#0F6E56", marginBottom: "0.5rem" }}>What you understood well</div>
                <div style={{ fontSize: 14, lineHeight: 1.75, color: "#04342C" }}>{debrief.strengthSummary}</div>
              </div>

              {/* Priority action */}
              <div style={{ background: "#FAEEDA", border: "1px solid #FAC775", borderRadius: 10, padding: "1.25rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="12" rx="2" stroke="#854F0B" strokeWidth="1.3" fill="none" />
                    <path d="M5 1v4M11 1v4M1 7h14" stroke="#854F0B" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "#854F0B" }}>Before applying this at work</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.75, color: "#412402" }}>{debrief.priorityAction}</div>
              </div>

              {/* Adaptive path taken */}
              <div style={t.card}>
                <div style={t.sec}>Your adaptive path</div>
                {allResults.map((r, i) => {
                  const score  = r.questions.reduce((acc, q, qi) => acc + (isCorrect(q, r.responses[qi]) ? 1 : 0), 0);
                  const route  = r.routing?.route || "ADVANCE";
                  const rs     = ROUTE_STYLES[route] || ROUTE_STYLES.ADVANCE;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.625rem", fontSize: 13 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: IND_L, color: IND, fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                      <span style={{ flex: 1, color: "#4A5568" }}>{r.subtopic.label}</span>
                      <span style={{ fontSize: 12, color: "#8A96A3" }}>{score}/{r.questions.length}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: rs.bg, color: rs.color }}>{route}</span>
                    </div>
                  );
                })}
              </div>

              <button style={t.btnP(false)} onClick={reset}>Retake assessment</button>
            </>
          )}
        </>
      )}
    </div>
  );
}
