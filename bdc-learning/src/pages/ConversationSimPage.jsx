import { useState, useCallback } from "react";

// ── Module Library — swap CONTRACT + WARMUP per module type ──────────────────
const MODULES = {
  feedback: {
    id: "feedback",
    label: "Giving Feedback",
    emoji: "💬",
    tagline: "Structure feedback that's heard, not resisted",
    headline: ["Give feedback that", "actually lands"],
    introCopy: "Describe a real feedback situation, get a tailored diagnostic, then practice the conversation — with live coaching nudges and a personalised debrief.",
    contract: {
      topic: "Giving Effective Feedback in the Workplace",
      objectives: [
        "Distinguish constructive feedback from personal criticism",
        "Apply the SBI (Situation–Behavior–Impact) model to structure feedback",
        "Recognise and avoid common pitfalls: vagueness, judgment language, and poor timing",
      ],
      outOfScope: ["HR procedures or performance reviews", "Compensation, promotions, or discipline", "Personal non-workplace relationships"],
    },
    warmup: [
      { q: "When you imagine having this feedback conversation, what feels hardest?", opts: ["Finding the right words without sounding harsh", "Managing how they might react", "Knowing the right moment to bring it up", "Staying focused on the issue, not the person"] },
      { q: "How have you typically handled difficult conversations in the past?", opts: ["I hint at things and hope they get it", "I'm direct but sometimes come across as blunt", "I wait for the perfect moment that rarely comes", "I soften the message so much it gets lost"] },
      { q: "What's your biggest concern about this specific conversation?", opts: ["They'll get defensive or upset", "It won't actually change anything", "It'll damage our working relationship", "I'll lose my train of thought under pressure"] },
    ],
    context: {
      otherPartyLabel: "Who do you need to give feedback to?",
      otherPartyPlaceholder: "e.g. A junior developer on my team, my direct report Alex…",
      situationLabel: "What happened and why does feedback need to happen?",
      situationPlaceholder: "e.g. They've been missing sprint deadlines without flagging blockers. I've mentioned it once informally but the pattern continues…",
    },
    diffGuide: {
      receptive: "The other party is open and willing to hear feedback. They may ask a clarifying question but are not defensive.",
      realistic: "The other party listens but shows some natural hesitation. On turn 2, introduce ONE moment of mild defensiveness or deflection.",
      challenging: "The other party is defensive from the start. On turn 2, they redirect blame or get visibly uncomfortable. The learner must navigate carefully.",
    },
    fallback: { strong: "Shows awareness that feedback needs to be specific and timely", misconception: "May focus on the behaviour without linking it to a concrete impact", gap: "Limited familiarity with the SBI model as a structuring tool" },
  },

  coaching: {
    id: "coaching",
    label: "Coaching Conversations",
    emoji: "🎯",
    tagline: "Guide others to their own answers — don't just give them yours",
    headline: ["Coach in a way that", "builds capability"],
    introCopy: "Describe a real coaching opportunity. Practice the shift from telling to asking — using the GROW model to unlock thinking rather than hand out answers.",
    contract: {
      topic: "Coaching Conversations in the Workplace",
      objectives: [
        "Ask powerful questions that help the other person think, rather than providing answers directly",
        "Apply the GROW model (Goal, Reality, Options, Will) to structure the coaching conversation",
        "Resist the urge to fix, advise, or take over — hold the space for the other person's thinking",
      ],
      outOfScope: ["Formal performance management or disciplinary processes", "Therapy or personal counselling", "Technical training or skills instruction"],
    },
    warmup: [
      { q: "When you coach someone, what's your biggest temptation?", opts: ["Jumping in with the answer before they've thought it through", "Asking questions but steering them toward my preferred solution", "Staying silent when they struggle, even when I could help", "Making it too comfortable — not challenging their thinking enough"] },
      { q: "How do you typically respond when someone on your team is stuck?", opts: ["I tell them what I'd do in their position", "I ask questions, but they're often quite leading", "I give them space but check in frequently", "I try to coach, but it often turns into advice-giving"] },
      { q: "What concerns you most about this coaching conversation?", opts: ["They expect me to give them the answer — they might be frustrated", "I don't know enough about their situation to ask the right questions", "It'll take longer than just telling them what to do", "They might resist exploring options and just want direction"] },
    ],
    context: {
      otherPartyLabel: "Who are you coaching?",
      otherPartyPlaceholder: "e.g. A mid-level designer on my team, my direct report Jordan…",
      situationLabel: "What challenge or goal do they need coaching on?",
      situationPlaceholder: "e.g. Jordan is struggling to prioritise their workload and keeps missing self-imposed deadlines. They seem overwhelmed but resist asking for help…",
    },
    diffGuide: {
      receptive: "The other person is motivated and open to exploring. They engage thoughtfully with your questions.",
      realistic: "They engage but on turn 2 they get stuck — expecting you to give them the answer rather than help them find it.",
      challenging: "They're resistant from the start, deflecting questions or saying 'I don't know' frequently. You must work hard to unlock their thinking.",
    },
    fallback: { strong: "Shows awareness that coaching is about questions, not answers", misconception: "May conflate coaching with mentoring or advice-giving", gap: "Limited familiarity with the GROW model as a structuring tool" },
  },

  difficult: {
    id: "difficult",
    label: "Difficult Conversations",
    emoji: "⚡",
    tagline: "Navigate conflict and tension without damaging the relationship",
    headline: ["Have the conversation", "you've been avoiding"],
    introCopy: "Describe a real situation where tension exists or a conversation feels stuck. Practice separating facts from feelings, staying non-defensive, and finding a way forward.",
    contract: {
      topic: "Navigating Difficult Workplace Conversations",
      objectives: [
        "Separate observable facts from interpretations, emotions, and assumptions",
        "Use non-defensive language that keeps the conversation open rather than escalating it",
        "Find shared ground and a concrete path forward, even when positions feel opposed",
      ],
      outOfScope: ["Legal disputes or formal grievance procedures", "Conversations requiring HR or management escalation", "Personal or romantic relationship conflict"],
    },
    warmup: [
      { q: "When a workplace conversation starts to feel tense, what's your instinct?", opts: ["Smooth it over and avoid the real issue", "Get defensive and explain my position", "Go quiet and disengage until it passes", "Push harder — someone needs to resolve this"] },
      { q: "What makes this particular conversation feel difficult?", opts: ["There's a history of tension that makes it loaded", "I'm not sure how to say what I mean without sounding like an attack", "I'm worried they'll shut down or escalate", "I know I have some responsibility here too, which complicates it"] },
      { q: "When you imagine the conversation going badly, what does that look like?", opts: ["It turns into an argument with no resolution", "They get hurt or upset and withdraw", "Nothing changes — we just agree to disagree", "I say something I regret and damage the relationship"] },
    ],
    context: {
      otherPartyLabel: "Who is this conversation with?",
      otherPartyPlaceholder: "e.g. A peer who keeps overstepping into my work, a colleague named Sam…",
      situationLabel: "What's the tension or conflict that needs to be addressed?",
      situationPlaceholder: "e.g. Sam has been taking credit for shared work in team meetings. I've let it go twice but it happened again last week…",
    },
    diffGuide: {
      receptive: "The other person is willing to talk and hear your perspective, even if the topic is sensitive.",
      realistic: "They engage, but on turn 2 they get a bit defensive or start justifying their behaviour.",
      challenging: "They're immediately defensive, deny the issue, or try to redirect blame back to you. You must stay grounded.",
    },
    fallback: { strong: "Shows awareness that tone and framing matter in tense conversations", misconception: "May conflate being honest with being blunt — without managing the emotional impact", gap: "Limited practice separating facts from interpretations in the moment" },
  },

  negotiation: {
    id: "negotiation",
    label: "Negotiating at Work",
    emoji: "🤝",
    tagline: "Find outcomes that work for both sides — not just yours",
    headline: ["Negotiate for what", "you actually need"],
    introCopy: "Describe a real negotiation you're facing — a resource request, scope discussion, or timeline pushback. Practice finding mutual gain rather than fighting over positions.",
    contract: {
      topic: "Negotiating Outcomes in the Workplace",
      objectives: [
        "Distinguish positions (what people say they want) from interests (why they want it)",
        "Use collaborative framing to explore options rather than defend fixed positions",
        "Know your BATNA (Best Alternative to a Negotiated Agreement) and use it to negotiate with confidence",
      ],
      outOfScope: ["Salary or compensation negotiation (requires HR context)", "Legal contracts or formal agreements", "Negotiation outside a workplace context"],
    },
    warmup: [
      { q: "When you enter a negotiation at work, what's your default mode?", opts: ["I state what I need and hope they agree", "I try to find middle ground as quickly as possible", "I hold firm until I get what I asked for", "I give more than I should to keep the relationship smooth"] },
      { q: "What makes this particular negotiation feel tricky?", opts: ["The other side has more power than I do", "I'm not sure what I'd do if they say no", "I need to maintain the relationship, so pushing feels risky", "I don't fully know what the other side actually needs"] },
      { q: "What outcome would you consider a success?", opts: ["Getting exactly what I asked for", "Both sides feeling the deal was fair", "A partial win — something is better than nothing", "Preserving the relationship, even if I concede more than I wanted"] },
    ],
    context: {
      otherPartyLabel: "Who are you negotiating with?",
      otherPartyPlaceholder: "e.g. A project stakeholder, my manager, a vendor contact named Priya…",
      situationLabel: "What are you negotiating for, and what's at stake?",
      situationPlaceholder: "e.g. I need to push back on a project deadline my manager set. The current timeline means my team would need to work weekends and the quality will suffer…",
    },
    diffGuide: {
      receptive: "The other party is open to discussion and willing to explore options with you.",
      realistic: "They listen, but on turn 2 they push back on your position or reveal a constraint you weren't aware of.",
      challenging: "They open with a firm position and seem unwilling to budge. You must find a way to surface shared interests without capitulating.",
    },
    fallback: { strong: "Understands that negotiation is about problem-solving, not just asserting a position", misconception: "May focus on compromising positions rather than exploring underlying interests", gap: "Limited practice articulating a clear BATNA or using it to negotiate with confidence" },
  },

  delivery: {
    id: "delivery",
    label: "Delivering Bad News",
    emoji: "📋",
    tagline: "Be honest and humane when the message is hard",
    headline: ["Deliver hard news", "with care and clarity"],
    introCopy: "Describe a real situation where you need to deliver unwelcome information. Practice being direct without being brutal — acknowledging the impact and providing a clear path forward.",
    contract: {
      topic: "Delivering Difficult News in the Workplace",
      objectives: [
        "Deliver the news directly and early — without burying it in preamble or softening it beyond recognition",
        "Acknowledge the emotional impact of the news before moving to solutions or next steps",
        "Provide a clear, honest path forward that respects the other person's agency",
      ],
      outOfScope: ["Terminations or formal dismissal processes (requires HR)", "Medical or personal crisis situations", "News that requires legal counsel before disclosure"],
    },
    warmup: [
      { q: "When you need to deliver bad news, what's your instinct?", opts: ["Soften it so much that the real message gets lost", "Get straight to the point — the quicker the better", "Build up to it slowly with a lot of context first", "Delay it until I absolutely can't avoid it"] },
      { q: "What concerns you most about this specific conversation?", opts: ["They'll be upset and I won't know how to respond", "They'll ask questions I don't have answers to", "I'll seem cold or uncaring if I'm too direct", "The news might affect our working relationship going forward"] },
      { q: "How do you usually handle someone's emotional reaction to difficult news?", opts: ["I try to reassure them quickly and move to solutions", "I acknowledge their feelings but feel uncomfortable with strong emotion", "I give them space and let the silence sit", "I over-explain or justify to fill the gap"] },
    ],
    context: {
      otherPartyLabel: "Who are you delivering the news to?",
      otherPartyPlaceholder: "e.g. A team member whose project is being cancelled, my direct report Casey…",
      situationLabel: "What is the difficult news, and why does it need to be delivered?",
      situationPlaceholder: "e.g. Casey's proposal for a new product line has been rejected by leadership. They worked on it for three months and were very invested in it…",
    },
    diffGuide: {
      receptive: "The other person is initially shocked but remains composed and willing to hear more.",
      realistic: "They react emotionally on turn 2 — upset, disappointed, or asking difficult questions you need to navigate.",
      challenging: "They react strongly from the start — disbelief, anger, or shutting down. You must stay present and human.",
    },
    fallback: { strong: "Shows awareness that clarity and empathy both matter when delivering hard messages", misconception: "May believe that softening the news is kinder — when it actually creates confusion", gap: "Limited practice acknowledging emotional impact before pivoting to solutions" },
  },
};

// ── System prompts ────────────────────────────────────────────────────────────
function buildSys(mode, ctx, warmupAnswers, warmupConfig, profile, difficulty, contract, diffGuide) {
  const base = `CURRICULUM CONTRACT — FIXED, NEVER DEVIATE:
Topic: ${contract.topic}
Objectives:
${contract.objectives.map((o, i) => `${i + 1}. ${o}`).join("\n")}
Out of scope: ${contract.outOfScope.join(", ")}
GUARDRAIL: Before generating, confirm which objective each sentence serves. Omit anything that cannot be tagged to an objective.`;

  const ctxBlock = ctx ? `\nLEARNER CONTEXT:\nRole: ${ctx.role}\nSituation: ${ctx.situation}\nOther party: ${ctx.otherParty}` : "";

  const warmupBlock = warmupAnswers?.length
    ? `\nWARM-UP SELF-ASSESSMENT:\n${warmupConfig.map((w, i) => `- ${w.q}\n  → ${w.opts[warmupAnswers[i]]}`).join("\n")}`
    : "";

  if (mode === "diagnostic")
    return `${base}${ctxBlock}${warmupBlock}\n\nYou are running a pre-module diagnostic. The learner has shared their real situation and warm-up self-assessment above. Generate ONE open-ended conversational question (under 35 words) that probes their current thinking about their situation — drawing from the warm-up signals to go deeper. Feel like a thoughtful colleague, not a quiz. Respond with the question text only, no preamble.`;

  if (mode === "profile")
    return `${base}${ctxBlock}${warmupBlock}\n\nAnalyse the learner's diagnostic responses together with their warm-up self-assessment. Build a specific, personal profile. Return ONLY valid JSON, no markdown:\n{"strong":"what they clearly understand, referencing their context","misconception":"one specific misconception surfaced by their responses and warm-up","gap":"one skill gap most relevant to their real situation","scenario":"Open the scene mid-moment — the learner is already in the room with ${ctx?.otherParty || 'the other party'}. Write 2 sentences of vivid scene-setting (where they are, what the atmosphere is like), then have ${ctx?.otherParty || 'the other party'} say something that opens the conversation — a question, a greeting, or a remark that makes it real. End with: 'What do you say?' Never describe what is about to happen. The learner must feel they are already there.","otherPartyName":"first name or role title of the other party"}`;

  const dg = diffGuide?.[difficulty || "realistic"] || "The other party listens but may show some hesitation. On turn 2, introduce a moment of mild pushback.";

  if (mode === "scenario")
    return `${base}${ctxBlock}\n\nLearner profile: ${JSON.stringify(profile)}\nDifficulty: ${difficulty} — ${dg}\n\nYou are roleplaying as ${profile?.otherPartyName || "the other party"}. Stay in character. Keep it human and specific, never theatrical.\n\nCRITICAL SCENE RULE: Write from inside the conversation, never outside it. Never use narrator framing. The consequence is what ${profile?.otherPartyName || "they"} actually says or does right now in direct response to the learner. Always close the next field with: What do you say?\n\nInclude a one-sentence coaching nudge — a brief aside to the learner (not in character) about what to sharpen, tied to one of the learning objectives.\n\nReturn ONLY valid JSON, no markdown:\n{"consequence":"1-2 sentences — what ${profile?.otherPartyName || 'they'} says or does in direct reaction","next":"1 sentence of what shifts in the room, then ${profile?.otherPartyName || 'they'} says or does something specific. Close with: What do you say?","nudge":"one coaching sentence for the learner","done":false}\n\nOn turn 3 set done:true.`;

  if (mode === "debrief")
    return `${base}${ctxBlock}\n\nLearner profile: ${JSON.stringify(profile)}\n\nEvaluate performance against each objective. Be honest and specific. Reference their real situation. Identify their weakest turn by index (0, 1, or 2) and rewrite that response using the framework appropriate to this module.\n\nReturn ONLY valid JSON, no markdown:\n{"scores":[{"obj":"full objective text","score":0-100,"fb":"1–2 sentence personalised feedback"},{"obj":"...","score":0-100,"fb":"..."},{"obj":"...","score":0-100,"fb":"..."}],"overall":0-100,"monday":"2–3 sentences of concrete advice for their real conversation — specific and actionable","weakestTurnIndex":0,"rewrite":"What you said: [quote their actual weakest response]. A stronger version: [rewrite it using the module's framework]"}`;

  if (mode === "retry")
    return `${base}${ctxBlock}\n\nLearner profile: ${JSON.stringify(profile)}\nDifficulty: ${difficulty}\n\nThe learner is retrying a turn they struggled with. Respond as ${profile?.otherPartyName || "the other party"} would to this new attempt. Be fair — reward genuine improvement with a more positive reaction.\n\nReturn ONLY valid JSON, no markdown:\n{"consequence":"1–2 sentences — how ${profile?.otherPartyName || "they"} reacts to the new attempt","improvement":"1–2 sentences comparing this attempt to the original — what specifically got better"}`;
}

async function callClaude(messages, mode, ctx, warmupAnswers, warmupConfig, profile, difficulty, contract, diffGuide) {
  const res = await fetch("https://bdc-api.nicholasmcgowan07.workers.dev", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      system: buildSys(mode, ctx, warmupAnswers, warmupConfig, profile, difficulty, contract, diffGuide),
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
}

function parseJSON(raw) {
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { return null; }
}

// ── BDC Brand Tokens ──────────────────────────────────────────────────────────
const BDC_RED    = "#E8192C";
const BDC_NAVY   = "#1A2B4A";
const BDC_RED_L  = "#FDE8EA";
const BDC_GRAY   = "#F4F5F7";
const BDC_BORDER = "#DDE1E7";
const IND        = BDC_RED;
const IND_L      = BDC_RED_L;

const t = {
  wrap: { fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", maxWidth: 700, margin: "0 auto", padding: "2rem 1.25rem", color: BDC_NAVY, background: "#fff" },
  card: { background: "#fff", border: `1px solid ${BDC_BORDER}`, borderRadius: 12, padding: "1.5rem", marginBottom: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  label: { fontSize: 13, fontWeight: 600, color: BDC_NAVY, marginBottom: "0.5rem", display: "block" },
  input: { width: "100%", border: `1.5px solid ${BDC_BORDER}`, borderRadius: 50, padding: "0.7rem 1.25rem", fontFamily: "inherit", fontSize: 14, color: BDC_NAVY, background: "#fff", outline: "none", lineHeight: 1.5, boxSizing: "border-box", transition: "border-color 0.2s" },
  ta: { width: "100%", border: `1.5px solid ${BDC_BORDER}`, borderRadius: 12, padding: "0.85rem 1.1rem", fontFamily: "inherit", fontSize: 14, color: BDC_NAVY, background: "#fff", resize: "none", lineHeight: 1.6, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
  btnP: (dis) => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "0.65rem 1.5rem", borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: dis ? "default" : "pointer", border: "none", background: BDC_RED, color: "#fff", fontFamily: "inherit", opacity: dis ? 0.4 : 1, letterSpacing: "0.01em" }),
  btnG: { display: "inline-flex", alignItems: "center", gap: 6, padding: "0.65rem 1.5rem", borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: "pointer", background: "#fff", color: BDC_NAVY, border: `1.5px solid ${BDC_NAVY}`, fontFamily: "inherit" },
  tag: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: BDC_RED, background: BDC_RED_L, padding: "4px 12px", borderRadius: 50, marginBottom: "0.75rem" },
  sec: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "#8A96A3", marginBottom: "0.875rem" },
  objRow: { display: "flex", gap: 10, alignItems: "flex-start", marginBottom: "0.6rem", fontSize: 14, color: BDC_NAVY, lineHeight: 1.55 },
  objBadge: { width: 22, height: 22, borderRadius: "50%", background: BDC_RED, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  situation: { fontSize: 14, lineHeight: 1.75, color: "#3D4F63", padding: "1rem 1.25rem", background: BDC_GRAY, borderRadius: 10, borderLeft: `3px solid ${BDC_RED}`, marginBottom: "1rem" },
  consequence: { fontSize: 14, lineHeight: 1.75, padding: "1rem 1.25rem", background: BDC_GRAY, border: `1px solid ${BDC_BORDER}`, borderRadius: 10, marginBottom: "0.75rem" },
  learnerAction: { fontSize: 13, color: BDC_NAVY, padding: "0.5rem 1rem", background: BDC_RED_L, borderRadius: 8, marginBottom: "0.5rem", borderLeft: `2px solid ${BDC_RED}` },
  nudge: { fontSize: 13, color: "#085041", background: "#E6F6F1", border: "1px solid #A8DDC9", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "flex-start", gap: 8 },
  disclaimer: { fontSize: 12, color: "#6B7A8D", lineHeight: 1.65, padding: "0.75rem 1.1rem", background: BDC_GRAY, borderRadius: 10, border: `1px solid ${BDC_BORDER}`, marginBottom: "1rem" },
  errBox: { background: BDC_RED_L, border: `1px solid ${BDC_RED}`, borderRadius: 10, padding: "1rem 1.25rem", fontSize: 13, color: "#7A0010", marginBottom: "1rem" },
  mondayBox: { background: "#E6F6F1", border: "1px solid #A8DDC9", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1rem" },
  rewriteBox: { background: "#FEF7E7", border: "1px solid #F5C842", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1rem" },
  contract: { borderLeft: `3px solid ${BDC_RED}`, borderRadius: "0 12px 12px 0", padding: "1rem 1.25rem", marginBottom: "1.5rem", background: "#fff", border: `1px solid ${BDC_BORDER}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  phaseBar: { display: "flex", borderRadius: 50, overflow: "hidden", border: `1.5px solid ${BDC_BORDER}`, marginBottom: "2rem", background: BDC_GRAY },
  phaseStep: (active, done) => ({ flex: 1, padding: "0.5rem 0", textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", borderRight: `1px solid ${BDC_BORDER}`, background: active ? BDC_RED : done ? "#D4EFE5" : "transparent", color: active ? "#fff" : done ? "#0A6647" : "#8A96A3", transition: "all 0.25s" }),
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

const PHASES = ["Context", "Warm-up", "Diagnostic", "Scenario", "Debrief"];

function PhaseBar({ phase }) {
  const map = { context: 0, warmup: 1, diagnostic: 2, "profile-review": 2, difficulty: 2, scenario: 3, debrief: 4, retry: 4 };
  const idx = map[phase] ?? 0;
  return (
    <div style={t.phaseBar}>
      {PHASES.map((p, i) => (
        <div key={p} style={{ ...t.phaseStep(i === idx, i < idx), ...(i === PHASES.length - 1 ? { borderRight: "none" } : {}) }}>{p}</div>
      ))}
    </div>
  );
}

function ContractPanel({ contract }) {
  return (
    <div style={t.contract}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.6 }}>
          <rect x="2.5" y="6" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <circle cx="7" cy="9.5" r="1" fill="currentColor" />
        </svg>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: IND }}>Curriculum contract — fixed</span>
      </div>
      {contract.objectives.map((o, i) => (
        <div key={i} style={t.objRow}><div style={t.objBadge}>{i + 1}</div><span>{o}</span></div>
      ))}
    </div>
  );
}

// ── Module type picker (compact rows) ────────────────────────────────────────
function ModulePicker({ value, onChange }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#8A96A3", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
        Choose your conversation type
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {Object.values(MODULES).map((mod) => {
          const active = value === mod.id;
          return (
            <div
              key={mod.id}
              onClick={() => onChange(mod.id)}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.55rem 0.9rem",
                borderRadius: 8,
                border: `1.5px solid ${active ? BDC_RED : BDC_BORDER}`,
                background: active ? BDC_RED_L : "#fff",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = BDC_RED; e.currentTarget.style.background = "#FFF5F6"; }}}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = BDC_BORDER; e.currentTarget.style.background = "#fff"; }}}
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>{mod.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: active ? BDC_RED : BDC_NAVY, minWidth: 160 }}>{mod.label}</span>
              <span style={{ fontSize: 12, color: "#6B7A8D", lineHeight: 1.3 }}>{mod.tagline}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Under the Hood panel ──────────────────────────────────────────────────────
function UnderTheHood({ mod }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("pipeline");

  const HOOD_BG   = "#0F1117";
  const HOOD_CARD = "#1A1D27";
  const HOOD_BORD = "#2A2D3A";
  const GREEN     = "#4ADE80";
  const AMBER     = "#FACC15";
  const BLUE      = "#60A5FA";
  const PINK      = "#F472B6";
  const PURPLE    = "#A78BFA";

  const mono = { fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace" };

  const tabs = ["pipeline", "contract", "prompts", "warmup"];
  const tabLabel = { pipeline: "Pipeline", contract: "Contract", prompts: "Prompts", warmup: "Warm-up" };

  const pipeline = [
    { id: "1", label: "Module selected", color: BLUE, desc: "User picks a conversation type. The MODULES config object swaps in the correct contract, warmup questions, context labels, difficulty guides, and fallback profile text." },
    { id: "2", label: "Context capture", color: BLUE, desc: "Learner's role, situation, and other party name are collected. These 3 fields are injected into every subsequent API call as the LEARNER CONTEXT block." },
    { id: "3", label: "Warm-up", color: AMBER, desc: "3 pre-defined multiple-choice questions (no API call). Answers are stored as indices and later expanded into human-readable text for the warm-up block in system prompts." },
    { id: "4", label: "Diagnostic ×3", color: AMBER, desc: "3 sequential API calls in 'diagnostic' mode. Each call includes prior Q&A history so questions build on each other. The model is instructed to cover different objectives each turn." },
    { id: "5", label: "Profile build", color: PINK, desc: "Single API call in 'profile' mode. All 3 diagnostic Q&As + warm-up answers are sent. Model returns JSON: strong / misconception / gap / scenario / otherPartyName." },
    { id: "6", label: "Scenario ×3", color: GREEN, desc: "Up to 3 API calls in 'scenario' mode. Full conversation history is replayed each turn. Model roleplays as the other party and returns: consequence / next / nudge / done." },
    { id: "7", label: "Debrief", color: GREEN, desc: "Single API call in 'debrief' mode. Full scenario history sent. Model scores against each objective (0–100), identifies weakest turn, rewrites it, and gives Monday advice." },
    { id: "8", label: "Retry (optional)", color: PURPLE, desc: "Single API call in 'retry' mode. Sends only the weakest turn context + new attempt. Model responds in character and assesses what specifically improved." },
  ];

  const systemPromptSections = [
    {
      label: "BASE (all modes)",
      color: BLUE,
      content: `CURRICULUM CONTRACT — FIXED, NEVER DEVIATE:
Topic: ${mod.contract.topic}
Objectives:
${mod.contract.objectives.map((o, i) => `${i + 1}. ${o}`).join("\n")}
Out of scope: ${mod.contract.outOfScope.join(", ")}
GUARDRAIL: Before generating, confirm which objective each sentence serves. Omit anything that cannot be tagged to an objective.`
    },
    {
      label: "LEARNER CONTEXT block (injected after base)",
      color: AMBER,
      content: `LEARNER CONTEXT:
Role: [their role]
Situation: [what they described]
Other party: [who they need to speak with]`
    },
    {
      label: "WARM-UP block (injected after context)",
      color: PINK,
      content: `WARM-UP SELF-ASSESSMENT:
- ${mod.warmup[0].q}
  → [selected answer]
- ${mod.warmup[1].q}
  → [selected answer]
- ${mod.warmup[2].q}
  → [selected answer]`
    },
    {
      label: "DIAGNOSTIC mode instruction",
      color: GREEN,
      content: `You are running a pre-module diagnostic. The learner has shared their real situation and warm-up self-assessment above. Generate ONE open-ended conversational question (under 35 words) that probes their current thinking about their situation — drawing from the warm-up signals to go deeper. Feel like a thoughtful colleague, not a quiz. Respond with the question text only, no preamble.`
    },
    {
      label: "PROFILE mode instruction",
      color: GREEN,
      content: `Analyse the learner's diagnostic responses together with their warm-up self-assessment. Build a specific, personal profile. Return ONLY valid JSON, no markdown:
{"strong":"...","misconception":"...","gap":"...","scenario":"Open the scene mid-moment — the learner is already in the room...","otherPartyName":"..."}`
    },
    {
      label: "SCENARIO mode instruction",
      color: PURPLE,
      content: `Difficulty: [receptive|realistic|challenging] — [difficulty guide text]

You are roleplaying as [otherPartyName]. Stay in character. Keep it human and specific, never theatrical.

CRITICAL SCENE RULE: Write from inside the conversation, never outside it. Never use narrator framing. Always close the next field with: What do you say?

Include a one-sentence coaching nudge tied to one of the learning objectives.

Return ONLY valid JSON:
{"consequence":"...","next":"...","nudge":"...","done":false}`
    },
    {
      label: "DEBRIEF mode instruction",
      color: AMBER,
      content: `Evaluate performance against each objective. Be honest and specific. Reference their real situation. Identify their weakest turn by index (0, 1, or 2).

Return ONLY valid JSON:
{"scores":[{"obj":"...","score":0-100,"fb":"..."}],"overall":0-100,"monday":"...","weakestTurnIndex":0,"rewrite":"What you said: [...]. A stronger version: [...]"}`
    },
  ];

  return (
    <div style={{ marginBottom: "1.5rem", borderRadius: 10, overflow: "hidden", border: `1px solid ${open ? HOOD_BORD : BDC_BORDER}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.7rem 1rem", background: open ? HOOD_BG : BDC_GRAY, border: "none", cursor: "pointer", fontFamily: "inherit" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, ...mono, color: open ? GREEN : "#6B7A8D" }}>{"</>"}</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: open ? GREEN : "#6B7A8D" }}>Under the Hood</span>
          <span style={{ fontSize: 11, color: open ? "#4A5568" : "#9AA5B4", background: open ? "#1A1D27" : BDC_BORDER, padding: "2px 8px", borderRadius: 4, ...mono }}>
            {mod.label}
          </span>
        </div>
        <span style={{ fontSize: 16, color: open ? GREEN : "#8A96A3", transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "none" }}>⌄</span>
      </button>

      {open && (
        <div style={{ background: HOOD_BG, padding: "0 1rem 1rem" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem", paddingTop: "0.75rem", borderBottom: `1px solid ${HOOD_BORD}`, paddingBottom: "0.5rem" }}>
            {tabs.map(tb => (
              <button key={tb} onClick={() => setTab(tb)} style={{ padding: "0.3rem 0.75rem", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, background: tab === tb ? BDC_RED : HOOD_CARD, color: tab === tb ? "#fff" : "#6B7A8D", transition: "all 0.15s" }}>
                {tabLabel[tb]}
              </button>
            ))}
          </div>

          {/* Pipeline tab */}
          {tab === "pipeline" && (
            <div>
              <div style={{ fontSize: 11, color: "#4A5568", ...mono, marginBottom: "0.75rem" }}>// 8-step AI pipeline — how each conversation flows</div>
              {pipeline.map((step, i) => (
                <div key={step.id} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.6rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: step.color + "22", border: `1.5px solid ${step.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: step.color, ...mono }}>{step.id}</div>
                    {i < pipeline.length - 1 && <div style={{ width: 1, flex: 1, background: HOOD_BORD, margin: "3px 0" }} />}
                  </div>
                  <div style={{ paddingBottom: "0.5rem" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: step.color, marginBottom: 2, ...mono }}>{step.label}</div>
                    <div style={{ fontSize: 12, color: "#8A96A3", lineHeight: 1.55 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contract tab */}
          {tab === "contract" && (
            <div>
              <div style={{ fontSize: 11, color: "#4A5568", ...mono, marginBottom: "0.75rem" }}>// Curriculum contract — injected into every API call, cannot be overridden by the scenario</div>
              <div style={{ background: HOOD_CARD, border: `1px solid ${HOOD_BORD}`, borderRadius: 8, padding: "1rem", marginBottom: "0.75rem" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: BLUE, marginBottom: "0.5rem" }}>Topic</div>
                <div style={{ fontSize: 13, color: "#E2E8F0", ...mono }}>{mod.contract.topic}</div>
              </div>
              <div style={{ background: HOOD_CARD, border: `1px solid ${HOOD_BORD}`, borderRadius: 8, padding: "1rem", marginBottom: "0.75rem" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: GREEN, marginBottom: "0.5rem" }}>Learning Objectives</div>
                {mod.contract.objectives.map((o, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: "0.4rem", fontSize: 12, color: "#CBD5E1", lineHeight: 1.5 }}>
                    <span style={{ color: GREEN, ...mono, flexShrink: 0 }}>{i + 1}.</span><span>{o}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: HOOD_CARD, border: `1px solid ${HOOD_BORD}`, borderRadius: 8, padding: "1rem", marginBottom: "0.75rem" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: AMBER, marginBottom: "0.5rem" }}>Out of Scope</div>
                {mod.contract.outOfScope.map((o, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#CBD5E1", marginBottom: "0.3rem" }}>— {o}</div>
                ))}
              </div>
              <div style={{ background: HOOD_CARD, border: `1px solid ${HOOD_BORD}`, borderRadius: 8, padding: "1rem" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: PURPLE, marginBottom: "0.5rem" }}>Difficulty Guides</div>
                {["receptive", "realistic", "challenging"].map(d => (
                  <div key={d} style={{ marginBottom: "0.6rem" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: PURPLE, ...mono }}>{d}: </span>
                    <span style={{ fontSize: 12, color: "#94A3B8" }}>{mod.diffGuide[d]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompts tab */}
          {tab === "prompts" && (
            <div>
              <div style={{ fontSize: 11, color: "#4A5568", ...mono, marginBottom: "0.75rem" }}>// System prompts sent to claude-haiku — assembled dynamically per mode</div>
              {systemPromptSections.map((sec, i) => (
                <div key={i} style={{ background: HOOD_CARD, border: `1px solid ${HOOD_BORD}`, borderRadius: 8, padding: "0.875rem 1rem", marginBottom: "0.6rem" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: sec.color, marginBottom: "0.6rem" }}>{sec.label}</div>
                  <pre style={{ margin: 0, fontSize: 11.5, color: "#94A3B8", lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word", ...mono }}>{sec.content}</pre>
                </div>
              ))}
            </div>
          )}

          {/* Warmup tab */}
          {tab === "warmup" && (
            <div>
              <div style={{ fontSize: 11, color: "#4A5568", ...mono, marginBottom: "0.75rem" }}>// Pre-defined warm-up questions — no API call, answers feed into diagnostic + profile prompts</div>
              {mod.warmup.map((w, i) => (
                <div key={i} style={{ background: HOOD_CARD, border: `1px solid ${HOOD_BORD}`, borderRadius: 8, padding: "0.875rem 1rem", marginBottom: "0.6rem" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: AMBER, marginBottom: "0.5rem" }}>Q{i + 1}</div>
                  <div style={{ fontSize: 13, color: "#E2E8F0", marginBottom: "0.6rem", lineHeight: 1.5 }}>{w.q}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    {w.opts.map((opt, j) => (
                      <div key={j} style={{ fontSize: 11.5, color: "#64748B", ...mono, padding: "0.3rem 0.6rem", background: "#0F1117", borderRadius: 4 }}>
                        [{j}] {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ConversationSimPage() {
  const [moduleKey, setModuleKey] = useState("feedback");
  const [phase, setPhase] = useState("intro");
  const [ctx, setCtx] = useState({ role: "", situation: "", otherParty: "" });
  const [warmupStep, setWarmupStep] = useState(0);
  const [warmupAnswers, setWarmupAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [profile, setProfile] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [difficulty, setDifficulty] = useState("realistic");
  const [turn, setTurn] = useState(0);
  const [history, setHistory] = useState([]);
  const [situation, setSituation] = useState(null);
  const [currentAction, setCurrentAction] = useState("");
  const [debrief, setDebrief] = useState(null);
  const [retryAction, setRetryAction] = useState("");
  const [retryResult, setRetryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Active module shortcut
  const mod = MODULES[moduleKey];

  const reset = () => {
    setPhase("intro"); setCtx({ role: "", situation: "", otherParty: "" });
    setWarmupStep(0); setWarmupAnswers([]); setQuestions([]); setAnswers([]);
    setCurrentAnswer(""); setProfile(null); setEditingField(null); setEditValue("");
    setDifficulty("realistic"); setTurn(0); setHistory([]); setSituation(null);
    setCurrentAction(""); setDebrief(null); setRetryAction(""); setRetryResult(null);
    setLoading(false); setError(null);
  };

  const ctxReady = ctx.role.trim().length > 2 && ctx.situation.trim().length > 10 && ctx.otherParty.trim().length > 1;

  // Helper: call Claude with active module's config threaded through
  const claude = (messages, mode, profile, difficulty) =>
    callClaude(messages, mode, ctx, warmupAnswers, mod.warmup, profile, difficulty, mod.contract, mod.diffGuide);

  // ── Warm-up ──
  const pickWarmup = (optIdx) => {
    const newAnswers = [...warmupAnswers, optIdx];
    setWarmupAnswers(newAnswers);
    if (warmupStep < mod.warmup.length - 1) {
      setWarmupStep(warmupStep + 1);
    } else {
      setPhase("diagnostic"); setLoading(true);
      loadQuestion([], [], ctx, newAnswers);
    }
  };

  // ── Diagnostic ──
  const loadQuestion = useCallback(async (prevQs, prevAs, context, wu) => {
    try {
      const prev = prevQs.flatMap((q, i) =>
        [{ role: "assistant", content: q }, { role: "user", content: prevAs[i] || "" }]
      ).filter((m) => m.content);
      const n = prevAs.length + 1;
      const msgs = [...prev, { role: "user", content: `Generate diagnostic question ${n} of 3.${n > 1 ? " Cover a different objective and don't repeat themes." : ""}` }];
      const q = await callClaude(msgs, "diagnostic", context, wu, mod.warmup, null, null, mod.contract, mod.diffGuide);
      setQuestions((qs) => [...qs, q]);
      setLoading(false);
    } catch (e) { setError(e.message); setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleKey]);

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    const newAnswers = [...answers, currentAnswer.trim()];
    setAnswers(newAnswers); setCurrentAnswer("");
    if (newAnswers.length >= 3) {
      setLoading(true);
      try {
        const msgs = questions.flatMap((q, i) => [{ role: "assistant", content: q }, { role: "user", content: newAnswers[i] }]);
        msgs.push({ role: "user", content: "Build the learner profile JSON now." });
        const raw = await callClaude(msgs, "profile", ctx, warmupAnswers, mod.warmup, null, null, mod.contract, mod.diffGuide);
        const p = parseJSON(raw) || {
          strong: mod.fallback.strong,
          misconception: mod.fallback.misconception,
          gap: mod.fallback.gap,
          scenario: `You're about to speak with ${ctx.otherParty} about: ${ctx.situation}. You've found a quiet moment — they've just sat down.`,
          otherPartyName: ctx.otherParty.split(" ")[0] || "them",
        };
        setProfile(p); setLoading(false); setPhase("profile-review");
      } catch (e) { setError(e.message); setLoading(false); }
    } else {
      setLoading(true);
      await loadQuestion([...questions], newAnswers, ctx, warmupAnswers);
    }
  };

  // ── Profile edit ──
  const startEdit = (field, value) => { setEditingField(field); setEditValue(value); };
  const saveEdit = () => {
    if (editingField) setProfile((p) => ({ ...p, [editingField]: editValue }));
    setEditingField(null); setEditValue("");
  };

  // ── Scenario ──
  const startScenario = () => {
    setSituation(profile.scenario); setTurn(0); setHistory([]); setPhase("scenario");
  };

  const submitTurn = async () => {
    if (!currentAction.trim()) return;
    const action = currentAction.trim();
    setCurrentAction(""); setLoading(true);
    try {
      const msgs = [
        { role: "user", content: `Scenario: ${profile.scenario}` },
        ...history.flatMap((h) => [
          { role: "user", content: `Situation: ${h.situation}\nLearner: ${h.action}` },
          { role: "assistant", content: JSON.stringify({ consequence: h.consequence, next: h.next }) },
        ]),
        { role: "user", content: `Turn ${turn + 1} of 3. Situation: ${situation}\nLearner: ${action}${turn >= 2 ? "\nFinal turn — set done:true." : ""}` },
      ];
      const raw = await claude(msgs, "scenario", profile, difficulty);
      const res = parseJSON(raw) || { consequence: "The conversation continues.", next: "How do you move it forward? What do you say?", nudge: "Try linking the behaviour to its specific impact.", done: turn >= 2 };
      const newHistory = [...history, { situation, action, consequence: res.consequence, next: res.next, nudge: res.nudge }];
      setHistory(newHistory);
      const newTurn = turn + 1;
      setTurn(newTurn); setLoading(false);
      if (res.done || newTurn >= 3) {
        setSituation(null); setPhase("debrief"); setLoading(true);
        try {
          const dMsgs = [
            { role: "user", content: `Profile: ${JSON.stringify(profile)}` },
            ...newHistory.flatMap((h) => [
              { role: "user", content: `Situation: ${h.situation}\nLearner: ${h.action}` },
              { role: "assistant", content: `Consequence: ${h.consequence}` },
            ]),
            { role: "user", content: "Generate the debrief JSON now." },
          ];
          const dRaw = await claude(dMsgs, "debrief", profile, difficulty);
          const d = parseJSON(dRaw) || {
            scores: mod.contract.objectives.map((o) => ({ obj: o, score: 60, fb: "Solid start — review the module framework before your real conversation." })),
            overall: 60, weakestTurnIndex: 0,
            monday: `Before speaking with ${profile?.otherPartyName}, write down the key points you want to make and the outcome you're aiming for. That structure will keep you focused.`,
            rewrite: `What you said: "${newHistory[0]?.action}". A stronger version: Apply the framework from this module — be specific, stay grounded, and connect your point to a clear outcome.`,
          };
          setDebrief(d); setLoading(false);
        } catch (e) { setError(e.message); setLoading(false); }
      } else {
        setSituation(res.next);
      }
    } catch (e) { setError(e.message); setLoading(false); }
  };

  // ── Retry ──
  const submitRetry = async () => {
    if (!retryAction.trim()) return;
    setLoading(true);
    try {
      const weakTurn = history[debrief.weakestTurnIndex];
      const msgs = [
        { role: "user", content: `Original situation: ${weakTurn.situation}\nOriginal learner response: ${weakTurn.action}\nNew learner response: ${retryAction.trim()}` },
      ];
      const raw = await claude(msgs, "retry", profile, difficulty);
      const res = parseJSON(raw) || { consequence: "A noticeably stronger response — the message landed more clearly.", improvement: "The new version was more specific and better structured." };
      setRetryResult(res); setLoading(false);
    } catch (e) { setError(e.message); setLoading(false); }
  };

  const currentQ = questions[answers.length];
  const weakTurn = debrief ? history[debrief.weakestTurnIndex] : null;

  return (
    <div style={t.wrap}>
      {phase !== "intro" && <PhaseBar phase={phase} />}
      {!["intro", "context", "warmup"].includes(phase) && <ContractPanel contract={mod.contract} />}

      {error && (
        <div style={t.errBox}>
          <strong style={{ display: "block", marginBottom: 4 }}>Error</strong>{error}
          <button style={{ ...t.btnG, padding: "2px 10px", fontSize: 12, marginLeft: 10 }} onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* ── Intro ── */}
      {phase === "intro" && (
        <>
          <div style={t.tag}>
            <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3.5" fill="currentColor" /></svg>
            Real-world adaptive module · v3
          </div>
          <div style={{ fontSize: 36, fontWeight: 400, marginBottom: "0.5rem", lineHeight: 1.2, color: BDC_NAVY }}>
            Practice the conversations<br /><span style={{ color: BDC_RED }}>that matter most at work</span>
          </div>
          <div style={{ fontSize: 15, color: "#4A5568", lineHeight: 1.75, marginBottom: "1.75rem", maxWidth: 560 }}>
            Choose a conversation type, describe your real situation, and practice the actual exchange — with a tailored diagnostic, live coaching nudges, and a personalised debrief.
          </div>

          <ModulePicker value={moduleKey} onChange={(key) => { setModuleKey(key); }} />

          <div style={t.card}>
            <div style={t.sec}>By the end of this module</div>
            {mod.contract.objectives.map((o, i) => (
              <div key={i} style={t.objRow}><div style={t.objBadge}>{i + 1}</div><span>{o}</span></div>
            ))}
          </div>

          <UnderTheHood mod={mod} />

          <button style={t.btnP(false)} onClick={() => setPhase("context")}>Get started</button>
        </>
      )}

      {/* ── Context ── */}
      {phase === "context" && (
        <>
          <div style={t.card}>
            <div style={t.sec}>Tell us about your situation</div>
            <p style={{ fontSize: 14, color: "#4A5568", lineHeight: 1.65, marginBottom: "1.25rem" }}>
              Your answers shape the entire module. The more specific you are, the more useful the practice will be.
            </p>
            <div style={{ marginBottom: "1rem" }}>
              <label style={t.label}>Your role</label>
              <input style={t.input} placeholder="e.g. Team lead, Senior designer, Product manager…" value={ctx.role} onChange={(e) => setCtx((c) => ({ ...c, role: e.target.value }))} />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={t.label}>{mod.context.otherPartyLabel}</label>
              <input style={t.input} placeholder={mod.context.otherPartyPlaceholder} value={ctx.otherParty} onChange={(e) => setCtx((c) => ({ ...c, otherParty: e.target.value }))} />
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={t.label}>{mod.context.situationLabel}</label>
              <textarea style={{ ...t.ta, minHeight: 96 }} placeholder={mod.context.situationPlaceholder} value={ctx.situation} onChange={(e) => setCtx((c) => ({ ...c, situation: e.target.value }))} rows={4} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button style={{ ...t.btnG, fontSize: 13 }} onClick={reset}>← Change type</button>
              <button style={t.btnP(!ctxReady)} onClick={() => setPhase("warmup")} disabled={!ctxReady}>Continue to warm-up</button>
            </div>
          </div>
          <div style={t.disclaimer}>The scenario simulation will use the details you've shared. Responses from the other party are AI-generated and not a prediction of how this person would actually behave.</div>
        </>
      )}

      {/* ── Warm-up ── */}
      {phase === "warmup" && (
        <>
          <div style={{ fontSize: 12, color: "#8A96A3", fontWeight: 600, marginBottom: "0.75rem" }}>Question {warmupStep + 1} of {mod.warmup.length} · Quick self-assessment</div>
          <div style={t.card}>
            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6, marginBottom: "1.25rem", color: BDC_NAVY }}>{mod.warmup[warmupStep].q}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {mod.warmup[warmupStep].opts.map((opt, i) => (
                <button key={i} onClick={() => pickWarmup(i)} style={{ textAlign: "left", padding: "0.85rem 1.25rem", borderRadius: 50, border: `1.5px solid ${BDC_BORDER}`, background: "#fff", fontSize: 14, color: BDC_NAVY, cursor: "pointer", fontFamily: "inherit", lineHeight: 1.5, transition: "border-color 0.15s, background 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = BDC_RED; e.currentTarget.style.background = BDC_RED_L; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = BDC_BORDER; e.currentTarget.style.background = "#fff"; }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          {warmupAnswers.length > 0 && (
            <div style={{ fontSize: 12, color: "#8A96A3" }}>
              {warmupAnswers.map((a, i) => (
                <div key={i} style={{ padding: "0.4rem 0", borderBottom: `1px solid ${BDC_BORDER}` }}>
                  <strong style={{ color: BDC_NAVY }}>{mod.warmup[i].q.split(",")[0]}</strong> → {mod.warmup[i].opts[a]}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Diagnostic ── */}
      {phase === "diagnostic" && (
        <>
          <div style={{ fontSize: 12, color: "#8A96A3", fontWeight: 600, marginBottom: "0.75rem" }}>Question {answers.length + 1} of 3 · Based on your situation and warm-up</div>
          <div style={t.card}>
            {loading && !currentQ ? <Dots label="Loading question…" /> : currentQ ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6, marginBottom: "1rem", color: BDC_NAVY }}>{currentQ}</div>
                <textarea style={{ ...t.ta, minHeight: 80 }} value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} placeholder="Share your thinking…" disabled={loading} rows={3} />
                <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
                  <button style={t.btnP(loading || !currentAnswer.trim())} onClick={submitAnswer} disabled={loading || !currentAnswer.trim()}>
                    {answers.length < 2 ? "Next question" : "Build my profile"}
                  </button>
                </div>
              </>
            ) : <Dots label="Loading…" />}
          </div>
          {loading && answers.length >= 3 && <div style={t.card}><Dots label="Analysing responses and building your profile…" /></div>}
          {answers.length > 0 && (
            <div>{answers.map((a, i) => (
              <div key={i} style={{ fontSize: 12, color: "#8A96A3", padding: "0.5rem 0", borderBottom: `1px solid ${BDC_BORDER}` }}>
                <strong style={{ color: BDC_NAVY }}>Q{i + 1}:</strong> {questions[i]}<br />
                <span style={{ paddingLeft: "1em", display: "inline-block", marginTop: 2 }}>{a}</span>
              </div>
            ))}</div>
          )}
        </>
      )}

      {/* ── Profile review + difficulty ── */}
      {phase === "profile-review" && profile && (
        <>
          <div style={t.card}>
            <div style={t.sec}>Your learner profile — review and adjust if needed</div>
            {[
              { field: "strong", label: "Strong", bg: "#E6F6F1", color: "#085041" },
              { field: "misconception", label: "Misconception", bg: "#FAECE7", color: "#4A1B0C" },
              { field: "gap", label: "Gap", bg: "#FEF7E7", color: "#412402" },
            ].map(({ field, label, bg, color }) => (
              <div key={field} style={{ background: bg, borderRadius: 10, padding: "0.875rem 1rem", marginBottom: "0.6rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color, opacity: 0.75 }}>{label}</span>
                  {editingField !== field && (
                    <button onClick={() => startEdit(field, profile[field])} style={{ fontSize: 11, color, background: "none", border: "none", cursor: "pointer", opacity: 0.7, fontFamily: "inherit" }}>Edit</button>
                  )}
                </div>
                {editingField === field ? (
                  <div>
                    <textarea style={{ ...t.ta, minHeight: 60, fontSize: 13, background: "rgba(255,255,255,0.6)", border: `1px solid ${color}` }} value={editValue} onChange={(e) => setEditValue(e.target.value)} rows={2} />
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <button style={{ ...t.btnP(false), padding: "4px 12px", fontSize: 12, background: color }} onClick={saveEdit}>Save</button>
                      <button style={{ ...t.btnG, padding: "4px 12px", fontSize: 12 }} onClick={() => setEditingField(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color, lineHeight: 1.5 }}>{profile[field]}</div>
                )}
              </div>
            ))}
          </div>

          <div style={t.card}>
            <div style={t.sec}>Set scenario difficulty</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
              {[
                { id: "receptive", label: "Receptive", desc: mod.diffGuide.receptive },
                { id: "realistic", label: "Realistic", desc: mod.diffGuide.realistic },
                { id: "challenging", label: "Challenging", desc: mod.diffGuide.challenging },
              ].map(({ id, label, desc }) => (
                <div key={id} onClick={() => setDifficulty(id)} style={{ padding: "1rem 1.25rem", borderRadius: 10, border: `2px solid ${difficulty === id ? BDC_RED : BDC_BORDER}`, background: difficulty === id ? BDC_RED_L : "#fff", cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: difficulty === id ? BDC_RED : BDC_NAVY, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#4A5568", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={t.btnP(false)} onClick={startScenario}>Start scenario</button>
            </div>
          </div>
        </>
      )}

      {/* ── Scenario ── */}
      {phase === "scenario" && profile && (
        <>
          <div style={t.disclaimer}>
            You are in a simulated version of your real conversation. <strong>{profile.otherPartyName}</strong>'s responses are AI-generated — not a prediction of how this person would actually behave.
            <span style={{ marginLeft: 8, background: BDC_RED_L, color: BDC_RED, borderRadius: 50, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{difficulty}</span>
          </div>
          <div style={t.card}>
            {history.map((h, i) => (
              <div key={i} style={{ marginBottom: "1.25rem" }}>
                <div style={t.situation}>{h.situation}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8A96A3", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>You said</div>
                <div style={t.learnerAction}>{h.action}</div>
                {h.nudge && (
                  <div style={t.nudge}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="7" cy="7" r="6" stroke="#0F6E56" strokeWidth="1.2" fill="none" />
                      <path d="M7 4v3.5M7 10v.5" stroke="#0F6E56" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    <span><strong>Coaching nudge:</strong> {h.nudge}</span>
                  </div>
                )}
                <div style={t.consequence}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8A96A3", display: "block", marginBottom: 4 }}>{profile.otherPartyName} responds</span>
                  {h.consequence}
                </div>
              </div>
            ))}

            {situation && !loading && (
              <>
                <div style={{ fontSize: 12, color: "#8A96A3", textAlign: "right", marginBottom: "0.5rem", fontWeight: 600 }}>Turn {turn + 1} of 3</div>
                <div style={t.situation}>{situation}</div>
                <textarea style={{ ...t.ta, minHeight: 88 }} value={currentAction} onChange={(e) => setCurrentAction(e.target.value)} placeholder="What do you say or do?" disabled={loading} rows={3} />
                <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
                  <button style={t.btnP(loading || !currentAction.trim())} onClick={submitTurn} disabled={loading || !currentAction.trim()}>
                    {turn < 2 ? "Continue" : "Finish & get feedback"}
                  </button>
                </div>
              </>
            )}
            {loading && <Dots label="Generating response…" />}
          </div>
        </>
      )}

      {/* ── Debrief ── */}
      {phase === "debrief" && (
        <>
          {!debrief ? <div style={t.card}><Dots label="Generating your personalised debrief…" /></div> : (
            <>
              <div style={{ textAlign: "center", padding: "2rem 1.5rem", background: BDC_NAVY, borderRadius: 12, marginBottom: "1rem" }}>
                <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, color: debrief.overall >= 75 ? "#4ADE80" : debrief.overall >= 50 ? "#FACC15" : BDC_RED, marginBottom: 6 }}>{debrief.overall}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500, letterSpacing: "0.04em" }}>Overall score against learning objectives</div>
              </div>

              <div style={t.card}>
                <div style={t.sec}>Objective-by-objective</div>
                {debrief.scores.map((sc, i) => {
                  const c = sc.score >= 70 ? "#0A6647" : sc.score >= 45 ? "#92400E" : BDC_RED;
                  const bg = sc.score >= 70 ? "#4ADE80" : sc.score >= 45 ? "#FACC15" : BDC_RED;
                  return (
                    <div key={i} style={{ paddingBottom: "1rem", marginBottom: "1rem", borderBottom: i < debrief.scores.length - 1 ? `1px solid ${BDC_BORDER}` : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 14, fontWeight: 600, color: BDC_NAVY }}>
                        <span style={{ color: c, fontSize: 16 }}>{sc.score >= 70 ? "✓" : sc.score >= 45 ? "~" : "○"}</span>
                        <span>{sc.obj}</span>
                      </div>
                      <div style={{ height: 6, background: BDC_GRAY, borderRadius: 50, marginBottom: 6, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${sc.score}%`, background: bg, borderRadius: 50, transition: "width 1s ease" }} />
                      </div>
                      <div style={{ fontSize: 13, color: "#4A5568", lineHeight: 1.6 }}>{sc.fb}</div>
                    </div>
                  );
                })}
              </div>

              <div style={t.rewriteBox}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.65rem" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M11 2l3 3-8 8H3v-3L11 2z" stroke="#92400E" strokeWidth="1.3" strokeLinejoin="round" fill="none" />
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#92400E" }}>Your weakest turn — and how to strengthen it</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.75, color: "#78350F" }}>{debrief.rewrite}</div>
              </div>

              <div style={t.mondayBox}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.65rem" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="12" rx="2" stroke="#0F6E56" strokeWidth="1.3" fill="none" />
                    <path d="M5 1v4M11 1v4M1 7h14" stroke="#0F6E56" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#0F6E56" }}>Before your real conversation</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.75, color: "#064E3B" }}>{debrief.monday}</div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button style={t.btnP(false)} onClick={() => { setRetryAction(""); setRetryResult(null); setPhase("retry"); }}>
                  Retry your weakest turn
                </button>
                <button style={t.btnG} onClick={reset}>Start over</button>
              </div>
            </>
          )}
        </>
      )}

      {/* ── Retry ── */}
      {phase === "retry" && weakTurn && (
        <>
          <div style={{ fontSize: 14, color: "#4A5568", marginBottom: "1rem", lineHeight: 1.6 }}>
            Here's the turn you struggled with most. Review the suggested rewrite, then try your own improved version.
          </div>

          <div style={t.card}>
            <div style={t.sec}>The situation</div>
            <div style={t.situation}>{weakTurn.situation}</div>
            <div style={t.sec}>Your original response</div>
            <div style={{ ...t.learnerAction, marginBottom: "1rem" }}>{weakTurn.action}</div>
            <div style={t.sec}>Suggested stronger version</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.75, color: "#78350F", padding: "1rem 1.25rem", background: "#FEF7E7", borderRadius: 10, border: `1px solid #F5C842`, marginBottom: "1.25rem" }}>{debrief.rewrite?.split("A stronger version")[1]?.replace(/^[: ]+/, "") || "Apply the framework from this module — be specific, grounded, and connect your point to a clear outcome."}</div>
            <div style={t.sec}>Your new attempt</div>
            <textarea style={{ ...t.ta, minHeight: 96, marginBottom: "0.75rem" }} value={retryAction} onChange={(e) => setRetryAction(e.target.value)} placeholder="Write your improved response…" disabled={loading} rows={4} />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={t.btnP(loading || !retryAction.trim())} onClick={submitRetry} disabled={loading || !retryAction.trim()}>Submit retry</button>
            </div>
            {loading && <Dots label="Evaluating your new response…" />}
          </div>

          {retryResult && (
            <div style={{ ...t.card, borderLeft: `3px solid #0A6647` }}>
              <div style={t.sec}>How {profile.otherPartyName} responds</div>
              <div style={{ ...t.consequence, marginBottom: "1rem" }}>{retryResult.consequence}</div>
              <div style={t.sec}>What improved</div>
              <div style={{ fontSize: 14, lineHeight: 1.75, color: "#4A5568", marginBottom: "1.25rem" }}>{retryResult.improvement}</div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button style={t.btnG} onClick={() => setPhase("debrief")}>Back to debrief</button>
                <button style={t.btnG} onClick={reset}>Start over</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
