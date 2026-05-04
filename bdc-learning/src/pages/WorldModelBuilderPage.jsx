// v10 — window mouse listeners, clean click-select vs drag
import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";

// ── BDC Brand ─────────────────────────────────────────────────────────────────
const RED    = "#E8192C";   // BDC Red
const RED_L  = "rgba(232,25,44,0.07)";
const NAVY   = "#1A2B4A";   // BDC Navy
const WHITE  = "#FFFFFF";
const GRAY   = "#F4F5F7";
const GRAY2  = "#EEF0F3";
const BDR    = "#DDE1E7";
const BDR2   = "#C5CDD8";
const TEXT   = "#1A2B4A";
const TEXTM  = "#4A5568";
const TEXTD  = "#9AA5B4";
const BLUE   = "#1A4FAA";
const GREEN  = "#0A7055";
const WARN   = "#C0392B";
const FONT   = "'Helvetica Neue',Helvetica,Arial,sans-serif";

// ── Actors — Canadian Defence Procurement ecosystem ─────────────────────────
const ACTORS = [
  { id:"your-company",  label:"Your Company",                short:"You",          icon:"🏢", color:"#3B82F6" },
  { id:"dnd",           label:"DND",                         short:"DND",          icon:"🎯", color:"#E8192C" },
  { id:"pspc",          label:"PSPC",                        short:"PSPC",         icon:"⚖️", color:"#7C3AED" },
  { id:"contracting-officer", label:"Contracting Officer",   short:"CO",           icon:"📋", color:"#059669" },
  { id:"project-director",    label:"Project Director",      short:"PD",           icon:"📊", color:"#D97706" },
  { id:"prime-contractor",    label:"Prime Contractor",      short:"Prime",        icon:"🔑", color:"#DB2777" },
  { id:"subcontractor",       label:"Subcontractor",         short:"Sub",          icon:"🔧", color:"#4F46E5" },
  { id:"caf",           label:"CAF End User",                short:"CAF",          icon:"⚔️", color:"#DC2626" },
  { id:"ised",          label:"ISED",                        short:"ISED",         icon:"💡", color:"#0891B2" },
  { id:"tbs",           label:"Treasury Board",              short:"TBS",          icon:"🏛️", color:"#65A30D" },
  { id:"pac",           label:"Procurement Assistance Canada",short:"PAC",         icon:"🏁", color:"#0369A1" },
  { id:"drdc",          label:"DRDC",                        short:"DRDC",         icon:"🔬", color:"#7C3AED" },
  { id:"cse",           label:"CSE",                         short:"CSE",          icon:"🔐", color:"#0891B2" },
  { id:"parliament",    label:"Parliament / Budget",         short:"Budget",       icon:"💰", color:"#B45309" },
  { id:"supplier",      label:"Supplier / Vendor",           short:"Supplier",     icon:"📦", color:"#64748B" },
  { id:"jag",           label:"Judge Advocate General",      short:"JAG",          icon:"📜", color:"#7C3AED" },
];

// ── Intro steps ───────────────────────────────────────────────────────────────
const STEPS = [
  { icon:"🗺️", eyebrow:"Before you begin",  title:"Map the ecosystem as you understand it now",  body:"This isn't a test. There's no right answer. We want to see your current mental model of Canadian defence procurement — before any instruction — so we can route you to exactly what you need.", hint:null },
  { icon:"👆", eyebrow:"Step 1 of 3",        title:"Place the actors you know",                   body:"Tap actor chips in the strip at the top to drop them on the canvas. Only place the ones you genuinely recognise.", hint:"Aim for 5–8 actors. You don't need all 16." },
  { icon:"↔️", eyebrow:"Step 2 of 3",        title:"Draw the connections between them",           body:"Tap Connect, then tap a source actor, then a target. Label what flows between them — a contract, authority, funding, oversight.", hint:"Aim for 4–6 connections for a meaningful diagnosis." },
  { icon:"🔍", eyebrow:"Step 3 of 3",        title:"What you leave out matters most",             body:"Don't look anything up. Don't try to make the map look complete. Gaps are useful data — they tell us exactly where your instruction needs to begin.", hint:"Honest gaps beat a complete-looking map." },
];

// ── Canvas geometry ───────────────────────────────────────────────────────────
const NW = 144, NH = 52;
let _nid = 0, _cid = 0;
const cx = n => n.x + NW / 2;
const cy = n => n.y + NH / 2;
function bez(x1,y1,x2,y2){ const d=Math.abs(x2-x1)*0.5; return `M${x1},${y1} C${x1+d},${y1} ${x2-d},${y2} ${x2},${y2}`; }
function getPos(e,rect){ const s=e.touches?.[0]??e.changedTouches?.[0]??e; return {x:s.clientX-rect.left,y:s.clientY-rect.top}; }
function clamp(v,lo,hi){ return Math.max(lo,Math.min(hi,v)); }

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({h=56,delay=0}){
  return <div style={{height:h,borderRadius:8,background:`linear-gradient(90deg,${GRAY} 25%,${GRAY2} 50%,${GRAY} 75%)`,backgroundSize:"200% 100%",animation:`shimmer 1.6s ${delay}ms ease infinite`}}/>;
}

// ── Intro screen ──────────────────────────────────────────────────────────────
function IntroScreen({step,onNext,onBack}){
  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",padding:"0 1.75rem",background:WHITE,animation:"fadeUp 0.3s ease"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",gap:"1.25rem"}}>
        <div style={{fontSize:60,lineHeight:1}}>{s.icon}</div>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:RED}}>{s.eyebrow}</div>
        <div style={{fontSize:22,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1.25,maxWidth:280,color:NAVY}}>{s.title}</div>
        <div style={{fontSize:14,color:TEXTM,lineHeight:1.8,maxWidth:300}}>{s.body}</div>
        {s.hint && (
          <div style={{fontSize:12,color:RED,fontWeight:600,background:RED_L,borderRadius:20,padding:"6px 16px",border:"1px solid rgba(232,25,44,0.2)"}}>
            {s.hint}
          </div>
        )}
      </div>
      <div style={{paddingBottom:"2.75rem",paddingTop:"1.25rem"}}>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:"1.5rem"}}>
          {STEPS.map((_,i)=>(
            <div key={i} style={{height:6,borderRadius:3,background:i===step?RED:BDR2,width:i===step?22:6,transition:"all 0.3s ease"}}/>
          ))}
        </div>
        <button onClick={onNext}
          style={{width:"100%",padding:"0.95rem",borderRadius:8,border:"none",background:RED,color:WHITE,fontSize:14,fontWeight:700,fontFamily:FONT,cursor:"pointer",boxShadow:"0 4px 16px rgba(232,25,44,0.28)"}}>
          {isLast ? "Start mapping →" : "Continue →"}
        </button>
        {step > 0 && (
          <button onClick={onBack}
            style={{width:"100%",marginTop:10,padding:"0.65rem",borderRadius:8,border:"none",background:"transparent",color:TEXTD,fontSize:13,fontFamily:FONT,cursor:"pointer"}}>
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────
export default function WorldModelBuilderPage(){
  const [phase,     setPhase]     = useState("intro");
  const [introStep, setIntroStep] = useState(0);

  // useLayoutEffect runs before paint — prevents any flash of canvas before intro
  useLayoutEffect(()=>{ setPhase("intro"); setIntroStep(0); },[]);
  const [nodes,     setNodes]     = useState([]);
  const [conns,     setConns]     = useState([]);
  const [mode,      setMode]      = useState("idle");
  const [fromId,    setFromId]    = useState(null);
  const [mouse,     setMouse]     = useState({x:0,y:0});
  const [pending,   setPending]   = useState(null);
  const [connLabel, setConnLabel] = useState("");
  const [drag,      setDrag]      = useState(null);
  const [selConn,   setSelConn]   = useState(null);
  const [selNode,   setSelNode]   = useState(null);
  const [analysis,  setAnalysis]  = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [sheet,     setSheet]     = useState(false);

  const canvasRef      = useRef(null);
  const labelRef       = useRef(null);
  const didDrag        = useRef(false);
  const dragRef        = useRef(null);
  const pendingDragRef = useRef(null); // mousedown intent, not yet committed
  const modeRef        = useRef("idle");
  const fromIdRef      = useRef(null);
  const nodesRef       = useRef([]);

  useEffect(()=>{ dragRef.current  = drag;   },[drag]);
  useEffect(()=>{ modeRef.current  = mode;   },[mode]);
  useEffect(()=>{ fromIdRef.current= fromId; },[fromId]);
  useEffect(()=>{ nodesRef.current = nodes;  },[nodes]);

  // Global touch listeners — handles both node drag and draw-to-connect
  useEffect(()=>{
    const onTM = (e)=>{
      const rect = canvasRef.current?.getBoundingClientRect();
      if(!rect) return;
      const {x,y} = getPos(e,rect);
      // Node drag
      if(dragRef.current){
        e.preventDefault();
        setMouse({x,y});
        didDrag.current = true;
        setNodes(prev=>prev.map(n=>
          n.id===dragRef.current.id
            ? {...n, x:clamp(x-dragRef.current.ox,0,rect.width-NW), y:clamp(y-dragRef.current.oy,0,rect.height-NH)}
            : n
        ));
        return;
      }
      // Draw-to-connect: track finger position for ghost line
      if(modeRef.current==="drawing"){
        e.preventDefault();
        setMouse({x,y});
      }
    };
    const onTE = (e)=>{
      // End node drag
      if(dragRef.current){ setDrag(null); return; }
      // End draw-to-connect — check what's under the finger
      if(modeRef.current==="drawing"){
        const touch = e.changedTouches[0];
        // Temporarily hide pointer-events on SVG overlay to hit nodes beneath
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        let target = el;
        while(target && !target.dataset.nodeid) target = target.parentElement;
        const targetId = target?.dataset?.nodeid;
        if(targetId && targetId !== fromIdRef.current){
          // Complete connection
          const srcId = fromIdRef.current;
          const allNodes = nodesRef.current;
          const allConns = (() => { let c; setConns(p=>{c=p;return p;}); return c; })();
          setFromId(null);
          setMode("idle");
          // Use setTimeout to let state settle before opening pending
          const fn = allNodes.find(n=>n.id===srcId);
          const tn = allNodes.find(n=>n.id===targetId);
          if(fn&&tn){
            const rect2 = canvasRef.current?.getBoundingClientRect()??{width:320,height:400};
            setPending({from:srcId,to:targetId,
              mx:clamp((cx(fn)+cx(tn))/2,100,rect2.width-100),
              my:clamp((cy(fn)+cy(tn))/2,80,rect2.height-120)});
            setConnLabel("");
          }
        } else {
          setMode("idle");
          setFromId(null);
        }
      }
    };
    window.addEventListener("touchmove",onTM,{passive:false});
    window.addEventListener("touchend",onTE);
    return ()=>{ window.removeEventListener("touchmove",onTM); window.removeEventListener("touchend",onTE); };
  },[]);

  useEffect(()=>{ if(pending && labelRef.current) labelRef.current.focus(); },[pending]);

  const addNode = (actor)=>{
    if(nodes.find(n=>n.actorId===actor.id)) return;
    const rect = canvasRef.current?.getBoundingClientRect()??{width:320,height:400};
    const x = 20+Math.random()*Math.max(20,rect.width-NW-40);
    const y = 20+Math.random()*Math.max(20,rect.height-NH-40);
    setNodes(prev=>[...prev,{id:`n${_nid++}`,actorId:actor.id,label:actor.label,icon:actor.icon,color:actor.color,x,y}]);
  };

  const removeNode = (id)=>{
    setNodes(prev=>prev.filter(n=>n.id!==id));
    setConns(prev=>prev.filter(c=>c.from!==id&&c.to!==id));
    if(fromId===id){setFromId(null);setMode("idle");}
    setSelNode(null);
  };

  const removeConn = (id)=>{ setConns(prev=>prev.filter(c=>c.id!==id)); setSelConn(null); };

  const DRAG_THRESHOLD = 6;

  // ── Desktop mouse — all on window so mouseup outside canvas never gets lost ──
  useEffect(()=>{
    const onMM = (e)=>{
      const rect = canvasRef.current?.getBoundingClientRect();
      if(!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMouse({x,y}); // always track for ghost line

      if(modeRef.current==="drawing") return; // ghost line only, no drag

      const pd = pendingDragRef.current;
      if(!pd) return;

      const dist = Math.hypot(x - pd.startX, y - pd.startY);
      if(dist > DRAG_THRESHOLD){
        // Commit to drag
        if(!dragRef.current){
          setDrag({id:pd.node.id, ox:pd.ox, oy:pd.oy});
          didDrag.current = true;
        }
        setNodes(prev=>prev.map(n=>
          n.id===pd.node.id
            ? {...n, x:clamp(x-pd.ox,0,rect.width-NW), y:clamp(y-pd.oy,0,rect.height-NH)}
            : n
        ));
      }
    };

    const onMU = (e)=>{
      if(modeRef.current==="drawing") return; // handled by node mouseup
      const wasDragging = didDrag.current;
      pendingDragRef.current = null;
      setDrag(null);
      didDrag.current = false;
      if(wasDragging){
        // Release after drag — deselect
        setSelNode(null);
      }
    };

    window.addEventListener("mousemove", onMM);
    window.addEventListener("mouseup",   onMU);
    return ()=>{
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("mouseup",   onMU);
    };
  },[]);

  // Touch: commit drag immediately (no threshold needed — browser handles scroll intent)
  const startDrag = (e, node)=>{
    e.stopPropagation();
    if(modeRef.current==="drawing") return;
    didDrag.current = false;
    const rect = canvasRef.current?.getBoundingClientRect();
    if(!rect) return;
    const {x,y} = getPos(e,rect);
    setDrag({id:node.id, ox:x-node.x, oy:y-node.y});
    setSelNode(node.id);
    setSelConn(null);
  };

  // Desktop mousedown on node body — record intent only, select immediately
  const onNodeMouseDown = (e, node)=>{
    if(e.button !== 0) return;
    e.stopPropagation();
    if(modeRef.current==="drawing") return;
    didDrag.current = false;
    const rect = canvasRef.current?.getBoundingClientRect();
    if(!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pendingDragRef.current = {node, ox:x-node.x, oy:y-node.y, startX:x, startY:y};
    setSelNode(node.id); // select on mousedown — clean and instant
    setSelConn(null);
  };

  // Desktop mouse: complete connection on mouseup over a node
  const onNodeMouseUp = (e,node)=>{
    if(mode!=="drawing") return;
    e.stopPropagation();
    if(!fromId||fromId===node.id){ setMode("idle"); setFromId(null); return; }
    const fn = nodes.find(n=>n.id===fromId);
    const rect = canvasRef.current?.getBoundingClientRect()??{width:320,height:400};
    setPending({from:fromId,to:node.id,
      mx:clamp((cx(fn)+cx(node))/2,100,rect.width-100),
      my:clamp((cy(fn)+cy(node))/2,80,rect.height-120)});
    setConnLabel("");
    setFromId(null);
    setMode("idle");
  };



  const confirmConn = ()=>{
    if(!pending||!connLabel.trim()) return;
    setConns(prev=>[...prev,{id:`c${_cid++}`,from:pending.from,to:pending.to,label:connLabel.trim()}]);
    setPending(null); setConnLabel("");
  };

  const analyse = async()=>{
    if(nodes.length<3||conns.length<2) return;
    setLoading(true); setError(null); setAnalysis(null); setSheet(true);
    const placed  = nodes.map(n=>`- ${n.label}`).join("\n");
    const drawn   = conns.map(c=>{ const f=nodes.find(n=>n.id===c.from),t=nodes.find(n=>n.id===c.to); return `  ${f?.label} → ${t?.label}: "${c.label}"`; }).join("\n");
    const omitted = ACTORS.filter(a=>!nodes.find(n=>n.actorId===a.id)).map(a=>`- ${a.label}`).join("\n");
    try{
      const res = await fetch("https://bdc-api.nicholasmcgowan07.workers.dev",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:900,
          system:`You are an expert instructional designer diagnosing a Canadian entrepreneur's mental model of the Canadian defence procurement ecosystem before instruction begins. The ecosystem centres on DND (the requirement), PSPC (the contracting authority), and the Industrial and Technological Benefits (ITB) obligations managed by ISED. Key actors also include the CAF as end user, Treasury Board for approvals, Procurement Assistance Canada for SME support, DRDC for R&D procurement, CSE for cybersecurity, and the Judge Advocate General. Be direct and clinical. Reference their actual connections and omissions specifically — note where they may be importing US procurement logic (e.g. confusing PSPC with DCAA, or assuming a single-agency model)\n\nReturn ONLY valid JSON:\n{"strength":"1-2 sentences on what their map reveals they understand. Reference actual connections.","criticalError":"The single most significant structural error, referencing the specific connection or missing logic.","blindspot":"Most revealing omission and what it signals about their mental model of the Canadian system.","routingRec":"Which domain they need first (procurement structure, ITB obligations, CAF relationship, compliance) and exactly why.","readinessScore":0,"readinessLabel":"3-5 word characterization"}`,
          messages:[{role:"user",content:`ACTORS:\n${placed}\n\nCONNECTIONS:\n${drawn}\n\nOMITTED:\n${omitted}`}],
        }),
      });
      const data = await res.json();
      if(data.error) throw new Error(data.error.message);
      setAnalysis(JSON.parse(data.content[0].text.replace(/```json|```/g,"").trim()));
    }catch(e){setError(e.message);}
    setLoading(false);
  };

  const reset = ()=>{
    setPhase("intro"); setIntroStep(0); setNodes([]); setConns([]); setMode("idle");
    setFromId(null); setPending(null); setSelNode(null); setSelConn(null);
    setAnalysis(null); setSheet(false); setError(null);
  };

  const placedIds  = new Set(nodes.map(n=>n.actorId));
  const fromNode   = fromId ? nodes.find(n=>n.id===fromId) : null;
  const canAnalyse = nodes.length>=3 && conns.length>=2 && !loading;
  const scoreColor = analysis ? (analysis.readinessScore>=70?GREEN:analysis.readinessScore>=40?"#B45309":WARN) : RED;

  return (
    <div style={{fontFamily:FONT,background:WHITE,height:"100dvh",display:"flex",flexDirection:"column",color:TEXT,overflow:"hidden"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pop{0%{transform:scale(0.85);opacity:0}70%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .chip:active{opacity:0.6;transform:scale(0.95)}
        input:focus{outline:none;border-color:${RED}!important}
        button:active{transform:scale(0.97)}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:${BDR2};border-radius:2px}
      `}</style>

      {/* ── Intro ── */}
      {phase==="intro" && (
        <IntroScreen
          step={introStep}
          onNext={()=>introStep<STEPS.length-1 ? setIntroStep(s=>s+1) : setPhase("mapping")}
          onBack={()=>setIntroStep(s=>s-1)}
        />
      )}

      {/* ── Mapping ── */}
      {phase==="mapping" && <>

        {/* Header */}
        <header style={{height:52,flexShrink:0,background:WHITE,borderBottom:`1px solid ${BDR}`,display:"flex",alignItems:"center",padding:"0 14px",gap:8}}>
          {/* BDC wordmark area */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:8,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:RED,marginBottom:1}}>BDC · Canadian Defence Procurement</div>
            <div style={{fontSize:14,fontWeight:700,color:NAVY,letterSpacing:"-0.01em",lineHeight:1.1}}>World Model Builder</div>
          </div>

          {/* Mode status */}
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,fontWeight:600,color:mode==="connecting"?RED:TEXTD,flexShrink:0}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:mode==="connecting"?RED:TEXTD,flexShrink:0,animation:mode==="connecting"?"pulse 1.2s ease infinite":"none"}}/>
            {mode==="drawing"
              ? <span style={{display:"flex",alignItems:"center",gap:6}}>Drawing… <span onClick={()=>{setMode("idle");setFromId(null);}} style={{color:TEXTD,cursor:"pointer",fontWeight:400}}>✕ cancel</span></span>
              : `${nodes.length} actors · ${conns.length} connections`}
          </div>



          {/* Analyse */}
          <button onClick={analyse} disabled={!canAnalyse}
            style={{flexShrink:0,padding:"0 12px",height:34,borderRadius:6,border:"none",background:canAnalyse?RED:BDR,color:canAnalyse?WHITE:TEXTD,fontSize:11,fontWeight:700,fontFamily:FONT,cursor:canAnalyse?"pointer":"default",transition:"all 0.2s"}}>
            {loading?"…":"Analyse"}
          </button>
        </header>

        {/* Actor grid — 3-column wrap */}
        <div style={{flexShrink:0,background:GRAY,borderBottom:`1px solid ${BDR}`,padding:"8px 10px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5}}>
          {ACTORS.map(actor=>{
            const placed = placedIds.has(actor.id);
            return (
              <button key={actor.id} onClick={()=>addNode(actor)} disabled={placed} className="chip"
                style={{display:"flex",alignItems:"center",gap:5,padding:"6px 8px",borderRadius:6,border:`1px solid ${placed?BDR:BDR2}`,background:placed?GRAY2:WHITE,color:placed?TEXTD:TEXT,opacity:placed?0.5:1,cursor:placed?"default":"pointer",fontFamily:FONT,fontSize:10.5,fontWeight:600,transition:"all 0.12s",boxShadow:placed?"none":"0 1px 3px rgba(26,43,74,0.07)",minWidth:0}}>
                <span style={{fontSize:12,flexShrink:0}}>{actor.icon}</span>
                <span style={{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"left"}}>{actor.label}</span>
                {placed && <span style={{fontSize:9,color:RED,flexShrink:0}}>✓</span>}
              </button>
            );
          })}
          {nodes.length>0 && (
            <button onClick={reset} style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"6px 8px",borderRadius:6,border:`1px solid ${BDR}`,background:WHITE,color:TEXTD,cursor:"pointer",fontFamily:FONT,fontSize:10,fontWeight:600}}>↺ Reset</button>
          )}
        </div>

        {/* Canvas */}
        <div ref={canvasRef}
          onMouseUp={()=>{ if(mode==="drawing"){setMode("idle");setFromId(null);} }} onClick={()=>{ setSelNode(null); setSelConn(null); }}
          style={{flex:1,position:"relative",overflow:"hidden",touchAction:"none",background:GRAY}}>

          {/* Dot grid */}
          <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}>
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="0.8" fill={BDR2} opacity="0.6"/>
              </pattern>
              <marker id="arr" markerWidth="7" markerHeight="5" refX="5.5" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill={RED} opacity="0.7"/>
              </marker>
              <marker id="arr-hi" markerWidth="7" markerHeight="5" refX="5.5" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill={RED}/>
              </marker>
              <marker id="arr-g" markerWidth="7" markerHeight="5" refX="5.5" refY="2.5" orient="auto">
                <polygon points="0 0,7 2.5,0 5" fill={BDR2} opacity="0.9"/>
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)"/>

            {/* Connections */}
            {conns.map(c=>{
              const fn=nodes.find(n=>n.id===c.from),tn=nodes.find(n=>n.id===c.to);
              if(!fn||!tn) return null;
              const hi=selConn===c.id;
              return (
                <g key={c.id}>
                  <path d={bez(cx(fn),cy(fn),cx(tn),cy(tn))} fill="none" stroke="transparent" strokeWidth={20} style={{pointerEvents:"stroke",cursor:"pointer"}} onClick={e=>{e.stopPropagation();setSelConn(c.id);setSelNode(null);}}/>
                  <path d={bez(cx(fn),cy(fn),cx(tn),cy(tn))} fill="none" stroke={hi?RED:"rgba(232,25,44,0.35)"} strokeWidth={hi?2:1.5} markerEnd={hi?"url(#arr-hi)":"url(#arr)"} style={{pointerEvents:"stroke",cursor:"pointer"}} onClick={e=>{e.stopPropagation();setSelConn(c.id);setSelNode(null);}}/>
                </g>
              );
            })}

            {/* Ghost — draw-to-connect preview line */}
            {mode==="drawing" && fromNode && <path d={bez(fromNode.x+NW,cy(fromNode),mouse.x,mouse.y)} fill="none" stroke={RED} strokeWidth={2} strokeDasharray="6 4" markerEnd="url(#arr-hi)" opacity={0.6}/>}
          </svg>

          {/* Connection labels */}
          {conns.map(c=>{
            const fn=nodes.find(n=>n.id===c.from),tn=nodes.find(n=>n.id===c.to);
            if(!fn||!tn) return null;
            const hi=selConn===c.id;
            return (
              <div key={c.id} onClick={e=>{e.stopPropagation();setSelConn(c.id);setSelNode(null);}}
                style={{position:"absolute",left:(cx(fn)+cx(tn))/2,top:(cy(fn)+cy(tn))/2,transform:"translate(-50%,-50%)",background:hi?RED_L:WHITE,border:`1px solid ${hi?RED:BDR}`,borderRadius:4,padding:"2px 7px",fontSize:10,fontWeight:600,color:hi?RED:TEXTM,cursor:"pointer",whiteSpace:"nowrap",userSelect:"none",display:"flex",alignItems:"center",gap:5,zIndex:5,boxShadow:"0 1px 4px rgba(26,43,74,0.08)",transition:"all 0.12s"}}>
                {c.label}
                {hi && <span onClick={e=>{e.stopPropagation();removeConn(c.id);}} style={{color:WARN,fontWeight:700,fontSize:13,lineHeight:1,cursor:"pointer"}}>×</span>}
              </div>
            );
          })}

          {/* Nodes */}
          {nodes.map(node=>{
            const isFrom   = fromId===node.id;
            const isTarget = mode==="drawing" && fromId && fromId!==node.id;
            const isSel    = selNode===node.id && mode==="idle";
            return (
              <div key={node.id}
                data-nodeid={node.id}
                onMouseDown={e=>onNodeMouseDown(e,node)}
                onTouchStart={e=>{ e.stopPropagation(); if(modeRef.current==="drawing") return; startDrag(e,node); }}
                onMouseUp={e=>onNodeMouseUp(e,node)}
                style={{position:"absolute",left:node.x,top:node.y,width:NW,minHeight:NH,borderRadius:8,
                  background:isFrom?"rgba(232,25,44,0.08)":isTarget?"rgba(232,25,44,0.04)":WHITE,
                  border:`1.5px solid ${isFrom?RED:isTarget?"rgba(232,25,44,0.5)":isSel?node.color:BDR}`,
                  display:"flex",alignItems:"center",gap:7,padding:"0 36px 0 14px",
                  cursor:mode==="drawing"?"crosshair":"grab",
                  userSelect:"none",touchAction:"none",
                  animation:"pop 0.2s cubic-bezier(.34,1.56,.64,1) both",
                  boxShadow:isFrom?`0 0 0 3px rgba(232,25,44,0.2),0 2px 10px rgba(26,43,74,0.1)`
                    :isTarget?`0 0 0 2px rgba(232,25,44,0.3)`
                    :isSel?`0 0 0 2px ${node.color}25,0 2px 10px rgba(26,43,74,0.1)`
                    :"0 1px 4px rgba(26,43,74,0.1)",
                  zIndex:isSel||isFrom?20:10,
                  transition:"border-color 0.12s,box-shadow 0.12s,background 0.12s"}}>

                {/* Left colour bar */}
                <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,borderRadius:"8px 0 0 8px",background:node.color}}/>

                {/* Label */}
                {node.actorId==="your-company" && <span style={{fontSize:14,flexShrink:0}}>🏢</span>}
                <span style={{fontSize:10.5,fontWeight:600,lineHeight:1.35,flex:1,minWidth:0,wordBreak:"break-word",whiteSpace:"normal",color:isFrom?RED:TEXT,pointerEvents:"none"}}>{node.label}</span>

                {/* Delete badge */}
                {isSel && (
                  <div onMouseDown={e=>e.stopPropagation()} onTouchStart={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();removeNode(node.id);}}
                    style={{position:"absolute",top:-8,left:-8,width:20,height:20,borderRadius:"50%",background:WARN,color:WHITE,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:30,boxShadow:"0 2px 6px rgba(0,0,0,0.2)"}}>×</div>
                )}

                {/* ── Connector handle — drag from here to connect ── */}
                <div
                  data-nodeid={node.id}
                  onMouseDown={e=>{
                    e.stopPropagation();
                    e.preventDefault();
                    setFromId(node.id);
                    setMode("drawing");
                    setSelNode(null);
                    // seed mouse pos so ghost line starts at handle
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if(rect) setMouse({x:node.x+NW, y:cy(node)-rect.top+rect.top});
                  }}
                  onTouchStart={e=>{
                    e.stopPropagation();
                    e.preventDefault();
                    setFromId(node.id);
                    setMode("drawing");
                    setSelNode(null);
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if(rect) setMouse({x:node.x+NW, y:cy(node)});
                  }}
                  style={{
                    position:"absolute",right:0,top:0,bottom:0,width:36,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    borderLeft:`1px solid ${isFrom?RED:BDR}`,
                    borderRadius:"0 8px 8px 0",
                    background:isFrom?"rgba(232,25,44,0.12)":"rgba(26,43,74,0.02)",
                    cursor:"crosshair",
                    zIndex:25,
                    transition:"background 0.12s,border-color 0.12s",
                  }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="3.5"
                      stroke={isFrom?RED:mode==="drawing"&&isTarget?RED:BDR2}
                      strokeWidth="1.5"
                      fill={isFrom?"rgba(232,25,44,0.2)":"none"}/>
                    <path d="M9 2v3M9 13v3M2 9h3M13 9h3"
                      stroke={isFrom?RED:BDR2}
                      strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {nodes.length===0 && (
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none",gap:10}}>
              <div style={{fontSize:44,opacity:0.15}}>🗺️</div>
              <div style={{fontSize:11,fontWeight:600,color:TEXTD,letterSpacing:"0.04em",textAlign:"center",lineHeight:1.8}}>Tap actors in the strip above<br/>to place them on the map</div>
            </div>
          )}

          {/* Label popup */}
          {pending&&(()=>{
            const fn=nodes.find(n=>n.id===pending.from),tn=nodes.find(n=>n.id===pending.to);
            return (
              <div onClick={e=>e.stopPropagation()} onTouchStart={e=>e.stopPropagation()}
                style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:"min(280px,88vw)",background:WHITE,border:`1.5px solid ${RED}`,borderRadius:10,padding:"1rem 1.125rem",zIndex:200,boxShadow:"0 8px 32px rgba(26,43,74,0.16)",animation:"pop 0.2s ease"}}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:RED,marginBottom:8}}>Label this connection</div>
                <div style={{fontSize:11,color:TEXTM,marginBottom:10,lineHeight:1.5}}>
                  <b style={{color:TEXT}}>{fn?.label}</b><span style={{color:TEXTD,margin:"0 6px"}}>→</span><b style={{color:TEXT}}>{tn?.label}</b>
                </div>
                <input ref={labelRef} value={connLabel} onChange={e=>setConnLabel(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter")confirmConn();if(e.key==="Escape"){setPending(null);setConnLabel("");}}}
                  placeholder="e.g. issues task order, audits invoices…"
                  style={{width:"100%",background:GRAY,border:`1.5px solid ${BDR}`,borderRadius:6,padding:"0.5rem 0.7rem",color:TEXT,fontSize:13,fontFamily:FONT,marginBottom:8}}/>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={confirmConn} disabled={!connLabel.trim()}
                    style={{flex:1,padding:"0.5rem",borderRadius:6,border:"none",background:connLabel.trim()?RED:BDR,color:connLabel.trim()?WHITE:TEXTD,fontSize:12,fontWeight:700,fontFamily:FONT,cursor:connLabel.trim()?"pointer":"default"}}>Confirm</button>
                  <button onClick={()=>{setPending(null);setConnLabel("");}}
                    style={{padding:"0.5rem 1rem",borderRadius:6,border:`1px solid ${BDR}`,background:WHITE,color:TEXTM,fontSize:12,cursor:"pointer",fontFamily:FONT}}>Cancel</button>
                </div>
              </div>
            );
          })()}

          {/* Analyse FAB */}
          {canAnalyse&&!sheet&&(
            <button onClick={analyse}
              style={{position:"absolute",bottom:16,right:16,height:44,padding:"0 18px",borderRadius:22,border:"none",background:RED,color:WHITE,fontSize:12,fontWeight:700,fontFamily:FONT,cursor:"pointer",boxShadow:"0 4px 16px rgba(232,25,44,0.3)",display:"flex",alignItems:"center",gap:6,animation:"fadeUp 0.3s ease",zIndex:50}}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M4 6.5l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Analyse Map
            </button>
          )}
        </div>

        {/* Analysis bottom sheet */}
        {sheet&&(
          <div style={{position:"fixed",inset:0,zIndex:300,display:"flex",flexDirection:"column",justifyContent:"flex-end",background:"rgba(26,43,74,0.3)",backdropFilter:"blur(4px)"}}
            onClick={()=>{if(!loading)setSheet(false);}}>
            <div onClick={e=>e.stopPropagation()}
              style={{background:WHITE,borderRadius:"16px 16px 0 0",maxHeight:"78dvh",display:"flex",flexDirection:"column",animation:"slideUp 0.28s cubic-bezier(.4,0,.2,1)",boxShadow:"0 -4px 32px rgba(26,43,74,0.14)"}}>

              <div style={{padding:"10px 16px 0",flexShrink:0}}>
                <div style={{width:36,height:4,borderRadius:2,background:BDR,margin:"0 auto 12px"}}/>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:10,borderBottom:`1px solid ${BDR}`}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:RED}}>Diagnostic Analysis</div>
                  <button onClick={()=>setSheet(false)} style={{background:"none",border:"none",color:TEXTD,cursor:"pointer",fontSize:18,lineHeight:1,padding:"0 2px"}}>×</button>
                </div>
              </div>

              <div style={{overflowY:"auto",padding:"12px 16px 32px",flex:1,WebkitOverflowScrolling:"touch"}}>
                {loading&&<div style={{display:"flex",flexDirection:"column",gap:10}}>{[56,72,56,72,40].map((h,i)=><Skeleton key={i} h={h} delay={i*100}/>)}</div>}
                {error&&!loading&&<div style={{background:"rgba(192,57,43,0.07)",border:"1px solid rgba(192,57,43,0.2)",borderRadius:8,padding:"0.875rem",fontSize:12,color:WARN,lineHeight:1.6}}>{error}</div>}
                {analysis&&!loading&&(
                  <div style={{display:"flex",flexDirection:"column",gap:10,animation:"fadeUp 0.3s ease"}}>
                    {/* Score */}
                    <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px",background:GRAY,borderRadius:10,border:`1px solid ${BDR}`}}>
                      <div style={{textAlign:"center",flexShrink:0}}>
                        <div style={{fontSize:48,fontWeight:700,color:scoreColor,lineHeight:1,letterSpacing:"-0.04em"}}>{analysis.readinessScore}</div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:700,color:TEXT,marginBottom:6}}>{analysis.readinessLabel}</div>
                        <div style={{height:4,background:BDR,borderRadius:2,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${analysis.readinessScore}%`,background:scoreColor,borderRadius:2,transition:"width 1s ease"}}/>
                        </div>
                      </div>
                    </div>

                    {[
                      {key:"strength",     label:"WHAT IT REVEALS", accent:GREEN, bg:"rgba(10,112,85,0.06)",  bdr:"rgba(10,112,85,0.18)"},
                      {key:"criticalError",label:"STRUCTURAL ERROR", accent:WARN,  bg:"rgba(192,57,43,0.06)", bdr:"rgba(192,57,43,0.18)"},
                      {key:"blindspot",    label:"BLIND SPOT",       accent:RED,   bg:RED_L,                  bdr:"rgba(232,25,44,0.2)"},
                      {key:"routingRec",   label:"START HERE",       accent:BLUE,  bg:"rgba(26,79,170,0.06)", bdr:"rgba(26,79,170,0.18)"},
                    ].map(({key,label,accent,bg,bdr})=>(
                      <div key={key} style={{background:bg,border:`1px solid ${bdr}`,borderRadius:9,padding:"10px 12px"}}>
                        <div style={{fontSize:8,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:accent,marginBottom:6}}>{label}</div>
                        <div style={{fontSize:12.5,color:TEXT,lineHeight:1.65}}>{analysis[key]}</div>
                      </div>
                    ))}

                    <button onClick={()=>{setAnalysis(null);setError(null);setSheet(false);}}
                      style={{padding:"0.5rem",borderRadius:6,border:`1px solid ${BDR}`,background:WHITE,color:TEXTD,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:FONT,letterSpacing:"0.04em"}}>
                      Clear & re-analyse
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>}
    </div>
  );
}
