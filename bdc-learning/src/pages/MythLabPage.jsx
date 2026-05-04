import { useState } from "react";

// ── Topic — change this one string to deploy for any subject ──────────────────
const DEFAULT_TOPIC = "Service Contracts for Canadian National Defense";

// ── Verdict config ────────────────────────────────────────────────────────────
const V = {
  fact:    { label:"Fact",       icon:"✓", color:"#0F6E56", bg:"#E1F5EE", border:"#9FE1CB", dark:"#085041" },
  myth:    { label:"Myth",       icon:"✗", color:"#993C1D", bg:"#FAECE7", border:"#F0997B", dark:"#4A1B0C" },
  nuanced: { label:"It Depends", icon:"~", color:"#854F0B", bg:"#FAEEDA", border:"#FAC775", dark:"#412402" },
};

const CONFIDENCE = [
  { id:"certain",  label:"Certain",     sub:"×3 points",  pts:3 },
  { id:"likely",   label:"Pretty sure", sub:"×2 points",  pts:2 },
  { id:"guessing", label:"Just guessing",sub:"×1 point",  pts:1 },
];

// ── BDC Brand Tokens ──────────────────────────────────────────────────────────
const BDC_RED    = "#E8192C";
const BDC_NAVY   = "#1A2B4A";
const BDC_RED_L  = "#FDE8EA";
const BDC_GRAY   = "#F4F5F7";
const BDC_BORDER = "#DDE1E7";
const IND        = BDC_RED;
const IND_L      = BDC_RED_L;

// ── Fallback statements if API fails ─────────────────────────────────────────
const FALLBACK = [
  { text:"Small businesses cannot compete for Canadian Department of National Defence (DND) contracts — they are reserved for large defence primes.", verdict:"myth", explanation:"DND and the Canadian Armed Forces actively pursue SME participation through programs like the Industrial and Technological Benefits (ITB) policy and Public Services and Procurement Canada's supplier diversity initiatives. Many contracts are specifically set aside or sub-contracted to smaller firms.", surprise:4 },
  { text:"Winning a DND service contract almost always requires security clearance, which can take years to obtain.", verdict:"nuanced", explanation:"Security clearance requirements vary widely by contract. Many logistics, professional services, and infrastructure contracts require only a basic reliability screening, which can be processed in weeks. Top Secret clearances for sensitive work can take 12–24 months, but they are the exception rather than the rule.", surprise:4 },
  { text:"Canada's defence procurement process is governed by the same rules as standard federal government contracting.", verdict:"fact", explanation:"DND contracts fall under the Federal Contracting Policy and the Government Contracts Regulations, the same framework that applies across all federal departments. The complexity comes not from separate rules but from additional layers: security requirements, export controls under the Export and Import Permits Act, and NATO/ITAR compliance for certain goods.", surprise:3 },
  { text:"Once awarded a DND contract, payment terms are faster than in the private sector because the government is a reliable payer.", verdict:"myth", explanation:"Federal government payment terms are typically Net 30, but complex approval chains, invoice validation requirements, and departmental budget cycles can push actual payment to 60–90 days. Entrepreneurs should model cash flow conservatively and consider supply chain financing options.", surprise:4 },
];

// ── API ───────────────────────────────────────────────────────────────────────
async function fetchStatements(topic) {
  const system = `You generate myth-busting statements for an interactive learning activity targeted at Canadian entrepreneurs exploring opportunities with the Department of National Defence (DND) and the Canadian Armed Forces. The topic is: "${topic}".

Generate exactly 4 statements. Include:
- 2 common myths that Canadian SME owners tend to believe about defence procurement (things that sound true but aren't)
- 1 surprising fact that most entrepreneurs get wrong
- 1 nuanced statement (genuinely "it depends on the situation or contract type")

Rules:
- Ground statements in Canadian federal procurement reality: PSPC, ITB policy, CANNEX, security clearances, Export and Import Permits Act, ITAR, NAFTA/CUSMA, DND Standing Offers, etc.
- Each statement is 1–2 sentences, concrete and specific — no vague generalities
- Explanations should be specific: reference actual programs, timelines, regulations, or dollar thresholds where possible
- Surprise score: how counterintuitive this is to a typical Canadian SME owner (5 = very surprising)

Return ONLY valid JSON with no markdown:
{"statements":[{"text":"...","verdict":"fact|myth|nuanced","explanation":"2–3 sentences with specific evidence, regulation names, or program references","surprise":1-5}]}`;

  const res = await fetch("https://bdc-api.nicholasmcgowan07.workers.dev", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:1800, system, messages:[{role:"user",content:`Generate statements about: ${topic}`}] }),
  });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message||`HTTP ${res.status}`); }
  const d = await res.json(); return d.content[0].text;
}

function pj(raw) { try { return JSON.parse(raw.replace(/```json|```/g,"").trim()); } catch { return null; } }

function scoreFor(correct, confId) {
  if (!correct) return 0;
  return CONFIDENCE.find(c=>c.id===confId)?.pts||1;
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Dots({ label }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,color:"#8A96A3",fontSize:13}}>
      {[0,200,400].map(d=><span key={d} style={{width:6,height:6,borderRadius:"50%",background:"currentColor",display:"inline-block",animation:`bounce 1.2s ${d}ms infinite`}}/>)}
      {label&&<span style={{marginLeft:4}}>{label}</span>}
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ current, total, score, maxScore, streak }) {
  return (
    <div style={{marginBottom:"1.25rem"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
          <span style={{fontSize:13,color:"#8A96A3"}}>{score > 0 ? `${score} pts so far` : "Score points by guessing correctly"}</span>
          {streak>=2&&(
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"2px 10px",borderRadius:20,background:"#FAEEDA",color:"#854F0B",fontSize:12,fontWeight:600}}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1c0 3-2 4-2 6a2 2 0 004 0c0-2-2-3-2-6z" fill="#854F0B"/><path d="M4 8c0 1.5 1 2.5 2 2.5" stroke="#EF9F27" strokeWidth="1" strokeLinecap="round"/></svg>
              {streak} streak
            </div>
          )}
        </div>
        <div style={{fontSize:14,fontWeight:700,color:BDC_RED}}>{score} pts</div>
      </div>
      <div style={{height:5,background:BDC_BORDER,borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${(current/total)*100}%`,background:BDC_RED,borderRadius:3,transition:"width 0.5s ease"}}/>
      </div>
    </div>
  );
}

// ── The main game card ────────────────────────────────────────────────────────
function GameCard({ stmt, index, total, playerVerdict, playerConf, revealed, onVerdict, onConf, onReveal, onNext }) {
  const cfg = V[stmt.verdict];
  const correct = playerVerdict === stmt.verdict;
  const pts = scoreFor(correct, playerConf);
  const canReveal = playerVerdict && playerConf;

  // Card background transitions to verdict color on reveal
  const cardBg = revealed
    ? (correct ? cfg.bg : "#FFFFFF")
    : "#FFFFFF";
  const cardBorder = revealed
    ? (correct ? cfg.border : BDC_BORDER)
    : BDC_BORDER;

  return (
    <div style={{border:`1.5px solid ${cardBorder}`,borderRadius:16,overflow:"hidden",transition:"border-color 0.4s, background 0.4s",background:cardBg,marginBottom:"1rem",boxShadow:"0 1px 4px rgba(26,43,74,0.08)"}}>

      {/* Card number tag */}
      <div style={{padding:"0.875rem 1.25rem 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",color:"#8A96A3"}}>Statement {index+1}</span>
        {revealed&&(
          <div style={{display:"flex",alignItems:"center",gap:6,animation:"popIn 0.3s ease both"}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:correct?cfg.color:"#A32D2D",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                {correct
                  ? <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  : <path d="M3 3l6 6M9 3l-6 6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
                }
              </svg>
            </div>
            {pts>0&&<span style={{fontSize:13,fontWeight:600,color:cfg.color}}>+{pts}</span>}
          </div>
        )}
      </div>

      {/* Statement text */}
      <div style={{padding:"1rem 1.25rem 1.25rem"}}>
        <p style={{fontSize:17,lineHeight:1.65,fontWeight:400,color:BDC_NAVY,margin:0}}>{stmt.text}</p>
      </div>

      {/* Reveal panel — slides in */}
      {revealed&&(
        <div style={{borderTop:`1px solid ${cardBorder}`,padding:"1rem 1.25rem",animation:"slideUp 0.35s ease both"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.625rem",marginBottom:"0.625rem"}}>
            <div style={{padding:"3px 12px",borderRadius:20,background:cfg.color,color:"#fff",fontSize:12,fontWeight:600,letterSpacing:"0.04em"}}>
              {cfg.icon} {cfg.label}
            </div>
            {!correct&&(
              <div style={{padding:"3px 10px",borderRadius:20,background:"#FCEBEB",color:"#A32D2D",fontSize:12,fontWeight:500}}>
                You said: {V[playerVerdict]?.label}
              </div>
            )}
          </div>
          <p style={{fontSize:13.5,lineHeight:1.7,color:"#4A5568",margin:0}}>{stmt.explanation}</p>
          {stmt.surprise>=4&&(
            <div style={{marginTop:"0.75rem",display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#854F0B",fontWeight:500}}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 9l-3 1.5.5-3.5L1 4.5l3.5-.5z" fill="#EF9F27"/></svg>
              Commonly misunderstood
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes popIn{from{transform:scale(0.5);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}

// ── Verdict buttons ───────────────────────────────────────────────────────────
function VerdictButtons({ selected, revealed, onSelect }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.625rem",marginBottom:"0.875rem"}}>
      {Object.entries(V).map(([key,cfg])=>{
        const active=selected===key;
        return (
          <button key={key} onClick={()=>!revealed&&onSelect(key)} disabled={revealed}
            style={{
              padding:"1rem 0.5rem",
              borderRadius:14,
              border:`2px solid ${active?cfg.color:BDC_BORDER}`,
              background:active?cfg.color:"#FFFFFF",
              cursor:revealed?"default":"pointer",
              fontFamily:"inherit",
              transition:"all 0.18s",
              textAlign:"center",
              opacity:revealed&&!active?0.35:1,
              boxShadow:active?`0 4px 12px ${cfg.color}40`:"0 1px 4px rgba(26,43,74,0.07)",
              transform:active?"translateY(-1px)":"none",
            }}>
            <div style={{fontSize:22,fontWeight:700,color:active?"#fff":cfg.color,marginBottom:4,lineHeight:1}}>{cfg.icon}</div>
            <div style={{fontSize:13,fontWeight:700,color:active?"#fff":"#4A5568",letterSpacing:"0.02em"}}>{cfg.label}</div>
          </button>
        );
      })}
    </div>
  );
}

// ── Confidence buttons ────────────────────────────────────────────────────────
function ConfidenceButtons({ selected, revealed, onSelect }) {
  return (
    <div style={{animation:"slideUp 0.25s ease both",marginBottom:"0.75rem"}}>
      <div style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",color:"#8A96A3",marginBottom:"0.5rem"}}>How confident are you?</div>
      <div style={{display:"flex",gap:"0.4rem"}}>
        {CONFIDENCE.map(c=>{
          const active=selected===c.id;
          return (
            <button key={c.id} onClick={()=>!revealed&&onSelect(c.id)} disabled={revealed}
              style={{flex:1,padding:"0.55rem 0.25rem",borderRadius:50,border:`1.5px solid ${active?BDC_RED:BDC_BORDER}`,background:active?BDC_RED_L:"#FFFFFF",cursor:revealed?"default":"pointer",fontFamily:"inherit",transition:"all 0.13s",textAlign:"center",opacity:revealed&&!active?0.4:1}}>
              <div style={{fontSize:13,fontWeight:active?700:400,color:active?BDC_RED:BDC_NAVY,marginBottom:2}}>{c.label}</div>
              <div style={{fontSize:10,color:active?BDC_RED:"#8A96A3"}}>{c.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Summary screen ────────────────────────────────────────────────────────────
function Summary({ topic, answers, score, maxStreak, onRestart, onNewTopic }) {
  const total = answers.length*3;
  const pct = Math.round((score/total)*100);
  const correct = answers.filter(a=>a.correct).length;
  const overconfident = answers.filter(a=>!a.correct&&a.playerConf==="certain");
  const surprising = [...answers].sort((a,b)=>(b.surprise||0)-(a.surprise||0)).slice(0,2);
  const grade = pct>=80?"Excellent":pct>=60?"Solid":pct>=40?"Room to grow":"Lots to learn";
  const gradeColor = pct>=80?"#0F6E56":pct>=60?IND:pct>=40?"#854F0B":"#993C1D";
  const wrongVerdict = answers.reduce((acc,a)=>{
    if (!a.correct) { acc[a.playerVerdict]=(acc[a.playerVerdict]||0)+1; }
    return acc;
  }, {});
  const bias = Object.entries(wrongVerdict).sort((a,b)=>b[1]-a[1])[0]?.[0];

  return (
    <div style={{animation:"slideUp 0.4s ease both"}}>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Score hero */}
      <div style={{textAlign:"center",padding:"2rem 1.5rem",background:"#FFFFFF",border:`1px solid ${BDC_BORDER}`,borderRadius:16,marginBottom:"1rem",boxShadow:"0 2px 8px rgba(26,43,74,0.08)"}}>
        <div style={{fontSize:56,fontWeight:700,lineHeight:1,color:gradeColor,marginBottom:6}}>{pct}<span style={{fontSize:28}}>%</span></div>
        <div style={{fontSize:18,fontWeight:600,color:BDC_NAVY,marginBottom:4}}>{grade}</div>
        <div style={{fontSize:13,color:"#8A96A3"}}>{correct} of {answers.length} correct · {score} of {total} points · best streak {maxStreak}</div>
      </div>

      {/* Calibration insight */}
      {overconfident.length>0&&(
        <div style={{background:"#FAEEDA",border:"1px solid #FAC775",borderRadius:12,padding:"1rem 1.25rem",marginBottom:"0.875rem"}}>
          <div style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",color:"#854F0B",marginBottom:"0.4rem"}}>Confidence gap</div>
          <div style={{fontSize:13.5,lineHeight:1.65,color:"#412402"}}>
            You were certain about {overconfident.length} statement{overconfident.length>1?"s":""} you got wrong.{bias?" You tended to call things a "+V[bias]?.label+" when they weren't.":""} That's where the real learning is.
          </div>
        </div>
      )}

      {/* Most surprising reveals */}
      {surprising.length>0&&(
        <div style={{background:"#FFFFFF",border:`1px solid ${BDC_BORDER}`,borderRadius:12,padding:"1rem 1.25rem",marginBottom:"1rem",boxShadow:"0 1px 4px rgba(26,43,74,0.06)"}}>
          <div style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",color:"#8A96A3",marginBottom:"0.875rem"}}>Most surprising</div>
          {surprising.map((a,i)=>(
            <div key={i} style={{display:"flex",gap:"0.75rem",marginBottom:i<surprising.length-1?"0.875rem":0,paddingBottom:i<surprising.length-1?"0.875rem":0,borderBottom:i<surprising.length-1?`1px solid ${BDC_BORDER}`:"none"}}>
              <div style={{width:28,height:28,borderRadius:8,background:V[a.verdict]?.bg,border:`1px solid ${V[a.verdict]?.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,fontWeight:700,color:V[a.verdict]?.color}}>{V[a.verdict]?.icon}</div>
              <div>
                <div style={{fontSize:13,fontWeight:400,color:BDC_NAVY,lineHeight:1.5,marginBottom:3}}>{a.text}</div>
                <div style={{fontSize:12,color:"#8A96A3",lineHeight:1.5}}>{a.explanation}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verdict breakdown */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.5rem",marginBottom:"1.25rem"}}>
        {Object.entries(V).map(([key,cfg])=>{
          const count=answers.filter(a=>a.verdict===key).length;
          const got=answers.filter(a=>a.verdict===key&&a.correct).length;
          return (
            <div key={key} style={{background:cfg.bg,border:`1px solid ${cfg.border}`,borderRadius:10,padding:"0.75rem",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:700,color:cfg.color}}>{got}/{count}</div>
              <div style={{fontSize:11,color:cfg.dark,fontWeight:500}}>{cfg.label}s</div>
            </div>
          );
        })}
      </div>

      <div style={{display:"flex",gap:"0.625rem"}}>
        <button onClick={onRestart} style={{flex:1,padding:"0.7rem",borderRadius:50,border:"none",background:BDC_RED,color:"#fff",cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.01em"}}>
          Play again — same topic
        </button>
        <button onClick={onNewTopic} style={{flex:1,padding:"0.7rem",borderRadius:50,border:`1.5px solid ${BDC_NAVY}`,background:"transparent",color:BDC_NAVY,cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:"inherit"}}>
          Try a different topic
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MythLabPage() {
  const [phase, setPhase]=useState("topic");
  const [topicInput, setTopicInput]=useState(DEFAULT_TOPIC);
  const [statements, setStatements]=useState([]);
  const [current, setCurrent]=useState(0);
  const [playerVerdict, setPlayerVerdict]=useState(null);
  const [playerConf, setPlayerConf]=useState(null);
  const [revealed, setRevealed]=useState(false);
  const [answers, setAnswers]=useState([]);
  const [score, setScore]=useState(0);
  const [streak, setStreak]=useState(0);
  const [maxStreak, setMaxStreak]=useState(0);
  const [error, setError]=useState(null);
  const [loading, setLoading]=useState(false);

  const TOPICS = ["Security Clearances & Reliability Screening","Bidding on Federal RFPs","Industrial & Technological Benefits Policy","Export Controls & ITAR Compliance","Standing Offers & Supply Arrangements","DND Subcontracting Opportunities","Payment Terms & Cash Flow in Gov't Contracts","Intellectual Property in Defence Contracts"];

  const begin=async(topic)=>{
    setLoading(true); setError(null); setPhase("loading");
    try {
      const raw=await fetchStatements(topic||topicInput);
      const parsed=pj(raw);
      const stmts=parsed?.statements?.length>=3?parsed.statements:FALLBACK;
      setStatements(stmts);
      setCurrent(0); setPlayerVerdict(null); setPlayerConf(null);
      setRevealed(false); setAnswers([]); setScore(0); setStreak(0); setMaxStreak(0);
      setPhase("play");
    } catch(e) {
      setStatements(FALLBACK);
      setCurrent(0); setPlayerVerdict(null); setPlayerConf(null);
      setRevealed(false); setAnswers([]); setScore(0); setStreak(0); setMaxStreak(0);
      setPhase("play");
    }
    setLoading(false);
  };

  const stmt=statements[current];

  const handleReveal=()=>{
    const correct=playerVerdict===stmt.verdict;
    const pts=scoreFor(correct,playerConf);
    const newStreak=correct?streak+1:0;
    setRevealed(true);
    setScore(s=>s+pts);
    setStreak(newStreak);
    setMaxStreak(m=>Math.max(m,newStreak));
    setAnswers(prev=>[...prev,{...stmt,playerVerdict,playerConf,correct,pts}]);
  };

  const handleNext=()=>{
    if (current>=statements.length-1) { setPhase("done"); }
    else {
      setCurrent(c=>c+1);
      setPlayerVerdict(null); setPlayerConf(null); setRevealed(false);
    }
  };

  const wrap={fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",maxWidth:600,margin:"0 auto",padding:"1.5rem 1rem",color:BDC_NAVY};
  const btnP={display:"flex",alignItems:"center",justifyContent:"center",width:"100%",padding:"0.75rem",borderRadius:50,border:"none",background:BDC_RED,color:"#fff",cursor:"pointer",fontSize:15,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.01em"};

  // ── Topic screen ────────────────────────────────────────────────────────────
  if (phase==="topic") return (
    <div style={wrap}>
      <div style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:BDC_RED,background:BDC_RED_L,padding:"3px 12px",borderRadius:20,marginBottom:"0.75rem"}}>
        Myth Lab · catalog entry 3
      </div>
      <div style={{fontSize:26,fontWeight:700,marginBottom:"0.4rem",lineHeight:1.2,color:BDC_NAVY}}>What do you actually know?</div>
      <div style={{fontSize:14,color:"#4A5568",lineHeight:1.7,marginBottom:"1.5rem"}}>
        The AI generates a set of statements — some facts, some myths, some "it depends." You classify each one and bet your confidence. The reveal will surprise you.
      </div>

      <div style={{background:"#FFFFFF",border:`1px solid ${BDC_BORDER}`,borderRadius:14,padding:"1.25rem",marginBottom:"1rem",boxShadow:"0 2px 8px rgba(26,43,74,0.07)"}}>
        <label style={{fontSize:12,fontWeight:600,color:"#8A96A3",marginBottom:"0.5rem",display:"block",textTransform:"uppercase",letterSpacing:"0.06em"}}>Topic</label>
        <input value={topicInput} onChange={e=>setTopicInput(e.target.value)}
          style={{width:"100%",border:`1.5px solid ${BDC_BORDER}`,borderRadius:50,padding:"0.7rem 1.1rem",fontFamily:"inherit",fontSize:15,color:BDC_NAVY,background:"#FFFFFF",outline:"none",boxSizing:"border-box",marginBottom:"1rem"}}
          placeholder="Enter any topic…" onKeyDown={e=>e.key==="Enter"&&topicInput.trim()&&begin()}/>
        <button onClick={()=>topicInput.trim()&&begin()} style={{...btnP,opacity:!topicInput.trim()?0.45:1}} disabled={!topicInput.trim()}>
          Generate myths
        </button>
      </div>

      <div style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",color:"#8A96A3",marginBottom:"0.5rem"}}>Try one of these</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
        {TOPICS.map(t=>(
          <button key={t} onClick={()=>{setTopicInput(t);begin(t);}}
            style={{padding:"0.4rem 0.875rem",borderRadius:20,border:`1px solid ${BDC_BORDER}`,background:"#FFFFFF",cursor:"pointer",fontSize:13,color:"#4A5568",fontFamily:"inherit",transition:"all 0.13s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=BDC_RED;e.currentTarget.style.color=BDC_RED;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=BDC_BORDER;e.currentTarget.style.color="#4A5568";}}>
            {t}
          </button>
        ))}
      </div>

      {error&&<div style={{marginTop:"1rem",fontSize:13,color:"#A32D2D"}}>{error}</div>}
    </div>
  );

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (phase==="loading") return (
    <div style={{...wrap,paddingTop:"4rem",textAlign:"center"}}>
      <div style={{marginBottom:"1rem"}}><Dots label=""/></div>
      <div style={{fontSize:15,color:"#4A5568"}}>Generating myths about <strong>{topicInput}</strong>…</div>
    </div>
  );

  // ── Play screen ─────────────────────────────────────────────────────────────
  if (phase==="play"&&stmt) return (
    <div style={wrap}>
      {/* BDC branded header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.75rem",paddingBottom:"1.25rem",borderBottom:`2px solid ${BDC_BORDER}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:4,height:28,background:BDC_RED,borderRadius:2}}/>
          <div>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:BDC_RED,lineHeight:1}}>Myth Lab</div>
            <div style={{fontSize:13,fontWeight:500,color:BDC_NAVY,marginTop:2,lineHeight:1}}>{topicInput}</div>
          </div>
        </div>
        <div style={{fontSize:12,color:"#8A96A3",fontWeight:500}}>{current+1} of {statements.length}</div>
      </div>

      <ProgressBar current={current} total={statements.length} score={score} maxScore={statements.length*3} streak={streak}/>

      <GameCard
        stmt={stmt} index={current} total={statements.length}
        playerVerdict={playerVerdict} playerConf={playerConf} revealed={revealed}
        onVerdict={setPlayerVerdict} onConf={setPlayerConf}
        onReveal={handleReveal} onNext={handleNext}/>

      {!revealed&&(
        <>
          <VerdictButtons selected={playerVerdict} revealed={revealed} onSelect={setPlayerVerdict}/>
          {playerVerdict&&(
            <ConfidenceButtons selected={playerConf} revealed={revealed} onSelect={setPlayerConf}/>
          )}
          {playerVerdict&&playerConf&&(
            <button onClick={handleReveal} style={{...btnP,animation:"slideUp 0.2s ease both"}}>
              Reveal
            </button>
          )}
        </>
      )}

      {revealed&&(
        <button onClick={handleNext} style={{...btnP,animation:"slideUp 0.2s ease both",background:current>=statements.length-1?"#0F6E56":IND}}>
          {current>=statements.length-1?"See my results →":"Next statement →"}
        </button>
      )}

      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );

  // ── Done screen ─────────────────────────────────────────────────────────────
  if (phase==="done") return (
    <div style={wrap}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"1.75rem",paddingBottom:"1.25rem",borderBottom:`2px solid ${BDC_BORDER}`}}>
        <div style={{width:4,height:28,background:BDC_RED,borderRadius:2}}/>
        <div>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:BDC_RED,lineHeight:1}}>Myth Lab</div>
          <div style={{fontSize:13,fontWeight:500,color:BDC_NAVY,marginTop:2,lineHeight:1}}>Results</div>
        </div>
      </div>
      <Summary
        topic={topicInput} answers={answers} score={score} maxStreak={maxStreak}
        onRestart={()=>begin(topicInput)}
        onNewTopic={()=>setPhase("topic")}/>
    </div>
  );

  return null;
}
