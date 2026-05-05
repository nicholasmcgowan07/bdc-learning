import { useState, useEffect, useRef } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

// ── Scenario Library ──────────────────────────────────────────────────────────
const SCENARIOS = {
  launch: {
    id: "launch",
    emoji: "🚨",
    label: "Product Launch Crisis",
    tagline: "A critical failure discovered hours before go-live",
    topic: "Crisis Decision-Making: Technical Failure Under Time Pressure",
    objectives: [
      "Identify and prioritise critical actions when time and resources are constrained",
      "Determine what to communicate, to whom, and when under uncertainty",
      "Recognise cognitive biases that distort judgment in high-pressure situations",
    ],
    channelName: "#launch-crisis",
    setup: [
      { sender: "Priya", role: "Lead Dev", text: "Hey — got a minute?" },
      { sender: "Priya", role: "Lead Dev", text: "Critical issue. The data sync is completely broken on the portal." },
      { sender: "Priya", role: "Lead Dev", text: "Live inventory won't update at all. We found it 20 mins ago. Launch is 9AM." },
    ],
    initWorld: { hours: 16, team: "Full", client: "Unaware", risk: "High", problem: "Open" },
    clockMax: 16,
    teaser: "It's the night before a major product launch. A critical data sync failure has just been discovered — 16 hours before go-live. You're the one who decides what happens next.",
    teaserTags: ["16h to launch", "Full team", "Client unaware", "High risk"],
    senders: "Priya (Lead Dev), Marcus (Account Manager), Director, Client (Northfield contact), Sarah (QA Lead)",
    context: "Tech product launch crisis. The e-commerce portal's live inventory sync is completely broken, discovered 16h before 9AM go-live. The client (Northfield) is unaware.",
    fallbackOutcome: "Launch delayed four hours. Client informed early enough to adjust their campaign. The relationship held.",
  },
  breach: {
    id: "breach",
    emoji: "🔒",
    label: "Security Breach",
    tagline: "Customer data exposed — the clock is ticking on disclosure",
    topic: "Crisis Decision-Making: Data Breach Response",
    objectives: [
      "Sequence response actions correctly when legal, technical, and reputational risks collide",
      "Decide what to disclose, to whom, and how fast under regulatory pressure",
      "Manage internal panic without letting it drive premature or damaging decisions",
    ],
    channelName: "#incident-response",
    setup: [
      { sender: "Marcus", role: "Security Lead", text: "We have a problem. A serious one." },
      { sender: "Marcus", role: "Security Lead", text: "Customer payment data may have been exposed. Breach detected 30 mins ago." },
      { sender: "Marcus", role: "Security Lead", text: "Scope is unclear but could be up to 40,000 records. Legal needs to know now." },
    ],
    initWorld: { hours: 8, team: "Full", client: "Unaware", risk: "Critical", problem: "Open" },
    clockMax: 8,
    teaser: "A security breach has been detected. Customer payment data may be exposed, and you have an 8-hour window before regulatory disclosure obligations kick in. Every decision you make now shapes the fallout.",
    teaserTags: ["8h disclosure window", "Full team", "Customers unaware", "Critical risk"],
    senders: "Marcus (Security Lead), Priya (Lead Dev), Director, Sarah (Legal Counsel), Client (external partner)",
    context: "Data breach crisis. Up to 40,000 customer payment records may be exposed. An 8-hour regulatory disclosure window is in effect. Legal, technical, and PR response must be coordinated simultaneously.",
    fallbackOutcome: "Breach contained within six hours. Regulatory notification filed on time. Customer trust damaged but transparency prevented a larger crisis.",
  },
  walkout: {
    id: "walkout",
    emoji: "👥",
    label: "Key Person Walkout",
    tagline: "Your lead just quit — major client presentation is tomorrow",
    topic: "Crisis Decision-Making: Talent Crisis and Stakeholder Management",
    objectives: [
      "Rapidly redistribute critical work and knowledge when a key contributor exits",
      "Decide what to tell the client and when — balancing honesty with confidence",
      "Maintain team morale and momentum when others may be tempted to follow",
    ],
    channelName: "#team-urgent",
    setup: [
      { sender: "Sarah", role: "Design Lead", text: "I need to talk to you. It can't wait." },
      { sender: "Sarah", role: "Design Lead", text: "I've accepted another offer. My last day is today — I'm so sorry." },
      { sender: "Sarah", role: "Design Lead", text: "I know the Hartwell presentation is tomorrow. I'll hand over what I can in the next two hours." },
    ],
    initWorld: { hours: 20, team: "Stretched", client: "Unaware", risk: "High", problem: "Open" },
    clockMax: 20,
    teaser: "Your Design Lead has just resigned — effective immediately. The Hartwell client presentation is in 20 hours. Her work is half-finished, the team is stunned, and the client doesn't know yet.",
    teaserTags: ["20h to presentation", "Team stretched", "Client unaware", "High risk"],
    senders: "Sarah (Design Lead, departing), Marcus (Account Manager), Director, Client (Hartwell contact), Priya (Senior Designer)",
    context: "Key person crisis. The Design Lead resigned effective immediately. A major client presentation (Hartwell) is in 20 hours with work half-finished. Team morale at risk. Client is unaware.",
    fallbackOutcome: "Presentation delivered with reduced scope. The client appreciated the transparency. The gaps Sarah left took three months to fill.",
  },
  pr: {
    id: "pr",
    emoji: "📢",
    label: "PR Incident",
    tagline: "A viral post is threatening your brand and hiring pipeline",
    topic: "Crisis Decision-Making: Reputation Management Under Public Pressure",
    objectives: [
      "Assess the real vs. perceived severity of reputational threats before reacting",
      "Choose the right voice, tone, and timing for public and internal communications",
      "Avoid the twin traps of over-responding and going silent when scrutiny is high",
    ],
    channelName: "#comms-urgent",
    setup: [
      { sender: "Director", role: "CEO", text: "Have you seen what's happening on LinkedIn?" },
      { sender: "Director", role: "CEO", text: "A former employee's post is going viral. It's about our culture during the reorg." },
      { sender: "Director", role: "CEO", text: "3,000 shares in two hours. Our careers page is getting hammered with negative comments." },
    ],
    initWorld: { hours: 4, team: "Full", client: "Concerned", risk: "High", problem: "Open" },
    clockMax: 4,
    teaser: "A former employee's post about your company's culture is going viral — 3,000 shares in two hours. Your hiring pipeline is already showing the damage. You have a narrow window to get ahead of it.",
    teaserTags: ["4h window", "Full team", "Stakeholders concerned", "Reputational risk"],
    senders: "Director (CEO), Marcus (Head of Comms), Sarah (HR Lead), Priya (Social Media Manager), Client (key partner contact)",
    context: "PR crisis. A former employee's viral LinkedIn post (3,000 shares in 2 hours) criticises company culture during a recent reorg. Hiring pipeline and partner relationships at risk. 4-hour window before media pickup.",
    fallbackOutcome: "A measured, honest response limited the damage. Hiring slowed for a month, but the willingness to acknowledge feedback earned more trust than silence would have.",
  },
  defence: {
    id: "defence",
    emoji: "🍁",
    label: "Defence Contract Crisis",
    tagline: "A compliance gap surfaces mid-bid on a major DND contract",
    topic: "Crisis Decision-Making: Defence Procurement Compliance Under Scrutiny",
    objectives: [
      "Navigate competing obligations to the client, the contracting authority, and internal compliance when a bid is at risk",
      "Decide what to disclose proactively versus what to resolve internally before it surfaces externally",
      "Maintain credibility with DND and Public Services and Procurement Canada while managing internal accountability",
    ],
    channelName: "#dnd-bid-urgent",
    setup: [
      { sender: "Sarah", role: "Contracts Lead", text: "We have a serious problem with the RCAF sustainment bid." },
      { sender: "Sarah", role: "Contracts Lead", text: "Legal just flagged that one of our subcontractors isn't on the approved vendor registry — we missed it in the vetting." },
      { sender: "Sarah", role: "Contracts Lead", text: "Submission is in 48 hours. PSPC has a zero-tolerance policy on non-compliant subs." },
    ],
    initWorld: { hours: 48, team: "Full", client: "Unaware", risk: "High", problem: "Open" },
    clockMax: 48,
    teaser: "Your team is 48 hours from submitting a major Royal Canadian Air Force sustainment bid to Public Services and Procurement Canada. Legal has just flagged a non-compliant subcontractor in the proposal — one that never made it onto the approved vendor registry. Pulling them risks the technical score. Keeping them risks disqualification.",
    teaserTags: ["48h to submission", "Full team", "PSPC unaware", "Bid at risk"],
    senders: "Sarah (Contracts Lead), Marcus (VP Business Development), Director (CEO), Client (DND Procurement Officer — Col. Renaud), Priya (Legal Counsel)",
    context: "Canadian defence procurement crisis. A major RCAF sustainment contract bid (valued ~$340M CAD) is due to PSPC in 48 hours. Legal has discovered a subcontractor listed in the technical proposal is not registered on the Controlled Goods Program approved vendor list — a mandatory compliance requirement under Canada's Defence Production Act. Removing them weakens the bid's technical score significantly. Keeping them risks disqualification and potential suspension from future DND procurement. The Contracting Officer (Col. Renaud at DND) has a prior relationship with the team and values transparency.",
    fallbackOutcome: "The bid was submitted with a compliant replacement subcontractor and a transparent disclosure note to PSPC. The technical score dropped, but the compliance posture held. DND awarded on best-value — the team came second, but preserved their standing for the next procurement cycle.",
  },
};

// ── Sender config ─────────────────────────────────────────────────────────────
const SENDER_MAP = {
  Priya:    { color: "#0F6E56", bg: "#E1F5EE" },
  Marcus:   { color: "#854F0B", bg: "#FAEEDA" },
  Director: { color: "#1A2B4A", bg: "#E8EDF5" },
  Client:   { color: "#993C1D", bg: "#FAECE7" },
  Sarah:    { color: "#185FA5", bg: "#E6F1FB" },
};
function senderStyle(name) {
  for (const [k, v] of Object.entries(SENDER_MAP)) { if (name?.includes(k)) return v; }
  return { color: "#1A2B4A", bg: "#E8EDF5" };
}

// ── API ───────────────────────────────────────────────────────────────────────
function buildSys(mode, world, history, scenario) {
  const base = `CURRICULUM CONTRACT: ${scenario.topic}. Objectives: ${scenario.objectives.join(" | ")}. Keep ALL message text SHORT — 1 sentence max, conversational. Senders available: ${scenario.senders}. Scenario context: ${scenario.context}`;
  const ctx = `World state: ${JSON.stringify(world)}`;
  const hist = history.length ? `Decision history: ${history.map((h,i)=>`[T${i+1}] ${h.choice} (${h.tag})`).join(" ")}` : "";

  if (mode === "situation")
    return `${base}\n${ctx}\n${hist}\n\nGenerate 2-3 short incoming messages advancing this specific crisis, then 4 choices. Return ONLY valid JSON:\n{"messages":[{"sender":"name","role":"role","text":"1 sentence"},...],"choices":[{"id":"a","text":"max 9 words","tag":"one word"},{"id":"b","text":"...","tag":"..."},{"id":"c","text":"...","tag":"..."},{"id":"d","text":"...","tag":"..."}]}\nChoices must represent genuinely different instincts specific to this crisis: act fast vs gather info, communicate openly vs contain, escalate vs own it, accept risk vs mitigate.`;

  if (mode === "consequence")
    return `${base}\n${ctx}\n${hist}\n\nLearner chose: "${history[history.length-1]?.choice}". Generate 2-3 short messages showing realistic consequences in this specific crisis, plus one new complication that emerges. Return ONLY valid JSON:\n{"messages":[{"sender":"name","role":"role","text":"1 sentence"},...]}`;

  if (mode === "debrief")
    return `${base}\nFull decision history: ${JSON.stringify(history)}\n\nEvaluate how the learner handled THIS specific crisis. Return ONLY valid JSON:\n{"axes":[{"name":"Speed","low":"Deliberate","high":"Decisive","score":0-100,"insight":"1 sentence specific to their choices"},{"name":"Comms","low":"Contain","high":"Proactive","score":0-100,"insight":"1 sentence"},{"name":"Authority","low":"Escalate","high":"Own it","score":0-100,"insight":"1 sentence"},{"name":"Risk","low":"Mitigate","high":"Accept","score":0-100,"insight":"1 sentence"}],"blind_spot":"3-5 words","strength":"3-5 words","outcome":"2 sentences describing how the crisis played out"}`;
}

function updateWorld(world, turn) {
  const drop = { 0:3.5, 1:3.0, 2:2.5, 3:2.0 }[turn] || 2.5;
  const teams = ["Full","Stretched","Strained","Critical"];
  const ti = Math.min(teams.indexOf(world.team)+Math.floor(turn/2), 3);
  return { ...world, hours: Math.max(0, world.hours-drop), team: teams[ti] };
}

async function callClaude(messages, mode, world, history, scenario) {
  const res = await fetch("https://bdc-api.nicholasmcgowan07.workers.dev", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 800, system: buildSys(mode, world, history, scenario), messages }),
  });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message || `HTTP ${res.status}`); }
  const d = await res.json(); return d.content[0].text;
}
function pj(raw) { try { return JSON.parse(raw.replace(/```json|```/g,"").trim()); } catch { return null; } }

// ── BDC Brand Tokens ──────────────────────────────────────────────────────────
const BDC_RED    = "#E8192C";
const BDC_NAVY   = "#1A2B4A";
const BDC_RED_L  = "#FDE8EA";
const BDC_GRAY   = "#F4F5F7";
const BDC_BORDER = "#DDE1E7";
const IND        = BDC_RED;
const IND_L      = BDC_RED_L;
const TC={ Full:"#1D9E75", Stretched:"#BA7517", Strained:"#D85A30", Critical:"#A32D2D" };
const RC={ Low:"#1D9E75", Medium:"#BA7517", High:"#D85A30", Critical:"#A32D2D" };
const PC={ Open:"#A32D2D", "In Progress":"#BA7517", Partial:"#185FA5", Resolved:"#1D9E75" };
const CC={ Unaware:"#888780", Concerned:"#BA7517", Informed:"#185FA5", Escalated:"#A32D2D" };
const TAG_C={ decisive:IND, proactive:"#0F6E56", escalate:"#854F0B", pragmatic:"#185FA5", cautious:"#5F5E5A", transparent:"#0F6E56", delegate:"#854F0B", contained:"#993C1D" };

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icons = {
  decisive:    c=><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M11 2L4 12h6l-1 6 7-10h-6L11 2z" fill={c}/></svg>,
  proactive:   c=><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M3 8v4h3l5 3.5V4.5L6 8H3z" fill={c}/><path d="M14 6.5c1.5.8 1.5 5.2 0 6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  escalate:    c=><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 17V3M4 9l6-6 6 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  pragmatic:   c=><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2.5" fill={c}/><path d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  cautious:    c=><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="5.5" stroke={c} strokeWidth="1.8"/><path d="M13 13l4 4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  transparent: c=><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="3.5" width="15" height="11" rx="2.5" stroke={c} strokeWidth="1.7"/><circle cx="10" cy="9" r="2.5" fill={c}/></svg>,
  delegate:    c=><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="7.5" cy="6.5" r="2.5" fill={c}/><circle cx="14" cy="6.5" r="2.5" fill={c}/><path d="M2.5 18c0-3 2-4.5 5-4.5h5c3 0 5 1.5 5 4.5" stroke={c} strokeWidth="1.7" strokeLinecap="round"/></svg>,
  contained:   c=><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 5.5v6c0 4 3.5 6.5 7 7.5 3.5-1 7-3.5 7-7.5v-6L10 2z" fill={c} opacity=".85"/><path d="M7 10l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  custom:      c=><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M3 17l3.5-3.5 1.5 1.5 6-7.5 1 3.5 3-8-8 3 3 1L8.5 14.5 7 13z" fill={c}/></svg>,
};
function getIcon(tag, color) { return (Icons[tag?.toLowerCase()] || Icons.custom)(color); }

// ── World HUD ─────────────────────────────────────────────────────────────────
function ClockRing({ hours, max=16 }) {
  const pct=Math.max(0,hours/max), r=18, circ=2*Math.PI*r;
  const c=pct>0.6?"#1D9E75":pct>0.3?"#BA7517":"#A32D2D";
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke={BDC_BORDER} strokeWidth="3.5"/>
      <circle cx="22" cy="22" r={r} fill="none" stroke={c} strokeWidth="3.5"
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
        transform="rotate(-90 22 22)" style={{transition:"stroke-dashoffset 0.8s ease,stroke 0.4s"}}/>
      <text x="22" y="19" textAnchor="middle" fontSize="10" fontWeight="600" fill={c}>{hours.toFixed(0)}h</text>
      <text x="22" y="29" textAnchor="middle" fontSize="8" fill="#8A96A3">left</text>
    </svg>
  );
}

function TeamDots({ status }) {
  const active={Full:4,Stretched:3,Strained:2,Critical:1}[status]||4, c=TC[status]||"#888";
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <div style={{display:"flex",gap:3}}>
        {[0,1,2,3].map(i=>(
          <svg key={i} width="11" height="14" viewBox="0 0 11 14">
            <circle cx="5.5" cy="3.5" r="2.5" fill={i<active?c:BDC_BORDER}/>
            <path d="M1 14c0-3 1.5-5 4.5-5S10 11 10 14" fill={i<active?c:BDC_BORDER}/>
          </svg>
        ))}
      </div>
      <span style={{fontSize:9,color:"#8A96A3",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em"}}>Team</span>
      <span style={{fontSize:10,color:c,fontWeight:600}}>{status}</span>
    </div>
  );
}

function RiskMeter({ level }) {
  const levels=["Low","Medium","High","Critical"], idx=levels.indexOf(level), c=RC[level]||"#888";
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <div style={{display:"flex",gap:2,alignItems:"flex-end",height:22}}>
        {levels.map((l,i)=>(
          <div key={l} style={{width:6,height:5+i*5,borderRadius:2,background:i<=idx?c:BDC_BORDER,transition:"background 0.4s"}}/>
        ))}
      </div>
      <span style={{fontSize:9,color:"#8A96A3",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em"}}>Risk</span>
      <span style={{fontSize:10,color:c,fontWeight:600}}>{level}</span>
    </div>
  );
}

function ClientStatus({ status }) {
  const c=CC[status]||"#888";
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9.5" stroke={c} strokeWidth="1.4"/>
        <circle cx="9" cy="10.5" r="1" fill={c}/><circle cx="15" cy="10.5" r="1" fill={c}/>
        {status==="Unaware"   && <path d="M9 15h6" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>}
        {status==="Concerned" && <path d="M9 15.5c1.5-1.5 4.5-1.5 6 0" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>}
        {status==="Informed"  && <path d="M9 14.5c1.5 1.5 4.5 1.5 6 0" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>}
        {status==="Escalated" && <><path d="M9 15.5c1.5-2 4.5-2 6 0" stroke={c} strokeWidth="1.3" strokeLinecap="round"/><path d="M9 10v-1.5M15 10v-1.5" stroke={c} strokeWidth="1.1" strokeLinecap="round"/></>}
      </svg>
      <span style={{fontSize:9,color:"#8A96A3",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em"}}>Client</span>
      <span style={{fontSize:10,color:c,fontWeight:600}}>{status}</span>
    </div>
  );
}

function ProblemPips({ status }) {
  const steps=["Open","In Progress","Partial","Resolved"], idx=steps.indexOf(status), c=PC[status]||"#888";
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <div style={{display:"flex",gap:3,alignItems:"center"}}>
        {steps.map((s,i)=>(
          <div key={s} style={{width:i===idx?11:7,height:i===idx?11:7,borderRadius:"50%",background:i<=idx?c:BDC_BORDER,transition:"all 0.4s"}}/>
        ))}
      </div>
      <span style={{fontSize:9,color:"#8A96A3",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em"}}>Problem</span>
      <span style={{fontSize:10,color:c,fontWeight:600}}>{status}</span>
    </div>
  );
}

function WorldHUD({ world, clockMax }) {
  return (
    <div style={{position:"sticky",top:0,zIndex:50,background:"#fff",paddingTop:"0.5rem",paddingBottom:"0.5rem",marginBottom:"0.25rem"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-around",background:BDC_GRAY,border:`1px solid ${BDC_BORDER}`,borderRadius:12,padding:"0.75rem 1rem"}}>
        <ClockRing hours={world.hours} max={clockMax}/>
        <TeamDots status={world.team}/>
        <ClientStatus status={world.client}/>
        <RiskMeter level={world.risk}/>
        <ProblemPips status={world.problem}/>
      </div>
    </div>
  );
}

// ── Chat components ───────────────────────────────────────────────────────────
function Avatar({ name, size=28 }) {
  const { color, bg }=senderStyle(name);
  const initials=name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:bg,color,fontSize:size*0.36,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`1px solid ${color}22`}}>
      {initials}
    </div>
  );
}

function ChatBubble({ sender, role, text, isNew=false }) {
  return (
    <div style={{display:"flex",gap:"0.5rem",marginBottom:"0.625rem",animation:isNew?"msgIn 0.3s ease both":"none"}}>
      <Avatar name={sender}/>
      <div>
        <div style={{fontSize:11,marginBottom:3}}>
          <strong style={{color:BDC_NAVY,fontWeight:600}}>{sender}</strong>
          {role && <span style={{color:"#8A96A3"}}> · {role}</span>}
        </div>
        <div style={{background:BDC_GRAY,border:`1px solid ${BDC_BORDER}`,borderRadius:"2px 10px 10px 10px",padding:"0.5rem 0.75rem",fontSize:13.5,lineHeight:1.65,color:BDC_NAVY,display:"inline-block",maxWidth:460}}>
          {text}
        </div>
      </div>
    </div>
  );
}

function TypingBubble({ sender }) {
  const { color }=senderStyle(sender);
  return (
    <div style={{display:"flex",gap:"0.5rem",marginBottom:"0.625rem",animation:"msgIn 0.25s ease both"}}>
      <Avatar name={sender}/>
      <div>
        <div style={{fontSize:11,color:"#8A96A3",marginBottom:3}}>{sender}</div>
        <div style={{background:BDC_GRAY,border:`1px solid ${BDC_BORDER}`,borderRadius:"2px 10px 10px 10px",padding:"0.55rem 0.75rem",display:"inline-flex",alignItems:"center",gap:4}}>
          {[0,180,360].map(d=>(
            <span key={d} style={{width:5,height:5,borderRadius:"50%",background:color,display:"inline-block",animation:`typing 1s ${d}ms infinite ease-in-out`}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThreadDivider({ label }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:"0.625rem",margin:"0.875rem 0"}}>
      <div style={{flex:1,height:1,background:BDC_BORDER}}/>
      <span style={{fontSize:10,color:"#8A96A3",fontWeight:500,whiteSpace:"nowrap",textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</span>
      <div style={{flex:1,height:1,background:BDC_BORDER}}/>
    </div>
  );
}

// ── Choice row ────────────────────────────────────────────────────────────────
function ChoiceRow({ choice, onPick, disabled }) {
  const [hov,setHov]=useState(false);
  const a=hov&&!disabled, tc=TAG_C[choice.tag?.toLowerCase()]||IND;
  return (
    <button onClick={()=>!disabled&&onPick(choice)} disabled={disabled}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{textAlign:"left",padding:"0.5rem 0.75rem",borderRadius:50,border:`1.5px solid ${a?BDC_RED:BDC_BORDER}`,background:a?BDC_RED_L:"#fff",cursor:disabled?"default":"pointer",fontFamily:"inherit",transition:"all 0.13s",display:"flex",alignItems:"center",gap:"0.625rem",opacity:disabled?0.5:1,width:"100%"}}>
      <div style={{width:26,height:26,borderRadius:"50%",background:a?BDC_RED:BDC_GRAY,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.13s"}}>
        {getIcon(choice.tag, a?"#fff":tc)}
      </div>
      <span style={{flex:1,fontSize:13.5,fontWeight:500,lineHeight:1.35,color:a?BDC_RED:BDC_NAVY}}>{choice.text}</span>
      <span style={{fontSize:10,fontWeight:500,padding:"2px 7px",borderRadius:20,background:tc+"22",color:tc,whiteSpace:"nowrap",flexShrink:0}}>{choice.tag}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{flexShrink:0,opacity:0.3}}>
        <path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

// ── Free text ─────────────────────────────────────────────────────────────────
function FreeText({ onSubmit, disabled }) {
  const [open,setOpen]=useState(false);
  const [val,setVal]=useState("");
  if (!open) return (
    <button onClick={()=>setOpen(true)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"#8A96A3",fontFamily:"inherit",padding:"0.3rem 0",display:"flex",alignItems:"center",gap:4}}>
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      Write your own approach
    </button>
  );
  return (
    <div style={{display:"flex",gap:"0.5rem",alignItems:"flex-start",marginTop:"0.25rem"}}>
      <textarea value={val} onChange={e=>setVal(e.target.value)} placeholder="What do you do?" disabled={disabled} autoFocus
        style={{flex:1,border:`1.5px solid ${BDC_BORDER}`,borderRadius:12,padding:"0.5rem 0.75rem",fontFamily:"inherit",fontSize:13,color:BDC_NAVY,background:"#fff",resize:"none",lineHeight:1.5,outline:"none",minHeight:48,boxSizing:"border-box"}} rows={2}/>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <button style={{padding:"0.4rem 1rem",borderRadius:50,border:"none",background:BDC_RED,color:"#fff",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:700,opacity:!val.trim()?0.45:1}} disabled={!val.trim()||disabled} onClick={()=>onSubmit(val)}>Go</button>
        <button style={{padding:"0.4rem 0.6rem",borderRadius:50,border:`1px solid ${BDC_BORDER}`,background:"transparent",cursor:"pointer",fontSize:12,color:"#8A96A3",fontFamily:"inherit"}} onClick={()=>{setOpen(false);setVal("");}}>✕</button>
      </div>
    </div>
  );
}

// ── Animated dots ─────────────────────────────────────────────────────────────
function Dots({ label }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,color:"#8A96A3",fontSize:13,padding:"0.75rem 0"}}>
      {[0,200,400].map(d=><span key={d} style={{width:5,height:5,borderRadius:"50%",background:"currentColor",display:"inline-block",animation:`bounce 1.2s ${d}ms infinite`}}/>)}
      {label && <span style={{marginLeft:4}}>{label}</span>}
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

// ── Chat thread ───────────────────────────────────────────────────────────────
function ChatThread({ groups, animateFrom, choices, onPick, onFreeSubmit, loading, turnNum, channelName }) {
  const [shownCount, setShownCount]=useState(0);
  const [typingMsg, setTypingMsg]=useState(null);
  const [animating, setAnimating]=useState(false);
  const moveRef=useRef(null);

  const allMessages=groups.flatMap(g=>g.messages.map(m=>({...m,divider:g.divider})));

  useEffect(()=>{
    const toShow=allMessages.slice(animateFrom);
    if (!toShow.length) { setShownCount(allMessages.length); return; }
    setShownCount(animateFrom);
    setAnimating(true);
    let i=0;
    const showNext=()=>{
      if (i>=toShow.length) { setTypingMsg(null); setAnimating(false); return; }
      const sameSender = i > 0 && toShow[i].sender === toShow[i-1].sender;
      const preDelay = sameSender ? 900 : 400;
      setTimeout(()=>{
        setTypingMsg(toShow[i].sender);
        setTimeout(()=>{
          setTypingMsg(null);
          setShownCount(animateFrom+i+1);
          i++;
          setTimeout(showNext, 150);
        }, 1400);
      }, preDelay);
    };
    const t=setTimeout(showNext, 80);
    return ()=>clearTimeout(t);
  }, [animateFrom, groups.length]);

  const choicesReady = !loading && !animating && !typingMsg && choices.length > 0;

  useEffect(()=>{
    if (choicesReady && moveRef.current) {
      setTimeout(()=>moveRef.current?.scrollIntoView({ behavior:"smooth", block:"nearest" }), 100);
    }
  }, [choicesReady]);

  const visible=allMessages.slice(0,shownCount);

  return (
    <div style={{border:`1px solid ${BDC_BORDER}`,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
      <style>{`
        @keyframes msgIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        @keyframes typing{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
      `}</style>
      <div style={{background:BDC_GRAY,borderBottom:`1px solid ${BDC_BORDER}`,padding:"0.6rem 1rem",display:"flex",alignItems:"center",gap:"0.5rem",flexShrink:0}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:"#A32D2D",boxShadow:"0 0 0 2.5px #FCEBEB"}}/>
        <span style={{fontSize:13,fontWeight:600,color:BDC_NAVY}}>{channelName}</span>
      </div>
      <div style={{padding:"0.875rem 1rem",background:"#fff"}}>
        {visible.map((m,i)=>{
          const isFirst=i===0||visible[i-1]?.divider!==m.divider;
          return (
            <div key={i}>
              {m.divider && isFirst && <ThreadDivider label={m.divider}/>}
              <ChatBubble sender={m.sender} role={m.role} text={m.text} isNew={i>=animateFrom}/>
            </div>
          );
        })}
        {typingMsg && <TypingBubble sender={typingMsg}/>}
        {loading && !typingMsg && <Dots label="Generating…"/>}
        {!loading && choices.length>0 && !choicesReady && <Dots label="Almost there…"/>}
        {choicesReady && (
          <div ref={moveRef}>
            <ThreadDivider label={`Your move · turn ${turnNum} of 4`}/>
            <div style={{display:"flex",flexDirection:"column",gap:"0.35rem",marginBottom:"0.5rem"}}>
              {choices.map(c=>(
                <ChoiceRow key={c.id} choice={c} onPick={onPick} disabled={loading}/>
              ))}
            </div>
            <FreeText onSubmit={onFreeSubmit} disabled={loading}/>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Radar ─────────────────────────────────────────────────────────────────────
function ProfileRadar({ axes }) {
  const data=axes.map(a=>({subject:a.name,score:a.score,fullMark:100}));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart cx="50%" cy="50%" outerRadius="68%" data={data}>
        <PolarGrid stroke={BDC_BORDER} strokeWidth={0.5}/>
        <PolarAngleAxis dataKey="subject" tick={{fontSize:12,fill:BDC_NAVY,fontWeight:500}}/>
        <Radar dataKey="score" stroke={BDC_RED} fill={BDC_RED} fillOpacity={0.15} strokeWidth={2} dot={{fill:BDC_RED,r:3}}/>
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Under the Hood panel ──────────────────────────────────────────────────────
function UnderTheHood({ scenario }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("persona");

  const tabs = [
    { id: "persona",   label: "AI Persona & Context" },
    { id: "prompts",   label: "Prompt Architecture" },
    { id: "world",     label: "World Engine" },
  ];

  const mono = { fontFamily:"'Courier New',Courier,monospace", fontSize:11.5, lineHeight:1.7, background:"#0F1923", color:"#C9D8E8", borderRadius:8, padding:"0.75rem 1rem", marginBottom:"0.75rem", whiteSpace:"pre-wrap", wordBreak:"break-word" };
  const pill = (c,bg) => ({ display:"inline-block", fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:20, background:bg, color:c, marginRight:4, marginBottom:4 });
  const row = { display:"flex", gap:"0.5rem", alignItems:"flex-start", marginBottom:"0.625rem" };
  const dot = (c) => ({ width:8, height:8, borderRadius:"50%", background:c, flexShrink:0, marginTop:5 });
  const label = { fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:"#8A96A3", display:"block", marginBottom:"0.4rem" };

  return (
    <div style={{border:`1.5px dashed ${BDC_BORDER}`,borderRadius:12,marginBottom:"1.25rem",overflow:"hidden"}}>
      {/* Toggle header */}
      <button onClick={()=>setOpen(o=>!o)}
        style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.75rem 1rem",background:"#F9FAFB",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#8A96A3" strokeWidth="1.3"/>
            <path d="M6 6c0-1.1.9-2 2-2s2 .9 2 2c0 .8-.5 1.5-1.2 1.8L8 8.5V10" stroke="#8A96A3" strokeWidth="1.3" strokeLinecap="round"/>
            <circle cx="8" cy="12" r=".8" fill="#8A96A3"/>
          </svg>
          <span style={{fontSize:13,fontWeight:600,color:BDC_NAVY}}>Under the hood</span>
          <span style={{fontSize:11,color:"#8A96A3",fontWeight:400}}>— how the AI logic works for this scenario</span>
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0,transition:"transform 0.2s",transform:open?"rotate(180deg)":"none"}}>
          <path d="M3 5l4 4 4-4" stroke="#8A96A3" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{padding:"1rem",background:"#fff",borderTop:`1px solid ${BDC_BORDER}`}}>

          {/* Tab bar */}
          <div style={{display:"flex",gap:"0.35rem",marginBottom:"1rem",background:BDC_GRAY,borderRadius:8,padding:"3px"}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{flex:1,padding:"0.4rem 0",borderRadius:6,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:tab===t.id?700:500,background:tab===t.id?"#fff":"transparent",color:tab===t.id?BDC_NAVY:"#8A96A3",boxShadow:tab===t.id?"0 1px 3px rgba(0,0,0,0.1)":"none",transition:"all 0.15s"}}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab: Persona & Context ── */}
          {tab==="persona" && (
            <>
              <span style={label}>Curriculum contract (locked)</span>
              <div style={mono}>{`Topic: "${scenario.topic}"\n\nObjectives:\n${scenario.objectives.map((o,i)=>`  ${i+1}. ${o}`).join("\n")}`}</div>

              <span style={label}>Cast of characters</span>
              <div style={{marginBottom:"0.75rem"}}>
                {scenario.senders.split(", ").map((s,i)=>{
                  const colors=[["#0F6E56","#E1F5EE"],["#854F0B","#FAEEDA"],["#1A2B4A","#E8EDF5"],["#993C1D","#FAECE7"],["#185FA5","#E6F1FB"]];
                  const [c,bg]=colors[i%colors.length];
                  return <span key={s} style={pill(c,bg)}>{s}</span>;
                })}
              </div>

              <span style={label}>Scenario context injected into every prompt</span>
              <div style={mono}>{scenario.context}</div>

              <span style={label}>Starting world state</span>
              <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem",marginBottom:"0.5rem"}}>
                {Object.entries(scenario.initWorld).map(([k,v])=>(
                  <div key={k} style={{fontSize:12,background:BDC_GRAY,border:`1px solid ${BDC_BORDER}`,borderRadius:8,padding:"4px 10px"}}>
                    <span style={{color:"#8A96A3",fontWeight:500}}>{k}: </span>
                    <span style={{color:BDC_NAVY,fontWeight:700}}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Tab: Prompt Architecture ── */}
          {tab==="prompts" && (
            <>
              <p style={{fontSize:13,color:"#4A5568",lineHeight:1.65,marginBottom:"0.875rem"}}>
                Three separate system prompts run in sequence. Each shares the same curriculum contract and scenario context — but has a different job. The model is never told the full arc; it only sees its current role.
              </p>

              {[
                {
                  step:"1",color:"#185FA5",bg:"#E6F1FB",label:"SITUATION prompt",timing:"Called at the start of each turn",
                  job:"Generate 2–3 short in-character messages that advance the crisis, then produce 4 decision choices representing genuinely different instincts (fast vs deliberate, contain vs communicate, own it vs escalate, accept risk vs mitigate).",
                  output:'JSON: { messages: [...], choices: [{id, text, tag}] }',
                },
                {
                  step:"2",color:"#854F0B",bg:"#FAEEDA",label:"CONSEQUENCE prompt",timing:"Called immediately after the learner picks",
                  job:"React to the learner's choice in character. Show realistic ripple effects — 2–3 messages from different stakeholders — and introduce one new complication that the next turn will have to address.",
                  output:'JSON: { messages: [...] }',
                },
                {
                  step:"3",color:"#0F6E56",bg:"#E1F5EE",label:"DEBRIEF prompt",timing:"Called once after turn 4 completes",
                  job:"Evaluate the full decision history against four axes (Speed, Comms, Authority, Risk). Score 0–100 on each, write a one-sentence insight per axis, name a blind spot and a strength, and summarise how the crisis resolved.",
                  output:'JSON: { axes, blind_spot, strength, outcome }',
                },
              ].map(p=>(
                <div key={p.step} style={{borderLeft:`3px solid ${p.color}`,paddingLeft:"0.875rem",marginBottom:"1rem"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.3rem"}}>
                    <span style={{...pill(p.color,p.bg),marginBottom:0,marginRight:0}}>{`Prompt ${p.step}`}</span>
                    <span style={{fontSize:13,fontWeight:700,color:BDC_NAVY}}>{p.label}</span>
                  </div>
                  <div style={{fontSize:11,color:"#8A96A3",marginBottom:"0.35rem"}}>⏱ {p.timing}</div>
                  <div style={{fontSize:13,color:"#4A5568",lineHeight:1.6,marginBottom:"0.4rem"}}>{p.job}</div>
                  <div style={{...mono,marginBottom:0,fontSize:11}}>{`Returns → ${p.output}`}</div>
                </div>
              ))}

              <div style={{background:"#F0F4FF",border:"1px solid #C7D4F5",borderRadius:8,padding:"0.75rem",marginTop:"0.25rem"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#2D4A9E",marginBottom:"0.3rem"}}>Context accumulation</div>
                <div style={{fontSize:12,color:"#3A5298",lineHeight:1.6}}>Every prompt receives the full decision history so far — e.g. <code style={{background:"#DDE8FF",borderRadius:3,padding:"1px 4px"}}>[T1] "Call a team meeting" (decisive) → [T2] "Brief the client now" (transparent)</code>. This lets the model keep consequences coherent across turns without any server-side memory.</div>
              </div>
            </>
          )}

          {/* ── Tab: World Engine ── */}
          {tab==="world" && (
            <>
              <p style={{fontSize:13,color:"#4A5568",lineHeight:1.65,marginBottom:"0.875rem"}}>
                The five dashboard variables are deterministic — they update on a fixed schedule, independent of what the AI generates. This keeps the simulation grounded and prevents the AI from over-dramatising the stakes.
              </p>

              {[
                {var:"hours",color:"#185FA5",rule:`Decreases each turn by a fixed amount (T1: −3.5h, T2: −3.0h, T3: −2.5h, T4: −2.0h). Clock ring colour shifts green → amber → red as time runs down. Max is scenario-specific (${scenario.clockMax}h for this scenario).`},
                {var:"team",color:"#854F0B",rule:"Degrades on a 4-step scale: Full → Stretched → Strained → Critical. Steps down every two turns. Passed to the AI as context so messages can reflect team pressure."},
                {var:"client",color:"#993C1D",rule:"4 states: Unaware → Concerned → Informed → Escalated. Set in the scenario config and not currently auto-advanced — the AI can surface client reactions in its messages to shift perceived status."},
                {var:"risk",color:"#A32D2D",rule:"4 levels: Low → Medium → High → Critical. Starting value is scenario-specific. Passed to the AI so that consequence messages reflect the current exposure level."},
                {var:"problem",color:"#0F6E56",rule:"4 stages: Open → In Progress → Partial → Resolved. Displayed as four progress dots. Currently static — designed to be advanced by a future prompt mode that reads the learner's choices to determine progress."},
              ].map(v=>(
                <div key={v.var} style={{...row,alignItems:"flex-start",marginBottom:"0.75rem"}}>
                  <div style={{...dot(v.color),marginTop:3}}/>
                  <div>
                    <span style={{fontSize:12,fontWeight:700,color:BDC_NAVY,fontFamily:"'Courier New',monospace"}}>{v.var}</span>
                    <div style={{fontSize:12.5,color:"#4A5568",lineHeight:1.6,marginTop:2}}>{v.rule}</div>
                  </div>
                </div>
              ))}

              <div style={{background:"#E1F5EE",border:"1px solid #9FE1CB",borderRadius:8,padding:"0.75rem",marginTop:"0.25rem"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#085041",marginBottom:"0.3rem"}}>Why deterministic?</div>
                <div style={{fontSize:12,color:"#085041",lineHeight:1.6}}>If the world state were AI-controlled, a lenient model might let learners "win" regardless of decisions. Fixed degradation means the pressure is real — everyone feels the clock ticking and the team thinning — which keeps the emotional stakes honest.</div>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}

// ── Scenario Picker ───────────────────────────────────────────────────────────
function ScenarioPicker({ value, onChange }) {
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem",marginBottom:"1rem"}}>
      {Object.values(SCENARIOS).map(s=>{
        const active=value===s.id;
        return (
          <button key={s.id} onClick={()=>onChange(s.id)}
            style={{display:"inline-flex",alignItems:"center",gap:"0.4rem",padding:"0.45rem 1rem",borderRadius:50,border:`2px solid ${active?BDC_RED:BDC_BORDER}`,background:active?BDC_RED_L:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:active?700:500,color:active?BDC_RED:BDC_NAVY,transition:"all 0.15s",whiteSpace:"nowrap"}}
            onMouseEnter={e=>{ if(!active){e.currentTarget.style.borderColor=BDC_RED;e.currentTarget.style.color=BDC_RED;}}}
            onMouseLeave={e=>{ if(!active){e.currentTarget.style.borderColor=BDC_BORDER;e.currentTarget.style.color=BDC_NAVY;}}}>
            <span>{s.emoji}</span><span>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DecisionSimulatorPage() {
  const [scenarioKey, setScenarioKey]=useState("launch");
  const [phase, setPhase]=useState("intro");
  const [world, setWorld]=useState(null);
  const [choices, setChoices]=useState([]);
  const [history, setHistory]=useState([]);
  const [messageGroups, setMessageGroups]=useState([]);
  const [animateFrom, setAnimateFrom]=useState(0);
  const [debrief, setDebrief]=useState(null);
  const [loading, setLoading]=useState(false);
  const [error, setError]=useState(null);
  const [turnNum, setTurnNum]=useState(0);

  const scenario=SCENARIOS[scenarioKey];

  const reset=()=>{
    setPhase("intro"); setWorld(null); setChoices([]); setHistory([]);
    setMessageGroups([]); setAnimateFrom(0); setDebrief(null);
    setLoading(false); setError(null); setTurnNum(0);
  };

  const countAll=g=>g.reduce((n,grp)=>n+grp.messages.length,0);

  const start=async()=>{
    const initWorld={...scenario.initWorld};
    setWorld(initWorld);
    setPhase("game"); setLoading(true); setError(null);
    const setupGroup={ divider:null, messages:scenario.setup };
    setMessageGroups([setupGroup]); setAnimateFrom(0);
    await new Promise(r=>setTimeout(r, scenario.setup.length*900+400));
    try {
      const raw=await callClaude([{role:"user",content:"Generate first situation."}],"situation",initWorld,[],scenario);
      const r=pj(raw)||{
        messages:[{sender:scenario.setup[0].sender,role:scenario.setup[0].role,text:"What do you want to do? We need a decision fast."}],
        choices:[
          {id:"a",text:"Call emergency team meeting right now",tag:"decisive"},
          {id:"b",text:"Get full breakdown from the team first",tag:"cautious"},
          {id:"c",text:"Brief key stakeholders immediately",tag:"proactive"},
          {id:"d",text:"Escalate to your director now",tag:"escalate"},
        ],
      };
      const newGroup={ divider:"Turn 1", messages:r.messages||[] };
      setMessageGroups([setupGroup,newGroup]);
      setAnimateFrom(scenario.setup.length);
      setChoices(r.choices||[]); setTurnNum(1);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const handleChoice=async(text,tag)=>{
    setChoices([]); setLoading(true);
    const newHistory=[...history,{choice:text,tag:tag||"custom",consequence:""}];
    try {
      const cRaw=await callClaude([{role:"user",content:`Learner chose: "${text}"`}],"consequence",world,newHistory,scenario);
      const cRes=pj(cRaw)||{messages:[{sender:scenario.setup[0].sender,role:scenario.setup[0].role,text:"Got it. Moving on it."}]};
      const prevCount=countAll(messageGroups);
      const conseqGroup={ divider:`After turn ${turnNum}`, messages:cRes.messages||[] };
      const updatedGroups=[...messageGroups,conseqGroup];
      setMessageGroups(updatedGroups); setAnimateFrom(prevCount);
      setHistory(newHistory);
      const newWorld=updateWorld(world,turnNum);
      setWorld(newWorld);
      await new Promise(r=>setTimeout(r,(cRes.messages?.length||1)*900+500));

      if (turnNum>=4) {
        const dRaw=await callClaude([{role:"user",content:"Debrief."}],"debrief",newWorld,newHistory,scenario);
        const d=pj(dRaw)||{
          axes:[
            {name:"Speed",low:"Deliberate",high:"Decisive",score:62,insight:"Moved quickly but sometimes ahead of key info."},
            {name:"Comms",low:"Contain",high:"Proactive",score:42,insight:"Held back communication until things were certain."},
            {name:"Authority",low:"Escalate",high:"Own it",score:72,insight:"Kept ownership rather than pushing upward."},
            {name:"Risk",low:"Mitigate",high:"Accept",score:55,insight:"Balanced — neither reckless nor overly cautious."},
          ],
          blind_spot:"Optimism bias",strength:"Clear prioritisation",
          outcome:scenario.fallbackOutcome,
        };
        setDebrief(d); setPhase("debrief"); setLoading(false); return;
      }

      const sRaw=await callClaude([{role:"user",content:`Turn ${turnNum+1}.`}],"situation",newWorld,newHistory,scenario);
      const sRes=pj(sRaw)||{
        messages:[{sender:scenario.setup[0].sender,role:scenario.setup[0].role,text:"What's next?"}],
        choices:[
          {id:"a",text:"Set a go/no-go checkpoint",tag:"pragmatic"},
          {id:"b",text:"Brief the stakeholders now",tag:"transparent"},
          {id:"c",text:"Bring the director in — their call",tag:"escalate"},
          {id:"d",text:"Scope down and tackle post-crisis",tag:"decisive"},
        ],
      };
      const allGroups=[...updatedGroups,{divider:`Turn ${turnNum+1}`,messages:sRes.messages||[]}];
      setMessageGroups(allGroups);
      setAnimateFrom(countAll(updatedGroups));
      setChoices(sRes.choices||[]); setTurnNum(t=>t+1);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const wrap={fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",maxWidth:700,margin:"0 auto",padding:"2rem 1.25rem",color:BDC_NAVY,background:"#fff"};
  const card={background:"#fff",border:`1px solid ${BDC_BORDER}`,borderRadius:12,padding:"1.5rem",marginBottom:"1rem",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"};
  const btnP=(d)=>({display:"inline-flex",alignItems:"center",gap:6,padding:"0.65rem 1.5rem",borderRadius:50,fontSize:14,fontWeight:700,cursor:d?"default":"pointer",border:"none",background:BDC_RED,color:"#fff",fontFamily:"inherit",opacity:d?0.45:1});
  const btnG={display:"inline-flex",alignItems:"center",gap:6,padding:"0.65rem 1.5rem",borderRadius:50,fontSize:14,fontWeight:600,cursor:"pointer",background:"#fff",color:BDC_NAVY,border:`1.5px solid ${BDC_NAVY}`,fontFamily:"inherit"};

  return (
    <div style={wrap}>
      {error&&(
        <div style={{background:"#FCEBEB",border:"1px solid #F09595",borderRadius:12,padding:"0.875rem 1rem",fontSize:13,color:"#501313",marginBottom:"1rem"}}>
          <strong style={{display:"block",marginBottom:3}}>Error</strong>{error}
          <button style={{...btnG,padding:"2px 14px",fontSize:12,marginLeft:8,borderRadius:50}} onClick={()=>setError(null)}>Dismiss</button>
        </div>
      )}

      {/* ── Intro ── */}
      {phase==="intro"&&(
        <>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:BDC_RED,background:BDC_RED_L,padding:"4px 14px",borderRadius:50,marginBottom:"1rem"}}>
            Decision Simulator · v4
          </div>
          <div style={{fontSize:30,fontWeight:400,lineHeight:1.2,color:BDC_NAVY,marginBottom:"0.5rem"}}>
            Crisis Decision-Making<br/><span style={{color:BDC_RED}}>Under Pressure</span>
          </div>
          <div style={{fontSize:15,color:"#4A5568",lineHeight:1.75,marginBottom:"1.75rem",maxWidth:560}}>
            Real decisions rarely arrive with complete information, unlimited time, or a single right answer. This simulator puts you inside an unfolding crisis — and tracks how you think under pressure.
          </div>

          {/* Scenario picker — first choice */}
          <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",color:"#8A96A3",marginBottom:"0.6rem"}}>Choose your scenario</div>
          <ScenarioPicker value={scenarioKey} onChange={setScenarioKey}/>

          {/* Active scenario teaser — updates on selection */}
          <div style={{background:BDC_NAVY,borderRadius:12,padding:"1rem 1.25rem",marginBottom:"1.5rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.4rem"}}>
              <span style={{fontSize:16}}>{scenario.emoji}</span>
              <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",color:"rgba(255,255,255,0.45)"}}>{scenario.label}</span>
            </div>
            <div style={{fontSize:14,fontWeight:400,color:"#fff",lineHeight:1.65,marginBottom:"0.6rem"}}>{scenario.teaser}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {scenario.teaserTags.map(s=>(
                <span key={s} style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.7)",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:50,padding:"2px 9px"}}>{s}</span>
              ))}
            </div>
          </div>

          {/* Objectives — update dynamically with selected scenario */}
          <div style={{...card,marginBottom:"1.25rem"}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",color:"#8A96A3",marginBottom:"1rem"}}>What you'll practise</div>
            {scenario.objectives.map((obj,n)=>(
              <div key={n} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:n<2?"0.75rem":0}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:BDC_RED,color:"#fff",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{n+1}</div>
                <span style={{fontSize:14,color:BDC_NAVY,lineHeight:1.55}}>{obj}</span>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div style={{...card,marginBottom:"1.5rem",padding:"1rem 1.25rem"}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",color:"#8A96A3",marginBottom:"0.75rem"}}>How it works</div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
              {[
                {icon:"💬",text:"Messages arrive in real time as the crisis unfolds across four turns."},
                {icon:"⚡",text:"After each batch, pick a response — or write your own approach."},
                {icon:"📊",text:"A live dashboard tracks time, team capacity, client status, and risk."},
                {icon:"🎯",text:"A radar chart maps your instincts at the end across four dimensions."},
              ].map(({icon,text})=>(
                <div key={text} style={{display:"flex",alignItems:"flex-start",gap:"0.625rem",fontSize:13.5,color:"#4A5568",lineHeight:1.5}}>
                  <span style={{flexShrink:0,fontSize:15}}>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <UnderTheHood scenario={scenario}/>

          <button style={btnP(false)} onClick={start}>Enter the situation</button>
        </>
      )}

      {/* ── Game ── */}
      {phase==="game"&&world&&(
        <>
          <WorldHUD world={world} clockMax={scenario.clockMax}/>
          <ChatThread
            groups={messageGroups}
            animateFrom={animateFrom}
            choices={choices}
            onPick={c=>handleChoice(c.text,c.tag)}
            onFreeSubmit={text=>handleChoice(text,"custom")}
            loading={loading}
            turnNum={turnNum}
            channelName={scenario.channelName}
          />
        </>
      )}

      {/* ── Debrief ── */}
      {phase==="debrief"&&debrief&&world&&(
        <>
          <WorldHUD world={world} clockMax={scenario.clockMax}/>
          <div style={{...card,textAlign:"center",marginBottom:"1rem",background:BDC_NAVY}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:"rgba(255,255,255,0.55)",marginBottom:"0.5rem"}}>Crisis resolved · {scenario.emoji} {scenario.label}</div>
            <div style={{fontSize:14.5,lineHeight:1.75,color:"#fff"}}>{debrief.outcome}</div>
          </div>
          <div style={card}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.09em",color:"#8A96A3",marginBottom:0}}>Your decision profile</div>
            <ProfileRadar axes={debrief.axes}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",marginTop:"0.25rem"}}>
              {debrief.axes.map(a=>(
                <div key={a.name} style={{padding:"0.7rem",borderRadius:10,background:BDC_GRAY,border:`1px solid ${BDC_BORDER}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:600,color:BDC_NAVY}}>{a.name}</span>
                    <span style={{fontSize:12,fontWeight:700,color:BDC_RED}}>{a.score}</span>
                  </div>
                  <div style={{height:3,background:BDC_BORDER,borderRadius:2,marginBottom:5}}>
                    <div style={{height:"100%",width:`${a.score}%`,background:BDC_RED,borderRadius:2,transition:"width 1s ease"}}/>
                  </div>
                  <div style={{fontSize:12,color:"#6B7A8D",lineHeight:1.5}}>{a.insight}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginBottom:"1rem"}}>
            <div style={{...card,marginBottom:0,borderTop:"3px solid #A32D2D",borderRadius:12}}>
              <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:"#A32D2D",marginBottom:4}}>Blind spot</div>
              <div style={{fontSize:14,fontWeight:600,color:BDC_NAVY}}>{debrief.blind_spot}</div>
            </div>
            <div style={{...card,marginBottom:0,borderTop:"3px solid #0F6E56",borderRadius:12}}>
              <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:"#0F6E56",marginBottom:4}}>Strength</div>
              <div style={{fontSize:14,fontWeight:600,color:BDC_NAVY}}>{debrief.strength}</div>
            </div>
          </div>
          <button style={btnG} onClick={reset}>Try another scenario</button>
        </>
      )}
    </div>
  );
}
