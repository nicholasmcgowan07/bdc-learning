import { useState, useRef, useEffect } from "react";

const BDC_NAVY = "#1A2B4A";
const BDC_RED   = "#E8192C";
const BDC_RED_L = "#FDE8EA";
const BDC_GRAY  = "#F4F5F7";
const BDC_BORDER= "#DDE1E7";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const TS   = "#4A5568";
const TT   = "#8A96A3";
const GRN  = "#0F6E56";
const GRN_L= "#E1F5EE";
const AMB  = "#854F0B";
const AMB_L= "#FAEEDA";
const IND  = "#3730A3";
const IND_L= "#EEF2FF";
const PUR  = "#6B21A8";
const PUR_L= "#F5F3FF";
const SKY  = "#0369A1";
const SKY_L= "#E0F2FE";
const ORG  = "#C2410C";
const ORG_L= "#FFF7ED";

// ── Sample content (pre-loaded so the prototype works immediately) ─────────────
const SAMPLE_URL   = "https://www.youtube.com/watch?v=eIho2S0ZahI";
const SAMPLE_TITLE = "The SBI Feedback Model — Giving Effective Feedback";

const SAMPLE_TRANSCRIPT = `[00:00] Welcome to this session on giving effective feedback in the workplace.

[00:15] My name is Dr Sarah Ellison, and today we are going to cover the SBI Feedback Model — a simple, research-backed framework for giving feedback that actually lands.

[00:30] SBI stands for Situation, Behavior, Impact. It gives your feedback a clear structure that keeps the conversation factual and reduces the chance of triggering defensiveness.

[00:50] Let's start with the problem. Most feedback fails not because the content is wrong, but because of how it is delivered. The number one mistake is leading with judgment.

[01:10] When you say something like "you've been disorganised lately" or "your attitude in meetings has been poor," you are making a judgment — not a description. The person receiving it immediately feels attacked, and their brain shifts into self-defence mode.

[01:30] Once someone is defensive, they are no longer listening to you. They are building a counter-argument. That is why judgment-based feedback almost never changes behaviour.

[01:50] SBI flips this. Instead of judgments, you describe observable facts. Instead of "you're disorganised," you describe the specific situation, the specific behaviour, and the specific impact.

[02:15] The Situation is the specific context in which the behaviour occurred. Not "recently" — that is too vague. Not "in every meeting" — that is an overgeneralisation. You want something like: "In Wednesday's client presentation" or "During yesterday's standup." A precise, named moment.

[02:45] The Behavior is what you actually observed. Not what you inferred. Not what you assumed was going on inside their head. What did you see or hear? "You interrupted three times before I finished my sentence" is a behaviour. "You were being rude" is a judgment.

[03:15] The Impact is the consequence of that behaviour — on you, on the team, on the client, on the project. The impact statement is where the emotional weight belongs. "It made me feel like my input wasn't valued" or "The client told me afterwards they felt confused about our timeline" — these are impacts.

[03:45] Notice that the impact can be factual or emotional, but it should be genuine. Do not manufacture an impact. If the behaviour actually affected someone or something, say so. If you are struggling to name a real impact, that is a signal to ask yourself why this feedback matters enough to give.

[04:10] Let me show you a full example. Compare these two pieces of feedback.

[04:18] Version one: "You keep missing deadlines and it's affecting the whole team's morale." This is full of problems. "Keep missing" is vague and implies a pattern without evidence. "Affecting morale" is an inference — you have not checked whether morale is actually affected.

[04:40] Version two, using SBI: "In the last two sprint cycles, the feature you owned was delivered three days after the agreed date on both occasions — that covers the Situation and the Behaviour. Each time, the QA team had to compress their testing window, and in the second sprint that led to two bugs reaching production — that is the Impact."

[05:05] Do you feel the difference? Version two is harder to argue with, because it is factual. And it is more useful, because the person receiving it knows exactly what to change.

[05:20] Now let us talk about common pitfalls.

[05:25] Pitfall one: the feedback sandwich. You have probably heard of this — start with a compliment, deliver the criticism, end with a compliment. Research consistently shows this approach backfires. The person remembers the compliments and discounts the criticism, or they learn to dread any compliment because they know a "but" is coming. Skip the sandwich.

[05:55] Pitfall two: vagueness. "Sometimes your communication could be clearer" tells someone nothing. What situation? What behaviour? What was unclear about it? Vague feedback produces vague improvement.

[06:15] Pitfall three: poor timing. Feedback given in the heat of the moment tends to be emotional rather than factual. Feedback given six weeks after the event has lost its connection to the situation. The ideal window is within 48 hours, once you have had time to reflect and the specific details are still fresh.

[06:45] Pitfall four: public feedback. Giving feedback in front of others — in a team meeting, in a Slack channel — almost always triggers defensiveness. Even positive behavioural feedback is better given privately first. Critical feedback must always be private.

[07:10] Let us also cover what to do when someone gets defensive anyway.

[07:18] Defensiveness is normal. You are describing a gap between how someone sees themselves and how their behaviour is landing. That is uncomfortable. Expect some resistance.

[07:35] When someone gets defensive, the instinct is to either back down — "oh, it wasn't that big a deal" — or to escalate. Neither works. Instead, acknowledge: "I hear that this feels surprising. I want to share what I observed and what the impact was, and I am also interested in your perspective."

[08:00] Then return to the specific Situation, Behaviour, and Impact. Ground the conversation back in the observable facts.

[08:20] A few final principles before we wrap up.

[08:25] Feedback is not about blame. It is about information. You are giving someone data about how their behaviour is landing, so they can make an informed choice about whether to change it.

[08:45] Feedback works best when it is specific, timely, and private. Those three conditions together dramatically increase the likelihood that it leads to a genuine change.

[09:00] The SBI model is not a script — it is a structure. You will find your own language inside it. But the three components — Situation, Behaviour, Impact — should always be present.

[09:18] One final point: effective feedback is two-directional. After sharing your observation, invite a response: "Does this match what you were experiencing?" or "What was your read on that situation?" The conversation is more likely to produce change when the other person feels heard, not just informed.

[09:45] To summarise: most feedback fails because it leads with judgment. SBI gives you a factual structure — Situation, Behaviour, Impact — that reduces defensiveness and increases the chance of real change. Avoid the feedback sandwich, avoid vagueness, give feedback within 48 hours, and always do it privately.

[10:05] Thank you. In the next module, we will practise applying SBI in live conversation scenarios — including how to handle a defensive reaction in real time.`;

const SAMPLE_BRIEF = `Title: The SBI Feedback Model
Presenter: Dr Sarah Ellison
Duration: ~10 minutes
Format: Lecture-style explainer with worked examples

Key concepts covered:
— Why judgment-based feedback triggers defensiveness
— The SBI model: Situation, Behavior, Impact — each component defined
— Comparison of poor vs strong feedback examples
— Four common pitfalls: feedback sandwich, vagueness, poor timing, public delivery
— How to handle defensiveness — acknowledgment and returning to observable facts
— Final principles: feedback as information, two-directional conversation

Scene guide:
00:00–01:50  Why most feedback fails — judgment vs. description
01:50–05:05  SBI explained — all three components with a full worked example
05:05–07:10  Common pitfalls — sandwich, vagueness, timing, public feedback
07:10–08:20  Handling defensiveness — what to do when someone pushes back
08:20–10:10  Final principles and summary

Out of scope for this video (decline questions on these topics):
— HR procedures, formal performance reviews, or disciplinary processes
— Compensation, promotions, or termination conversations
— Receiving feedback (covered in a separate module)
— Conflict resolution frameworks other than SBI
— Legal or compliance obligations around feedback`;

const STARTER_PROMPTS = [
  "What does SBI stand for and how does each part work?",
  "Why does the video say the feedback sandwich backfires?",
  "What should I do if the person gets defensive?",
  "How is a Behaviour different from a judgment — can you give me the video's example?",
];

// ── Utilities ─────────────────────────────────────────────────────────────────
function extractEmbedUrl(url) {
  if (!url) return null;
  const ytWatch = url.match(/[?&]v=([^&#]+)/);
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`;
  const ytShort = url.match(/youtu\.be\/([^?#]+)/);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
  if (url.includes("/embed/")) return url;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

function buildSystemPrompt(transcript, brief, title, annotations, domainContext, qaText, docsDomain, docsDesc) {
  const hasAnnotations = (annotations || "").trim().length > 10;
  const hasDomain      = (domainContext || "").trim().length > 10;
  const hasQA          = (qaText || "").trim().length > 10;

  let sourceList = "SOURCE 1 — TRANSCRIPT (audio of the video)";
  let sourceNum = 2;
  if (hasAnnotations) { sourceList += `\nSOURCE ${sourceNum++} — SCREEN ANNOTATIONS (what is shown visually, by timestamp)`; }
  if (hasDomain)      { sourceList += `\nSOURCE ${sourceNum++} — DOMAIN CONTEXT (background facts about this subject)`; }
  if (hasQA)          { sourceList += `\nSOURCE ${sourceNum++} — DESIGNER Q&A (pre-written answers to anticipated learner questions)`; }
  const hasDocs = (docsDomain || '').trim().length > 4;
  if (hasDocs)        { sourceList += `\nSOURCE ${sourceNum++} — DOCUMENTATION (live search within: ${docsDomain})`; }

  const annotationsBlock  = hasAnnotations ? `\n--- SCREEN ANNOTATIONS ---\n${annotations}\n` : "";
  const domainBlock       = hasDomain      ? `\n--- DOMAIN CONTEXT ---\n${domainContext}\n`    : "";
  const qaBlock           = hasQA          ? `\n--- DESIGNER Q&A ---\n${qaText}\n`             : "";

  return `You are a learning assistant embedded alongside a training video titled "${title}".

You have access to the following knowledge sources for this session:
${sourceList}

--- CONTENT BRIEF ---
${brief || "(none provided)"}

--- TRANSCRIPT ---
${transcript}
${annotationsBlock}${domainBlock}${qaBlock}
--- RESPONSE RULES ---
Every response must begin with exactly one of these source tags on its own line, then a blank line, then your answer:

[TRANSCRIPT] — The answer is directly stated or shown in the video. Cite the timestamp.
[INFERRED] — The answer is not explicit but can be reasoned from transcript/annotations. Explain your reasoning and note it is not stated outright.
[DOMAIN] — The answer comes from the domain context provided (not from the video itself).
[QA] — The answer comes from the designer's pre-written Q&A.
[OUT OF SCOPE] — The question cannot be answered from any loaded source AND no documentation domain is configured. Name specifically why.
[DOCS] — The question cannot be answered from the loaded sources, but a documentation search is available and relevant to the video's subject. Use web search restricted to the configured domain(s) to find the answer. Always cite the specific page or article you found it in.

Additional rules:
- You may draw on multiple sources but use the tag for your PRIMARY source.
- For [INFERRED]: always acknowledge the reasoning is yours, not the video's explicit claim.
- Never use general knowledge not present in any of the four sources above.
- Cite timestamps when they help the learner navigate to the relevant moment.
- For [OUT OF SCOPE]: be specific — confirm it is absent from all sources and suggest a direction.`;
}

// ── VTT parser ────────────────────────────────────────────────────────────────
function formatTs(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function parseTsToSeconds(ts) {
  // Handles HH:MM:SS.mmm and MM:SS.mmm
  const parts = ts.replace(",", ".").split(":");
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
  }
  return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
}

function stripVttTags(text) {
  // Remove inline VTT tags: <c>, <b>, <i>, <00:00:05.000>, </c>, etc.
  return text.replace(/<[^>]+>/g, "").trim();
}

// Returns cleaned transcript text: cues grouped into ~30-second paragraphs
// so Vimeo's word-by-word auto-captions read as natural prose.
function parseVTT(vttText) {
  const lines = vttText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  // ── 1. Collect raw cues ──
  const cues = [];
  let i = 0;

  // Skip header block (everything before the first blank line after WEBVTT)
  while (i < lines.length && !lines[i].trim().startsWith("WEBVTT")) i++;
  i++;
  while (i < lines.length && lines[i].trim()) i++; // skip any header metadata

  while (i < lines.length) {
    // Skip blank lines between cues
    while (i < lines.length && !lines[i].trim()) i++;
    if (i >= lines.length) break;

    // Skip NOTE, STYLE, REGION blocks
    const blockStart = lines[i].trim();
    if (blockStart.startsWith("NOTE") || blockStart.startsWith("STYLE") || blockStart.startsWith("REGION")) {
      while (i < lines.length && lines[i].trim()) i++;
      continue;
    }

    // Optional cue ID — skip if the line doesn't contain "-->"
    if (!blockStart.includes("-->")) i++;
    if (i >= lines.length) break;

    const tsLine = lines[i].trim();
    if (!tsLine.includes("-->")) { i++; continue; }

    // Parse start timestamp
    const tsMatch = tsLine.match(/^(\d{1,2}:\d{2}(?::\d{2})?[.,]\d{3})/);
    const startSec = tsMatch ? parseTsToSeconds(tsMatch[1]) : null;
    i++;

    // Collect text lines until blank line
    const textParts = [];
    while (i < lines.length && lines[i].trim()) {
      const clean = stripVttTags(lines[i]);
      if (clean) textParts.push(clean);
      i++;
    }

    if (startSec !== null && textParts.length > 0) {
      cues.push({ startSec, text: textParts.join(" ") });
    }
  }

  if (cues.length === 0) return null;

  // ── 2. Group cues into ~30-second paragraphs ──
  // This collapses Vimeo's word-by-word captions into readable prose blocks.
  const GROUP_WINDOW = 30; // seconds
  const paragraphs = [];
  let groupStart = cues[0].startSec;
  let groupTexts = [];

  for (const cue of cues) {
    if (cue.startSec - groupStart >= GROUP_WINDOW && groupTexts.length > 0) {
      paragraphs.push({ ts: groupStart, text: groupTexts.join(" ") });
      groupStart = cue.startSec;
      groupTexts = [cue.text];
    } else {
      groupTexts.push(cue.text);
    }
  }
  if (groupTexts.length > 0) {
    paragraphs.push({ ts: groupStart, text: groupTexts.join(" ") });
  }

  return paragraphs.map(p => `[${formatTs(p.ts)}] ${p.text}`).join("\n\n");
}

// ── Shared components ─────────────────────────────────────────────────────────
function Dots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 150, 300].map(d => (
        <span key={d} style={{ width: 5, height: 5, borderRadius: "50%", background: BDC_NAVY, display: "inline-block", animation: `dot ${1.1}s ${d}ms infinite`, opacity: 0.35 }} />
      ))}
      <style>{`@keyframes dot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}`}</style>
    </span>
  );
}

function FieldLabel({ children, note }) {
  return (
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TT, marginBottom: "0.4rem" }}>
      {children}
      {note && <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 6 }}>{note}</span>}
    </label>
  );
}

// Source type config: colours, labels, icons for each response type
const SOURCE_META = {
  transcript:    { bg: BDC_GRAY,  border: BDC_BORDER, label: "From transcript",     labelColor: GRN,  avatarBg: BDC_NAVY, avatarBorder: BDC_NAVY },
  inferred:      { bg: IND_L,     border: "#C7D2FE",  label: "Inferred from transcript", labelColor: IND, avatarBg: IND,     avatarBorder: IND  },
  domain:        { bg: SKY_L,     border: "#BAE6FD",  label: "From domain context", labelColor: SKY,  avatarBg: SKY,     avatarBorder: SKY  },
  qa:            { bg: PUR_L,     border: "#DDD6FE",  label: "From designer Q&A",   labelColor: PUR,  avatarBg: PUR,     avatarBorder: PUR  },
  "out-of-scope":{ bg: AMB_L,     border: "#FAC775",  label: "Not covered in this video", labelColor: AMB, avatarBg: AMB_L, avatarBorder: AMB },
  docs:           { bg: ORG_L,     border: "#FED7AA",  label: "From documentation",        labelColor: ORG, avatarBg: ORG,  avatarBorder: ORG  },
  intro:         { bg: GRN_L,     border: "#9FE1CB",  label: null,                  labelColor: GRN,  avatarBg: BDC_NAVY, avatarBorder: BDC_NAVY },
};

function SourceDot({ color }) {
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />;
}

function MessageBubble({ msg }) {
  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.875rem", animation: "fadeUp 0.2s ease both" }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ maxWidth: "84%", padding: "0.65rem 0.9rem", background: BDC_RED, color: "#fff", borderRadius: "10px 10px 2px 10px", fontSize: 13.5, lineHeight: 1.6, fontFamily: SANS }}>
          {msg.content}
        </div>
      </div>
    );
  }

  const meta = SOURCE_META[msg.type] || SOURCE_META.transcript;
  const isOutOfScope = msg.type === "out-of-scope";
  const isIntro = msg.type === "intro";

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: "0.875rem", animation: "fadeUp 0.2s ease both" }}>
      <div style={{ width: 26, height: 26, borderRadius: "50%", background: meta.avatarBg, border: `1.5px solid ${meta.avatarBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
        {isOutOfScope
          ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="#fff" strokeWidth="1.2" fill="none"/><path d="M5 3v2.3M5 7v.3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>
          : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.5l2 2 4-4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          padding: "0.65rem 0.9rem",
          background: meta.bg,
          border: `1px solid ${meta.border}`,
          borderRadius: "2px 10px 10px 10px",
          fontSize: 13.5, lineHeight: 1.7, color: BDC_NAVY,
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          fontFamily: SANS,
        }}>
          {msg.content}
        </div>
        {!isIntro && meta.label && (
          <div style={{ marginTop: "0.3rem", fontSize: 11, color: meta.labelColor, display: "flex", alignItems: "center", gap: 4 }}>
            <SourceDot color={meta.labelColor} />
            {meta.label}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Setup screen ──────────────────────────────────────────────────────────────
function SetupScreen({ onLaunch }) {
  const [videoUrl,    setVideoUrl]    = useState(SAMPLE_URL);
  const [title,       setTitle]       = useState(SAMPLE_TITLE);
  const [transcript,  setTranscript]  = useState(SAMPLE_TRANSCRIPT);
  const [brief,         setBrief]         = useState(SAMPLE_BRIEF);
  const [annotations,   setAnnotations]   = useState("");
  const [domainContext, setDomainContext] = useState("");
  const [qaText,        setQaText]        = useState("");
  const [docsDomain,    setDocsDomain]    = useState("");
  const [docsDesc,      setDocsDesc]      = useState("");
  const [vttStatus,      setVttStatus]      = useState(null);
  const [briefLoading,   setBriefLoading]   = useState(false);
  const [briefGenerated, setBriefGenerated] = useState(false);
  const fileRef = useRef(null);

  const ready = videoUrl.trim().length > 8 && transcript.trim().length > 50;

  const generateBrief = async () => {
    if (!transcript.trim() || briefLoading) return;
    setBriefLoading(true);
    setBriefGenerated(false);
    try {
      const res = await fetch("https://bdc-api.nicholasmcgowan07.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an instructional designer analysing a video transcript to produce a structured content brief. The brief will be used to ground an AI learning assistant — it must be factual, specific, and honest about what the video does NOT cover.

Return plain text only (no markdown, no backticks). Use this exact structure:

Title: [infer from content]
Duration: [estimate from timestamps if present, otherwise omit]

Key concepts covered:
— [concept 1]
— [concept 2]
[all major concepts]

Scene guide:
[timestamp or ~0:00] [topic label — 5 words max]
[one line per distinct topic shift]

Out of scope for this video:
⚠ DESIGNER ACTION REQUIRED — replace this line with the topics you deliberately excluded. The AI cannot determine design intent from transcript alone.

RULES: Only include concepts actually in the transcript. Use timestamps where available. Never fill in the out-of-scope section.`,
          messages: [{ role: "user", content: "Transcript:\n\n" + transcript }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setBrief(data.content[0].text.trim());
      setBriefGenerated(true);
    } catch (e) {
      setBrief("[Generation failed: " + e.message + ". Please write the brief manually.]");
    }
    setBriefLoading(false);
  };

  const importVtt = (text, filename) => {
    if (!text.trim().startsWith("WEBVTT")) {
      setVttStatus({ ok: false, msg: "File doesn't look like a WebVTT file — it should start with WEBVTT." });
      return;
    }
    const parsed = parseVTT(text);
    if (!parsed) {
      setVttStatus({ ok: false, msg: "Couldn't find any cues in this file. Check it's a valid .vtt transcript." });
      return;
    }
    const paraCount = parsed.split("\n\n").length;
    setTranscript(parsed);
    setVttStatus({ ok: true, msg: `Imported from ${filename || "file"} — ${paraCount} paragraph${paraCount !== 1 ? "s" : ""} (cues grouped into 30-second windows).` });
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => importVtt(ev.target.result, file.name);
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleTranscriptChange = e => {
    const val = e.target.value;
    if (val.trim().startsWith("WEBVTT")) {
      const parsed = parseVTT(val);
      if (parsed) {
        const paraCount = parsed.split("\n\n").length;
        setTranscript(parsed);
        setVttStatus({ ok: true, msg: `VTT detected in paste — ${paraCount} paragraph${paraCount !== 1 ? "s" : ""} converted automatically.` });
        return;
      }
    }
    setTranscript(val);
    setVttStatus(null);
  };

  const inputSx = {
    width: "100%", border: `1.5px solid ${BDC_BORDER}`, borderRadius: 8,
    padding: "0.65rem 0.875rem", fontFamily: SANS, fontSize: 13.5,
    color: BDC_NAVY, background: "#fff", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ fontFamily: SANS, maxWidth: 700, margin: "0 auto", padding: "1.5rem 1rem", color: BDC_NAVY }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: BDC_RED, marginBottom: "0.35rem" }}>Co-Viewer — Configure</div>
        <h1 style={{ fontSize: 22, fontWeight: 400, lineHeight: 1.3, color: BDC_NAVY, marginBottom: "0.4rem" }}>Set up your video and transcript</h1>
        <p style={{ fontSize: 13.5, color: TS, lineHeight: 1.65, margin: 0 }}>
          The AI will answer learner questions grounded entirely in the content you provide — not its general knowledge. Pre-filled with a sample so you can launch immediately.
        </p>
      </div>

      {/* Video URL */}
      <div style={{ marginBottom: "1.125rem" }}>
        <FieldLabel>Video URL</FieldLabel>
        <input style={inputSx} value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=… or Vimeo URL" />
        <p style={{ fontSize: 11.5, color: TT, marginTop: "0.3rem", lineHeight: 1.5 }}>Accepts YouTube watch URLs, short URLs, and Vimeo. The video will be embedded via iframe.</p>
      </div>

      {/* Title */}
      <div style={{ marginBottom: "1.125rem" }}>
        <FieldLabel>Video title</FieldLabel>
        <input style={inputSx} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. The SBI Feedback Model" />
      </div>

      {/* Transcript */}
      <div style={{ marginBottom: "1.125rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
          <FieldLabel>Transcript</FieldLabel>
          <button
            onClick={() => fileRef.current?.click()}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "0.3rem 0.75rem", borderRadius: 6, border: `1.5px solid ${BDC_BORDER}`, background: "#fff", color: BDC_NAVY, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: SANS, letterSpacing: "0.02em", transition: "border-color 0.15s, background 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = BDC_RED; e.currentTarget.style.background = BDC_RED_L; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BDC_BORDER; e.currentTarget.style.background = "#fff"; }}
          >
            {/* Upload icon */}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v7M3.5 3.5L6 1l2.5 2.5" stroke={BDC_NAVY} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1.5 9.5v1h9v-1" stroke={BDC_NAVY} strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Import .vtt file
          </button>
          <input ref={fileRef} type="file" accept=".vtt,text/vtt" style={{ display: "none" }} onChange={handleFileChange} />
        </div>

        {/* VTT status banner */}
        {vttStatus && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 7,
            padding: "0.55rem 0.8rem", borderRadius: 7, marginBottom: "0.5rem",
            background: vttStatus.ok ? GRN_L : "#FCEBEB",
            border: `1px solid ${vttStatus.ok ? "#9FE1CB" : "#F09595"}`,
            fontSize: 12.5, color: vttStatus.ok ? GRN : "#501313", lineHeight: 1.5,
          }}>
            {vttStatus.ok
              ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="6.5" cy="6.5" r="6" stroke={GRN} strokeWidth="1.2" fill="none"/><path d="M3.5 6.5l2 2 3.5-3.5" stroke={GRN} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="6.5" cy="6.5" r="6" stroke="#A32D2D" strokeWidth="1.2" fill="none"/><path d="M6.5 4v3M6.5 8.5v.5" stroke="#A32D2D" strokeWidth="1.3" strokeLinecap="round"/></svg>
            }
            {vttStatus.msg}
            {vttStatus.ok && (
              <button onClick={() => setVttStatus(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: GRN, fontSize: 11, fontFamily: SANS, flexShrink: 0, padding: 0, opacity: 0.7 }}>Dismiss</button>
            )}
          </div>
        )}

        <textarea
          style={{ ...inputSx, resize: "vertical", lineHeight: 1.6, minHeight: 180, fontFamily: vttStatus?.ok ? "'Courier New', monospace" : SANS, fontSize: vttStatus?.ok ? 12.5 : 13.5 }}
          rows={9}
          value={transcript}
          onChange={handleTranscriptChange}
          placeholder="Paste a .vtt transcript or plain text here — or use the Import button above…"
        />
        <p style={{ fontSize: 11.5, color: TT, marginTop: "0.3rem", lineHeight: 1.5 }}>
          Import a <strong style={{ color: TS }}>.vtt file</strong> from Vimeo (or YouTube) and cues are automatically grouped into 30-second paragraphs with timestamps. Paste plain text directly if you prefer — timestamps are optional but help the AI cite specific moments.
        </p>
      </div>

      {/* Content brief */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
          <FieldLabel>Content brief</FieldLabel>
          <button
            onClick={generateBrief}
            disabled={!transcript.trim() || briefLoading}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "0.3rem 0.75rem", borderRadius: 6, border: `1.5px solid ${BDC_BORDER}`, background: !transcript.trim() || briefLoading ? BDC_GRAY : "#fff", color: !transcript.trim() || briefLoading ? TT : BDC_NAVY, cursor: !transcript.trim() || briefLoading ? "default" : "pointer", fontSize: 12, fontWeight: 600, fontFamily: SANS, letterSpacing: "0.02em", opacity: !transcript.trim() ? 0.5 : 1, transition: "all 0.15s" }}
            onMouseEnter={e => { if (transcript.trim() && !briefLoading) { e.currentTarget.style.borderColor = BDC_RED; e.currentTarget.style.background = BDC_RED_L; } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BDC_BORDER; e.currentTarget.style.background = "#fff"; }}
          >
            {briefLoading
              ? <><svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ animation: "spin 1s linear infinite" }}><circle cx="5.5" cy="5.5" r="4.5" stroke={TT} strokeWidth="1.3" strokeDasharray="14 8" fill="none"/></svg><style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style> Generating…</>
              : <><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v1.5M5.5 8.5V10M1 5.5h1.5M8.5 5.5H10M2.6 2.6l1 1M7.4 7.4l1 1M7.4 2.6l-1 1M3.6 7.4l-1 1" stroke={BDC_NAVY} strokeWidth="1.2" strokeLinecap="round"/></svg> Generate from transcript</>
            }
          </button>
        </div>

        {/* Post-generation warning about out-of-scope */}
        {briefGenerated && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "0.65rem 0.875rem", borderRadius: 8, marginBottom: "0.5rem", background: AMB_L, border: `1px solid #FAC775`, fontSize: 12.5, color: AMB, lineHeight: 1.6 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="6.5" cy="6.5" r="6" stroke={AMB} strokeWidth="1.2" fill="none"/><path d="M6.5 4v3M6.5 8.5v.5" stroke={AMB} strokeWidth="1.3" strokeLinecap="round"/></svg>
            <span><strong>Review required before launching.</strong> The scene guide and key concepts were generated from your transcript. The out-of-scope section cannot be automated — replace the placeholder line with the topics you deliberately excluded from this video. That distinction matters for accurate refusals.</span>
          </div>
        )}

        <textarea
          style={{ ...inputSx, resize: "vertical", lineHeight: 1.65, minHeight: 150, fontSize: 13, fontFamily: briefGenerated ? "'Courier New', monospace" : SANS }}
          rows={7}
          value={brief}
          onChange={e => { setBrief(e.target.value); }}
          placeholder="Scene guide, key concepts, and out-of-scope topics — or click Generate above to draft from your transcript…"
        />
        <p style={{ fontSize: 11.5, color: TT, marginTop: "0.3rem", lineHeight: 1.5 }}>
          The generated draft covers scene structure and key concepts. <strong style={{ color: TS }}>You must fill in the out-of-scope section</strong> — the AI cannot infer which topics you deliberately excluded.
        </p>
      </div>

      {/* ── Supplementary knowledge sources ── */}
      <div style={{ borderTop: `1px solid ${BDC_BORDER}`, paddingTop: "1.25rem", marginBottom: "1.25rem" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: TT, marginBottom: "0.25rem" }}>Supplementary knowledge sources</div>
        <p style={{ fontSize: 12.5, color: TS, lineHeight: 1.6, marginBottom: "1.125rem" }}>
          These three sources extend what the AI can answer beyond the audio transcript — each unlocks a different response type in the chat.
        </p>

        {/* Screen annotations */}
        <div style={{ marginBottom: "1.125rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.4rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: IND, display: "inline-block", flexShrink: 0 }} />
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TT }}>Screen annotations <span style={{ color: IND, fontWeight: 500 }}>→ Inferred answers</span></label>
          </div>
          <textarea
            style={{ ...inputSx, resize: "vertical", lineHeight: 1.6, minHeight: 80, fontSize: 13 }}
            rows={4}
            value={annotations}
            onChange={e => setAnnotations(e.target.value)}
            placeholder={"[0:31] Three parallel workflow branches visible in the canvas\n[1:14] Instructor clicks the tool palette and drags a Filter tool into Branch 2\n[2:05] All three branches produce independent output datasets shown side by side"}
          />
          <p style={{ fontSize: 11.5, color: TT, marginTop: "0.3rem", lineHeight: 1.5 }}>
            Timestamped descriptions of what is shown on screen. Closes the biggest gap in VTT transcripts — the visual channel. Critical for software tutorials and process walkthroughs.
          </p>
        </div>

        {/* Domain context */}
        <div style={{ marginBottom: "1.125rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.4rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: SKY, display: "inline-block", flexShrink: 0 }} />
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TT }}>Domain context <span style={{ color: SKY, fontWeight: 500 }}>→ Domain answers</span></label>
          </div>
          <textarea
            style={{ ...inputSx, resize: "vertical", lineHeight: 1.6, minHeight: 80, fontSize: 13 }}
            rows={4}
            value={domainContext}
            onChange={e => setDomainContext(e.target.value)}
            placeholder={"Background facts about the subject that apply throughout — not specific to this video.\n\nExample for an Alteryx tutorial:\n• Parallel workflow branches are independent by default — changes to one branch do not affect others\n• The BIXIE format is a proprietary Alteryx data interchange format\n• Tool containers are cosmetic groupings only and do not affect data flow"}
          />
          <p style={{ fontSize: 11.5, color: TT, marginTop: "0.3rem", lineHeight: 1.5 }}>
            Background facts about the subject that the video assumes learners know. The AI draws on these freely, labelled as domain knowledge rather than video content.
          </p>
        </div>

        {/* Designer Q&A */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.4rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: PUR, display: "inline-block", flexShrink: 0 }} />
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TT }}>Designer Q&amp;A <span style={{ color: PUR, fontWeight: 500 }}>→ Q&A answers</span></label>
          </div>
          <textarea
            style={{ ...inputSx, resize: "vertical", lineHeight: 1.6, minHeight: 100, fontSize: 13 }}
            rows={5}
            value={qaText}
            onChange={e => setQaText(e.target.value)}
            placeholder={"Pre-written answers to questions you know learners will ask that the video doesn\'t address.\n\nQ: Does adding tools to path 3 affect paths 1 and 2?\nA: No — in Alteryx, parallel branches run independently. Changes to one path never affect another.\n\nQ: Which path should I start with?\nA: Start with path 1 to establish a baseline, then compare against the others."}
          />
          <p style={{ fontSize: 11.5, color: TT, marginTop: "0.3rem", lineHeight: 1.5 }}>
            Predictable questions that the video doesn't answer but you know the answer to. One Q&A pair per blank line. The AI uses these verbatim and labels them as designer notes.
          </p>
        </div>
      </div>

      {/* Docs search field */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.4rem" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: ORG, display: "inline-block", flexShrink: 0 }} />
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: TT }}>Documentation search <span style={{ color: ORG, fontWeight: 500 }}>→ Documentation answers</span></label>
        </div>
        <input
          style={{ ...inputSx, marginBottom: "0.5rem" }}
          value={docsDomain}
          onChange={e => setDocsDomain(e.target.value)}
          placeholder="e.g. help.alteryx.com, community.alteryx.com"
        />
        <input
          style={{ ...inputSx }}
          value={docsDesc}
          onChange={e => setDocsDesc(e.target.value)}
          placeholder="Description: e.g. Official Alteryx product documentation and community forums"
        />
        <p style={{ fontSize: 11.5, color: TT, marginTop: "0.3rem", lineHeight: 1.5 }}>
          When a question can't be answered from the loaded sources, the AI will search within these domain(s) and label the answer as Documentation. Leave blank to disable.
        </p>
      </div>

      {/* Guardrail note */}
      <div style={{ padding: "0.875rem 1rem", background: BDC_GRAY, border: `1px solid ${BDC_BORDER}`, borderLeft: `3px solid ${BDC_NAVY}`, borderRadius: "0 8px 8px 0", marginBottom: "1.5rem", fontSize: 12.5, color: TS, lineHeight: 1.7 }}>
        <strong style={{ color: BDC_NAVY, display: "block", marginBottom: 3 }}>How grounding works</strong>
        The AI is given only the transcript and brief above as its knowledge source. If a learner asks something not covered by this video, it says so — it will not fill gaps from general knowledge. Grounded answers are flagged in green; out-of-scope responses are flagged in amber.
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          disabled={!ready}
          onClick={() => onLaunch({ videoUrl, title, transcript, brief, annotations, domainContext, qaText, docsDomain, docsDesc })}
          style={{ padding: "0.7rem 1.75rem", borderRadius: 8, border: "none", background: ready ? BDC_RED : BDC_BORDER, color: ready ? "#fff" : TT, cursor: ready ? "pointer" : "default", fontSize: 14, fontWeight: 700, fontFamily: SANS, letterSpacing: "0.02em", transition: "background 0.15s" }}
        >
          Launch Co-Viewer →
        </button>
      </div>
    </div>
  );
}

// ── Co-Viewer ─────────────────────────────────────────────────────────────────
function CoViewer({ config, onBack }) {
  const { videoUrl, title, transcript, brief, annotations, domainContext, qaText, docsDomain, docsDesc } = config;
  const embedUrl = extractEmbedUrl(videoUrl);
  const wordCount = transcript.trim().split(/\s+/).length;

  const [messages, setMessages] = useState([{
    id: 0, role: "assistant", type: "intro",
    content: (() => {
      const extras = [
        annotations?.trim().length > 10 && "screen annotations",
        domainContext?.trim().length > 10 && "domain context",
        qaText?.trim().length > 10 && "designer Q&A",
        docsDomain?.trim().length > 4 && `live documentation search (${docsDomain.trim().split(",")[0].trim()})`,
      ].filter(Boolean);
      const extraStr = extras.length
        ? ` I also have access to ${extras.join(", ")}, so I can answer more than what the audio alone covers.`
        : "";
      return `I'm ready to help you explore this video. Ask me anything about the content — I'll draw on the sources loaded for this session and label where each answer comes from.${extraStr}`;
    })(),
  }]);
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Generating response…");
  const [error,        setError]        = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Tool-use loop: handles web search relay back to the API
  const callAPI = async (apiMessages, systemPrompt, useSearch) => {
    const baseBody = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
    };
    if (useSearch) baseBody.tools = [{ type: "web_search_20250305", name: "web_search" }];

    let currentMessages = [...apiMessages];

    for (let i = 0; i < 5; i++) {
      const res = await fetch("https://bdc-api.nicholasmcgowan07.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...baseBody, messages: currentMessages }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const textBlocks = (data.content || []).filter(b => b.type === "text");
      const toolBlocks = (data.content || []).filter(b => b.type === "tool_use");

      if (data.stop_reason === "tool_use" && toolBlocks.length > 0) {
        setLoadingLabel("Searching documentation…");
        currentMessages = [
          ...currentMessages,
          { role: "assistant", content: data.content },
          {
            role: "user",
            content: toolBlocks.map(b => ({
              type: "tool_result",
              tool_use_id: b.id,
              content: "",
            })),
          },
        ];
      } else {
        return textBlocks.map(b => b.text).join("\n").trim();
      }
    }
    throw new Error("Search loop exceeded maximum iterations.");
  };

  const send = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput(""); setError(null); setLoadingLabel("Generating response…");

    const userMsg = { id: Date.now(), role: "user", content: userText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.role === "user" || (m.role === "assistant" && m.type !== "intro"))
        .map(m => ({ role: m.role, content: m.content }));

      const systemPrompt = buildSystemPrompt(transcript, brief, title, annotations, domainContext, qaText, docsDomain, docsDesc);
      const useSearch    = (docsDomain || "").trim().length > 4;
      const raw          = await callAPI([...history, { role: "user", content: userText }], systemPrompt, useSearch);

      const PREFIX_RE   = /^\[(TRANSCRIPT|INFERRED|DOMAIN|QA|DOCS|OUT OF SCOPE)\][ \t]*\n?/i;
      const prefixMatch = raw.match(PREFIX_RE);
      const prefixKey   = prefixMatch ? prefixMatch[1].toUpperCase() : null;
      const reply       = prefixMatch ? raw.slice(prefixMatch[0].length).trim() : raw.trim();

      const typeMap = {
        "TRANSCRIPT":   "transcript",
        "INFERRED":     "inferred",
        "DOMAIN":       "domain",
        "QA":           "qa",
        "DOCS":         "docs",
        "OUT OF SCOPE": "out-of-scope",
      };
      const msgType = typeMap[prefixKey] || "transcript";

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: reply,
        type: msgType,
      }]);
    } catch (e) {
      setError(e.message);
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const showStarters = messages.length === 1 && !loading;

  return (
    <div style={{ fontFamily: SANS, color: BDC_NAVY, height: "100vh", display: "flex", flexDirection: "column", background: BDC_GRAY }}>

      {/* ── Top bar ── */}
      <div style={{ background: BDC_NAVY, padding: "0 1.25rem", height: 44, display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.45)", padding: "0 4px", display: "flex", alignItems: "center", gap: 5, fontFamily: SANS, fontSize: 12, lineHeight: 1 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L3 6l5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
          Configure
        </button>
        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.18)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 3, background: BDC_RED, color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase", flexShrink: 0 }}>Co-Viewer</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 600, color: "#6BE4B8", letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6BE4B8", display: "inline-block" }} />
          Grounded
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Video pane (58%) */}
        <div style={{ flex: "0 0 58%", background: "#000", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, position: "relative" }}>
            {embedUrl
              ? <iframe src={embedUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Video URL not recognised</div>
            }
          </div>
          {/* Transcript status bar */}
          <div style={{ background: "#0D1C33", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "0.45rem 1rem", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ opacity: 0.4, flexShrink: 0 }}>
              <rect x="1" y="1.5" width="9" height="1.3" rx="0.65" fill="white"/>
              <rect x="1" y="4.5" width="6.5" height="1.3" rx="0.65" fill="white"/>
              <rect x="1" y="7.5" width="7.5" height="1.3" rx="0.65" fill="white"/>
            </svg>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", letterSpacing: "0.03em" }}>
              Transcript — {wordCount.toLocaleString()} words
              {annotations?.trim().length > 10 && " · Screen annotations"}
              {domainContext?.trim().length > 10 && " · Domain context"}
              {qaText?.trim().length > 10 && " · Designer Q&A"}
              {docsDomain?.trim().length > 4 && " · Docs search"}
            </span>
          </div>
        </div>

        {/* Chat pane (42%) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", borderLeft: `1px solid ${BDC_BORDER}` }}>

          {/* Chat header */}
          <div style={{ padding: "0.55rem 1rem", borderBottom: `1px solid ${BDC_BORDER}`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: TT }}>Ask about this video</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 0.875rem", fontSize: 10.5, color: TT }}>
              {[
                { color: GRN, label: "Transcript" },
                { color: IND, label: "Inferred" },
                { color: SKY, label: "Domain" },
                { color: PUR, label: "Designer Q&A" },
                { color: ORG, label: "Documentation" },
                { color: AMB, label: "Out of scope" },
              ].map(({ color, label }) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0.875rem 0.875rem 0" }}>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

            {/* Starter prompts */}
            {showStarters && (
              <div style={{ marginBottom: "0.875rem" }}>
                <div style={{ fontSize: 11, color: TT, marginBottom: "0.4rem", letterSpacing: "0.03em" }}>Try asking:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {STARTER_PROMPTS.map((p, i) => (
                    <button key={i} onClick={() => send(p)}
                      style={{ textAlign: "left", padding: "0.55rem 0.75rem", borderRadius: 8, border: `1px solid ${BDC_BORDER}`, background: BDC_GRAY, fontSize: 12.5, color: TS, cursor: "pointer", fontFamily: SANS, lineHeight: 1.45, transition: "border-color 0.12s, background 0.12s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = BDC_RED; e.currentTarget.style.background = BDC_RED_L; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = BDC_BORDER; e.currentTarget.style.background = BDC_GRAY; }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: "0.875rem", animation: "fadeUp 0.2s ease both" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: loadingLabel.includes("Search") ? ORG : BDC_NAVY, border: `1.5px solid ${loadingLabel.includes("Search") ? ORG : BDC_NAVY}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, transition: "background 0.3s" }}>
                  {loadingLabel.includes("Search")
                    ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="4" cy="4" r="3" stroke="white" strokeWidth="1.2" fill="none"/><path d="M6.5 6.5l2 2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.5l2 2 4-4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  }
                </div>
                <div style={{ padding: "0.55rem 0.875rem", background: loadingLabel.includes("Search") ? ORG_L : BDC_GRAY, border: `1px solid ${loadingLabel.includes("Search") ? "#FED7AA" : BDC_BORDER}`, borderRadius: "2px 10px 10px 10px", display: "flex", alignItems: "center", gap: 8, transition: "background 0.3s" }}>
                  <Dots />
                  <span style={{ fontSize: 12, color: loadingLabel.includes("Search") ? ORG : TT }}>{loadingLabel}</span>
                </div>
              </div>
            )}

            {error && (
              <div style={{ margin: "0 0 0.875rem", padding: "0.75rem 0.875rem", background: "#FCEBEB", border: "1px solid #F09595", borderRadius: 8, fontSize: 12.5, color: "#501313", lineHeight: 1.5 }}>
                <strong style={{ display: "block", marginBottom: 2 }}>Error</strong>{error}
              </div>
            )}

            <div ref={bottomRef} style={{ height: 1 }} />
          </div>

          {/* Input area */}
          <div style={{ padding: "0.75rem 0.875rem", borderTop: `1px solid ${BDC_BORDER}`, background: "#fff", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={2}
                placeholder="Ask about this video…"
                disabled={loading}
                style={{ flex: 1, border: `1.5px solid ${input ? BDC_NAVY : BDC_BORDER}`, borderRadius: 8, padding: "0.6rem 0.75rem", fontFamily: SANS, fontSize: 13.5, color: BDC_NAVY, background: "#fff", resize: "none", lineHeight: 1.5, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                style={{ padding: "0.6rem 1rem", borderRadius: 8, border: "none", background: !input.trim() || loading ? BDC_BORDER : BDC_RED, color: !input.trim() || loading ? TT : "#fff", cursor: !input.trim() || loading ? "default" : "pointer", fontFamily: SANS, fontSize: 13, fontWeight: 700, flexShrink: 0, alignSelf: "flex-end", transition: "background 0.15s" }}>
                Send
              </button>
            </div>
            <div style={{ marginTop: "0.35rem", fontSize: 11, color: TT }}>Enter to send · Shift+Enter for new line</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function CoViewerPage() {
  const [phase,  setPhase]  = useState("setup");
  const [config, setConfig] = useState(null);

  if (phase === "setup") {
    return (
      <SetupScreen
        onLaunch={cfg => { setConfig(cfg); setPhase("viewer"); }}
      />
    );
  }

  return (
    <CoViewer
      config={config}
      onBack={() => setPhase("setup")}
    />
  );
}
