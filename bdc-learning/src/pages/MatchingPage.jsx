import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";

function useMobile(){const[m,setM]=useState(()=>typeof window!=='undefined'&&window.innerWidth<700);useEffect(()=>{const h=()=>setM(window.innerWidth<700);window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h);},[]);return m;}
function useInterFont(){useEffect(()=>{if(document.getElementById('inter-font'))return;const l=document.createElement('link');l.id='inter-font';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700&display=swap';document.head.appendChild(l);},[]);}

// ─── Design system ─────────────────────────────────────────────────────────
const RED="#E8192C",RED_L="#FDEAEA",NAVY="#18303F",GRN="#0F6E56",GRN_L="#E1F5EE";
const AMB="#854F0B",AMB_L="#FAEEDA",BORDER="#D8DDE3",TS="#18303F",TT="#4A6070";
const SANS="'Inter',system-ui,-apple-system,sans-serif";

// ─── Utilities ──────────────────────────────────────────────────────────────
let _n=0;
const uid=()=>`i${++_n}`;
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function parseJ(raw){try{return JSON.parse(raw.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim());}catch{return null;}}
function eH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
const mkPair=()=>({id:uid(),left:"",right:""});

// ─── Default content ────────────────────────────────────────────────────────
const mkMatch=()=>({
  topic:"",
  objective:"",
  instruction:"Draw a line from each item on the left to its match on the right.",
  submitLabel:"Check my matches",
  // Designer note: pairs should require genuine knowledge to match correctly — avoid surface-level clues like shared keywords
  pairs:Array.from({length:4},mkPair),
});

// ─── AI generation ──────────────────────────────────────────────────────────
async function aiGen(desc,ctx,count){
  const extra=ctx?"\n\nAdditional context from uploaded files:\n"+ctx:"";
  const n=count||4;
  const sys=`You are an expert instructional designer. Create a matching activity with exactly ${n} pair${n===1?"":"s"}.
Rules:
- Exactly ${n} pair${n===1?"":"s"} of left and right items
- Left items: terms, concepts, names, or prompts (keep concise, max 8 words)
- Right items: definitions, descriptions, outcomes, or answers (1–2 sentences max)
- Pairs must require genuine understanding to match — avoid surface-level keyword clues
- At least 2 pairs that learners commonly confuse with each other (plausible distractors)
- rationale: one sentence explaining why this pair belongs together (shown in results)

Return ONLY valid JSON, no markdown, no preamble:
{
  "topic": "Short title",
  "objective": "One sentence starting with a verb",
  "pairs": [
    {"id":"p1","left":"Term or prompt","right":"Definition or answer","rationale":"Why these match"},
    ...
  ]
}`;
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,system:sys,messages:[{role:"user",content:desc+extra}]})});
  const d=await res.json();
  if(d.error)throw new Error(d.error.message);
  return d.content[0].text;
}
function applyAI(parsed,setContent){
  setContent(c=>({...c,
    topic:parsed.topic||"",
    objective:parsed.objective||"",
    pairs:(parsed.pairs||[]).map(p=>({id:uid(),left:p.left||"",right:p.right||"",rationale:p.rationale||""})),
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
//  HTML OUTPUT — vanilla JS with SVG line connector
// ═══════════════════════════════════════════════════════════════════════════
function buildMatchJS(id){
  return `(function(){
  var C=CONTRACT;
  var app=document.getElementById('${id}a');
  var connections={},drawing=null,submitted=false;
  var mx=0,my=0;

  function ec(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function sf(a){var b=a.slice();for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=b[i];b[i]=b[j];b[j]=t;}return b;}
  var rightItems=sf(C.pairs.map(function(p){return{id:p.id,text:p.right};}));

  function getCenter(el,cont){
    var cr=cont.getBoundingClientRect(),er=el.getBoundingClientRect();
    return{x:er.left+er.width/2-cr.left,y:er.top+er.height/2-cr.top};
  }

  function getSvg(){return document.getElementById('${id}svg');}
  function getCont(){return document.getElementById('${id}cont');}

  function redrawLines(){
    var svg=getSvg();if(!svg)return;
    var cont=getCont();if(!cont)return;
    // Clear old permanent lines
    svg.querySelectorAll('.cl').forEach(function(el){el.remove();});
    Object.keys(connections).forEach(function(lid){
      var rid=connections[lid];
      var ldot=document.getElementById('${id}ld-'+lid);
      var rdot=document.getElementById('${id}rd-'+rid);
      if(!ldot||!rdot)return;
      var lc=getCenter(ldot,cont),rc=getCenter(rdot,cont);
      var correct=submitted?(lid===rid):null;
      var color=correct===true?'#0F6E56':correct===false?'#E8192C':'#18303F';
      var line=document.createElementNS('http://www.w3.org/2000/svg','path');
      var cx=(lc.x+rc.x)/2;
      line.setAttribute('d','M'+lc.x+','+lc.y+' C'+cx+','+lc.y+' '+cx+','+rc.y+' '+rc.x+','+rc.y);
      line.setAttribute('stroke',color);
      line.setAttribute('stroke-width','2');
      line.setAttribute('fill','none');
      line.setAttribute('stroke-linecap','round');
      if(correct===null)line.setAttribute('stroke-dasharray','');
      line.classList.add('cl');
      svg.appendChild(line);
      // Tick or cross on correct/wrong
      if(submitted){
        var badge=document.createElementNS('http://www.w3.org/2000/svg','text');
        var mid=(lc.y+rc.y)/2;
        badge.setAttribute('x',(lc.x+rc.x)/2);
        badge.setAttribute('y',mid-6);
        badge.setAttribute('text-anchor','middle');
        badge.setAttribute('font-size','14');
        badge.setAttribute('fill',color);
        badge.textContent=correct?'✓':'✗';
        badge.classList.add('cl');
        svg.appendChild(badge);
      }
    });
  }

  function updateGhost(){
    var svg=getSvg();if(!svg)return;
    var ghost=document.getElementById('${id}ghost');
    if(!drawing){if(ghost)ghost.remove();return;}
    var cont=getCont();if(!cont)return;
    var ldot=document.getElementById('${id}ld-'+drawing.lid);
    if(!ldot){if(ghost)ghost.remove();return;}
    var lc=getCenter(ldot,cont);
    var cx=(lc.x+mx)/2;
    var d='M'+lc.x+','+lc.y+' C'+cx+','+lc.y+' '+cx+','+my+' '+mx+','+my;
    if(!ghost){
      var g=document.createElementNS('http://www.w3.org/2000/svg','path');
      g.setAttribute('id','${id}ghost');
      g.setAttribute('stroke','#18303F');
      g.setAttribute('stroke-width','2');
      g.setAttribute('stroke-dasharray','6,4');
      g.setAttribute('fill','none');
      g.setAttribute('stroke-linecap','round');
      g.setAttribute('pointer-events','none');
      svg.appendChild(g);
    }
    document.getElementById('${id}ghost').setAttribute('d',d);
  }

  function onMove(e){
    if(!drawing)return;
    e.preventDefault();
    var t=e.touches?e.touches[0]:e;
    var cr=getCont().getBoundingClientRect();
    mx=t.clientX-cr.left;my=t.clientY-cr.top;
    updateGhost();
  }

  function onUp(e){
    if(!drawing)return;
    var t=e.changedTouches?e.changedTouches[0]:e;
    var el=document.elementFromPoint(t.clientX,t.clientY);
    while(el&&!el.dataset.rid)el=el.parentElement;
    if(el&&el.dataset.rid){
      var rid=el.dataset.rid;
      // Remove any existing connection to this right item
      Object.keys(connections).forEach(function(k){if(connections[k]===rid)delete connections[k];});
      connections[drawing.lid]=rid;
      // Update dot styles
      updateDotStates();
    }
    drawing=null;
    updateGhost();
    redrawLines();
    updateSubmitBtn();
  }

  function updateDotStates(){
    C.pairs.forEach(function(p){
      var ldot=document.getElementById('${id}ld-'+p.id);
      var connected=connections[p.id]!==undefined;
      if(ldot){ldot.style.background=connected?'#18303F':'#fff';ldot.style.borderColor=connected?'#18303F':BORDER_COL;}
    });
    rightItems.forEach(function(r){
      var rdot=document.getElementById('${id}rd-'+r.id);
      var connected=Object.values(connections).indexOf(r.id)>=0;
      if(rdot){rdot.style.background=connected?'#18303F':'#fff';rdot.style.borderColor=connected?'#18303F':BORDER_COL;}
    });
  }

  var BORDER_COL='#D8DDE3';

  function updateSubmitBtn(){
    var btn=document.getElementById('${id}sb');
    if(!btn)return;
    var allDone=C.pairs.length>0&&C.pairs.every(function(p){return connections[p.id]!==undefined;});
    btn.style.background=allDone?'#E8192C':BORDER_COL;
    btn.style.color=allDone?'#fff':'#4A6070';
    btn.style.cursor=allDone?'pointer':'default';
    btn.textContent=allDone?ec(C.submitLabel):'Match all items first';
    btn.onclick=allDone?function(){doSubmit();}:null;
  }

  function doSubmit(){
    submitted=true;
    redrawLines();
    // Show feedback panel
    var correct=C.pairs.filter(function(p){return connections[p.id]===p.id;}).length;
    var total=C.pairs.length;var ok=correct===total;
    var fb=document.getElementById('${id}fb');
    if(!fb)return;
    var h='<div style="padding:1rem 1.25rem;border-radius:10px;margin-bottom:1rem;display:flex;align-items:center;gap:14px;background:'+(ok?'#E1F5EE':'#FDEAEA')+';border:1.5px solid '+(ok?'#0F6E56':'#E8192C')+'">';
    h+='<span style="font-size:26px;line-height:1">'+(ok?'&#10003;':'&#10007;')+'</span>';
    h+='<div><div style="font-size:15px;font-weight:600;color:'+(ok?'#0F6E56':'#E8192C')+';margin-bottom:2px">'+(ok?'All matched correctly.':correct+' of '+total+' correct.')+'</div>';
    h+='<div style="font-size:14px;color:#18303F">'+(ok?'Every pair is correct.':'Check the lines above — red means incorrect.')+'</div></div></div>';
    if(!ok){
      C.pairs.forEach(function(p){
        var sel=connections[p.id],cor=sel===p.id;
        if(cor)return;
        var selItem=rightItems.find(function(r){return r.id===sel;})||{text:'—'};
        var corItem=rightItems.find(function(r){return r.id===p.id;})||{text:'—'};
        h+='<div style="padding:.875rem 1rem;border-radius:8px;margin-bottom:.5rem;background:#FAEEDA;border:1px solid #FAC775">';
        h+='<div style="font-size:13px;font-weight:600;color:#854F0B;margin-bottom:4px">'+ec(p.left)+' — incorrect match</div>';
        h+='<div style="font-size:14px;color:#18303F;margin-bottom:2px">You matched: '+ec(selItem.text)+'</div>';
        h+='<div style="font-size:14px;color:#0F6E56;margin-bottom:6px">Correct: '+ec(corItem.text)+'</div>';
        if(p.rationale)h+='<div style="font-size:13px;color:#18303F;line-height:1.55">'+ec(p.rationale)+'</div>';
        h+='</div>';
      });
    }
    h+='<button id="${id}rb" style="font-size:14px;color:#18303F;background:none;border:1px solid #D8DDE3;border-radius:50px;padding:.4rem 1rem;cursor:pointer;font-family:inherit;font-weight:500;margin-top:.5rem">Try again</button>';
    fb.innerHTML=h;
    document.getElementById('${id}rb').onclick=function(){connections={};submitted=false;redrawLines();updateDotStates();fb.innerHTML='';updateSubmitBtn();};
    var btn=document.getElementById('${id}sb');if(btn)btn.style.display='none';
  }

  function render(){
    var h='<p style="font-size:15px;color:#18303F;line-height:1.65;margin-bottom:1.25rem">'+ec(C.instruction)+'</p>';
    h+='<div id="${id}cont" style="position:relative;margin-bottom:1.25rem">';
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:start">';
    // Left column
    h+='<div id="${id}left" style="display:flex;flex-direction:column;gap:.5rem">';
    C.pairs.forEach(function(p){
      h+='<div style="display:flex;align-items:center;gap:0">';
      h+='<div style="flex:1;padding:.7rem 1rem;background:#fff;border:1.5px solid #D8DDE3;border-radius:8px;font-size:15px;color:#18303F;line-height:1.4;user-select:none">'+ec(p.left)+'</div>';
      h+='<div id="${id}ld-'+p.id+'" data-lid="'+p.id+'" style="width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #D8DDE3;cursor:crosshair;flex-shrink:0;margin-left:6px;transition:background .15s,border-color .15s;touch-action:none"></div>';
      h+='</div>';
    });
    h+='</div>';
    // Right column
    h+='<div id="${id}right" style="display:flex;flex-direction:column;gap:.5rem">';
    rightItems.forEach(function(r){
      h+='<div style="display:flex;align-items:center;gap:0">';
      h+='<div id="${id}rd-'+r.id+'" data-rid="'+r.id+'" style="width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #D8DDE3;flex-shrink:0;margin-right:6px;transition:background .15s,border-color .15s;pointer-events:all"></div>';
      h+='<div style="flex:1;padding:.7rem 1rem;background:#fff;border:1.5px solid #D8DDE3;border-radius:8px;font-size:15px;color:#18303F;line-height:1.4;user-select:none">'+ec(r.text)+'</div>';
      h+='</div>';
    });
    h+='</div>';
    h+='</div>';
    // SVG overlay
    h+='<svg id="${id}svg" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible"></svg>';
    h+='</div>';
    // Submit & feedback
    h+='<div style="display:flex;justify-content:flex-end;margin-bottom:.75rem"><button id="${id}sb" style="padding:.6rem 1.5rem;border-radius:50px;border:none;background:#D8DDE3;color:#4A6070;font-size:15px;font-weight:700;cursor:default;font-family:inherit;transition:all .2s">Match all items first</button></div>';
    h+='<div id="${id}fb"></div>';
    app.innerHTML=h;

    // Attach left dot events
    C.pairs.forEach(function(p){
      var ldot=document.getElementById('${id}ld-'+p.id);
      if(!ldot)return;
      function startDraw(e){
        if(submitted)return;
        e.preventDefault();e.stopPropagation();
        drawing={lid:p.id};
        var t=e.touches?e.touches[0]:e;
        var cr=getCont().getBoundingClientRect();
        mx=t.clientX-cr.left;my=t.clientY-cr.top;
        updateGhost();
      }
      ldot.addEventListener('mousedown',startDraw);
      ldot.addEventListener('touchstart',startDraw,{passive:false});
    });
    // Attach right dot data attributes (already in HTML, just need pointer events)
    rightItems.forEach(function(r){
      var rdot=document.getElementById('${id}rd-'+r.id);
      if(rdot)rdot.style.pointerEvents='all';
    });
    updateSubmitBtn();
  }

  render();
  document.addEventListener('mousemove',onMove);
  document.addEventListener('mouseup',onUp);
  document.addEventListener('touchmove',onMove,{passive:false});
  document.addEventListener('touchend',onUp);
})();`;
}

function buildOutputHTML(content){
  const id='bdc'+Math.random().toString(36).slice(2,9);
  const C=JSON.stringify(content).replace(/<\/script>/gi,'<\\/script>');
  return `<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
#${id}{font-family:'Inter',system-ui,-apple-system,sans-serif;max-width:820px;margin:0 auto;padding:2rem 1.5rem;color:#18303F;-webkit-font-smoothing:antialiased;}
#${id} *{box-sizing:border-box;}
#${id} button{font-family:'Inter',system-ui,-apple-system,sans-serif;}
</style>
<div id="${id}">
  <div style="margin-bottom:1.75rem">
    <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:#E8192C;margin-bottom:.5rem">Matching</div>
    <h1 style="font-size:30px;font-weight:300;color:#18303F;margin:0 0 .5rem;line-height:1.2;letter-spacing:-.01em">${eH(content.topic)}</h1>
    <p style="font-size:15px;color:#3D5060;margin:0;line-height:1.6">${eH(content.objective)}</p>
  </div>
  <div id="${id}a"></div>
</div>
<script>
var CONTRACT=${C};
${buildMatchJS(id)}
<\/script>`;
}

function buildEmbedSnippet(content){
  const id='bdc'+Math.random().toString(36).slice(2,9);
  const C=JSON.stringify(content).replace(/<\/script>/gi,'<\\/script>');
  return `<div id="${id}" style="font-family:'Inter',system-ui,-apple-system,sans-serif;max-width:820px;margin:0 auto;padding:2rem 1.5rem;color:#18303F;-webkit-font-smoothing:antialiased;box-sizing:border-box">
  <div style="margin-bottom:1.75rem">
    <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:#E8192C;margin-bottom:.5rem">Matching</div>
    <h1 style="font-size:30px;font-weight:300;color:#18303F;margin:0 0 .5rem;line-height:1.2;letter-spacing:-.01em">${eH(content.topic)}</h1>
    <p style="font-size:15px;color:#3D5060;margin:0;line-height:1.6">${eH(content.objective)}</p>
  </div>
  <div id="${id}a"></div>
</div>
<script>
var CONTRACT=${C};
${buildMatchJS(id)}
<\/script>`;
}

function wrapFullHTML(snippet,title){
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${eH(title||'Matching Activity')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>body{margin:0;padding:1.5rem;background:#F4F6F7;font-family:'Inter',system-ui,-apple-system,sans-serif;}</style>
</head>
<body>
${snippet}
</body>
</html>`;
}

function downloadFile(content,filename){
  const blob=new Blob([content],{type:'text/html'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();
  document.body.removeChild(a);URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════════════════
//  REACT PREVIEW — line connector with SVG overlay
// ═══════════════════════════════════════════════════════════════════════════
function MatchPreview({data}){
  const [connections,setConnections]=useState({});   // {leftId: rightId}
  const [drawing,setDrawing]=useState(null);         // {leftId} | null
  const [mouse,setMouse]=useState({x:0,y:0});
  const [submitted,setSubmitted]=useState(false);
  const [rightItems]=useState(()=>shuffle([...data.pairs].map(p=>({id:p.id,text:p.right}))));
  const [tick,setTick]=useState(0); // force re-render to recompute line positions

  const containerRef=useRef(null);
  const leftDotRefs=useRef({});
  const rightDotRefs=useRef({});
  const drawingRef=useRef(null);
  const connectionsRef=useRef({});

  // Keep refs in sync
  useEffect(()=>{drawingRef.current=drawing;},[drawing]);
  useEffect(()=>{connectionsRef.current=connections;},[connections]);

  // Compute center of a dot element relative to the container
  const getCenter=useCallback((el)=>{
    if(!el||!containerRef.current)return{x:0,y:0};
    const cr=containerRef.current.getBoundingClientRect();
    const er=el.getBoundingClientRect();
    return{x:er.left+er.width/2-cr.left,y:er.top+er.height/2-cr.top};
  },[]);

  // Window-level mousemove/touchmove
  useEffect(()=>{
    const onMove=(e)=>{
      if(!drawingRef.current)return;
      e.preventDefault();
      const t=e.touches?e.touches[0]:e;
      if(!containerRef.current)return;
      const cr=containerRef.current.getBoundingClientRect();
      setMouse({x:t.clientX-cr.left,y:t.clientY-cr.top});
    };
    const onUp=(e)=>{
      if(!drawingRef.current)return;
      const t=e.changedTouches?e.changedTouches[0]:e;
      // Find right dot under cursor
      let el=document.elementFromPoint(t.clientX,t.clientY);
      while(el&&!el.dataset.rid)el=el.parentElement;
      if(el&&el.dataset.rid){
        const rid=el.dataset.rid;
        const lid=drawingRef.current.leftId;
        setConnections(prev=>{
          const next={...prev};
          // Remove existing connection to this right slot
          Object.keys(next).forEach(k=>{if(next[k]===rid)delete next[k];});
          next[lid]=rid;
          return next;
        });
      }
      setDrawing(null);
      setTick(t=>t+1);
    };
    window.addEventListener('mousemove',onMove);
    window.addEventListener('mouseup',onUp);
    window.addEventListener('touchmove',onMove,{passive:false});
    window.addEventListener('touchend',onUp);
    return()=>{
      window.removeEventListener('mousemove',onMove);
      window.removeEventListener('mouseup',onUp);
      window.removeEventListener('touchmove',onMove);
      window.removeEventListener('touchend',onUp);
    };
  },[]);

  const startDraw=(leftId,e)=>{
    if(submitted)return;
    e.preventDefault();
    e.stopPropagation();
    setDrawing({leftId});
    const t=e.touches?e.touches[0]:e;
    if(!containerRef.current)return;
    const cr=containerRef.current.getBoundingClientRect();
    setMouse({x:t.clientX-cr.left,y:t.clientY-cr.top});
  };

  const reset=()=>{setConnections({});setSubmitted(false);setDrawing(null);};

  const allConnected=data.pairs.length>0&&data.pairs.every(p=>connections[p.id]!==undefined);
  const score=submitted?data.pairs.filter(p=>connections[p.id]===p.id).length:0;
  const allOk=submitted&&score===data.pairs.length;

  // Compute SVG lines from current DOM positions
  const lines=Object.entries(connections).map(([lid,rid])=>{
    const lEl=leftDotRefs.current[lid];
    const rEl=rightDotRefs.current[rid];
    if(!lEl||!rEl)return null;
    const lc=getCenter(lEl);
    const rc=getCenter(rEl);
    const correct=submitted?(lid===rid):null;
    return{lid,rid,lc,rc,correct};
  }).filter(Boolean);

  // Ghost line from source dot to current mouse
  const ghostSrc=drawing&&leftDotRefs.current[drawing.leftId]?getCenter(leftDotRefs.current[drawing.leftId]):null;
  const ghostLine=drawing&&ghostSrc?{lc:ghostSrc,mouse}:null;

  const cubicPath=(x1,y1,x2,y2)=>{
    const cx=(x1+x2)/2;
    return `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
  };

  return(<div>
    <p style={{fontSize:15,color:TS,lineHeight:1.65,marginBottom:"1.25rem"}}>{data.instruction}</p>

    <div ref={containerRef} style={{position:"relative",marginBottom:"1.25rem",touchAction:"none"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2rem",alignItems:"start"}}>

        {/* Left column */}
        <div style={{display:"flex",flexDirection:"column",gap:".5rem"}}>
          {data.pairs.map(p=>{
            const isConnected=connections[p.id]!==undefined;
            const isDrawing=drawing?.leftId===p.id;
            return(<div key={p.id} style={{display:"flex",alignItems:"center",gap:0}}>
              <div style={{flex:1,padding:".7rem 1rem",background:"#fff",border:`1.5px solid ${isDrawing?NAVY:BORDER}`,borderRadius:8,fontSize:15,color:NAVY,lineHeight:1.4,userSelect:"none",transition:"border-color .15s"}}>
                {p.left||<em style={{color:TT,fontWeight:400}}>Empty term</em>}
              </div>
              <div
                ref={el=>{leftDotRefs.current[p.id]=el;}}
                onMouseDown={e=>startDraw(p.id,e)}
                onTouchStart={e=>startDraw(p.id,e)}
                style={{width:14,height:14,borderRadius:"50%",background:isConnected?NAVY:"#fff",border:`2px solid ${isConnected?NAVY:BORDER}`,cursor:submitted?"default":"crosshair",flexShrink:0,marginLeft:6,transition:"background .15s,border-color .15s",touchAction:"none"}}
              />
            </div>);
          })}
        </div>

        {/* Right column */}
        <div style={{display:"flex",flexDirection:"column",gap:".5rem"}}>
          {rightItems.map(r=>{
            const isConnected=Object.values(connections).includes(r.id);
            return(<div key={r.id} style={{display:"flex",alignItems:"center",gap:0}}>
              <div
                ref={el=>{rightDotRefs.current[r.id]=el;}}
                data-rid={r.id}
                style={{width:14,height:14,borderRadius:"50%",background:isConnected?NAVY:"#fff",border:`2px solid ${isConnected?NAVY:BORDER}`,flexShrink:0,marginRight:6,transition:"background .15s,border-color .15s",pointerEvents:"all"}}
              />
              <div style={{flex:1,padding:".7rem 1rem",background:"#fff",border:`1.5px solid ${BORDER}`,borderRadius:8,fontSize:15,color:NAVY,lineHeight:1.4,userSelect:"none"}}
                data-rid={r.id}>
                {r.text||<em style={{color:TT,fontWeight:400}}>Empty definition</em>}
              </div>
            </div>);
          })}
        </div>
      </div>

      {/* SVG overlay */}
      <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",overflow:"visible"}}>
        {/* Permanent connection lines */}
        {lines.map(({lid,lc,rc,correct})=>{
          const color=correct===true?GRN:correct===false?RED:NAVY;
          return(<g key={lid}>
            <path d={cubicPath(lc.x,lc.y,rc.x,rc.y)} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round"/>
            {submitted&&<text x={(lc.x+rc.x)/2} y={(lc.y+rc.y)/2-7} textAnchor="middle" fontSize={13} fill={color}>{correct?"✓":"✗"}</text>}
          </g>);
        })}
        {/* Ghost line while drawing */}
        {ghostLine&&<path d={cubicPath(ghostLine.lc.x,ghostLine.lc.y,ghostLine.mouse.x,ghostLine.mouse.y)} stroke={NAVY} strokeWidth={2} strokeDasharray="6,4" fill="none" strokeLinecap="round"/>}
      </svg>
    </div>

    {/* Submit / results */}
    {!submitted&&(
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <button onClick={()=>allConnected&&setSubmitted(true)} disabled={!allConnected} style={{padding:".6rem 1.5rem",borderRadius:50,border:"none",background:allConnected?RED:BORDER,color:allConnected?"#fff":TT,fontFamily:SANS,fontSize:15,fontWeight:700,cursor:allConnected?"pointer":"default",transition:"all .2s"}}>
          {allConnected?data.submitLabel:`Connect ${data.pairs.filter(p=>!connections[p.id]).length} more pair${data.pairs.filter(p=>!connections[p.id]).length===1?"":"s"} first`}
        </button>
      </div>
    )}

    {submitted&&<div>
      <div style={{padding:"1rem 1.25rem",borderRadius:10,marginBottom:"1rem",display:"flex",alignItems:"center",gap:14,background:allOk?GRN_L:RED_L,border:`1.5px solid ${allOk?GRN:RED}`}}>
        <span style={{fontSize:26}}>{allOk?"✓":"✗"}</span>
        <div>
          <div style={{fontSize:15,fontWeight:600,color:allOk?GRN:RED,marginBottom:2}}>{allOk?"All matched correctly.":`${score} of ${data.pairs.length} correct.`}</div>
          <div style={{fontSize:14,color:TS}}>{allOk?"Every pair is right.":"Check the lines above — red means incorrect."}</div>
        </div>
      </div>
      {!allOk&&<div style={{marginBottom:"1rem"}}>
        <div style={{fontSize:12,fontWeight:600,color:TT,marginBottom:".5rem"}}>Incorrect pairs</div>
        {data.pairs.filter(p=>connections[p.id]!==p.id).map(p=>{
          const selItem=rightItems.find(r=>r.id===connections[p.id])||{text:"—"};
          const corItem=rightItems.find(r=>r.id===p.id)||{text:"—"};
          return(<div key={p.id} style={{padding:".875rem 1rem",borderRadius:8,marginBottom:".5rem",background:AMB_L,border:"1px solid #FAC775"}}>
            <div style={{fontSize:13,fontWeight:600,color:AMB,marginBottom:4}}>{p.left} — incorrect match</div>
            <div style={{fontSize:14,color:NAVY,marginBottom:2}}>You matched: {selItem.text}</div>
            <div style={{fontSize:14,color:GRN,marginBottom:p.rationale?6:0}}>Correct: {corItem.text}</div>
            {p.rationale&&<div style={{fontSize:13,color:TS,lineHeight:1.55}}>{p.rationale}</div>}
          </div>);
        })}
      </div>}
      <button onClick={reset} style={{fontSize:14,color:TS,background:"none",border:`1px solid ${BORDER}`,borderRadius:50,padding:".4rem 1rem",cursor:"pointer",fontFamily:SANS,fontWeight:500}}>Try again</button>
    </div>}
  </div>);
}

// ─── Editor ─────────────────────────────────────────────────────────────────
function Lbl({children}){return <div style={{fontSize:11,fontWeight:600,color:TT,fontFamily:SANS,marginBottom:".375rem"}}>{children}</div>;}
const iStyle={width:"100%",border:`1.5px solid ${BORDER}`,borderRadius:8,padding:".65rem 1rem",fontFamily:SANS,fontSize:15,color:NAVY,background:"#fff",outline:"none",lineHeight:1.6,boxSizing:"border-box"};

function MatchEditor({content,onChange}){
  const set=(k,v)=>onChange({...content,[k]:v});
  const setPair=(idx,k,v)=>{const pairs=[...content.pairs];pairs[idx]={...pairs[idx],[k]:v};onChange({...content,pairs});};
  const addPair=()=>onChange({...content,pairs:[...content.pairs,mkPair()]});
  const removePair=idx=>content.pairs.length>1&&onChange({...content,pairs:content.pairs.filter((_,i)=>i!==idx)});
  return(<div>
    <div style={{marginBottom:".875rem"}}><Lbl>Topic *</Lbl><input value={content.topic} onChange={e=>set("topic",e.target.value)} placeholder="e.g. Procurement process roles and responsibilities" style={iStyle}/></div>
    <div style={{marginBottom:"1.25rem"}}><Lbl>Objective *</Lbl><input value={content.objective} onChange={e=>set("objective",e.target.value)} placeholder="e.g. Match each procurement role to its primary responsibility." style={iStyle}/></div>
    <div style={{marginBottom:".375rem"}}><Lbl>Pairs ({content.pairs.length})</Lbl></div>
    <div style={{fontSize:14,color:TS,marginBottom:".875rem",lineHeight:1.6}}>Left items are shown in order, right items are shuffled for learners. Include at least 2 pairs that are easy to confuse.</div>

    {content.pairs.map((pair,idx)=>(
      <div key={pair.id} style={{padding:".75rem .875rem",marginBottom:".375rem",background:"#F8F9FB",border:`1px solid ${BORDER}`,borderLeft:`3px solid ${NAVY}`,borderRadius:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:".5rem"}}>
          <span style={{fontSize:13,fontWeight:700,color:NAVY,flexShrink:0}}>Pair {idx+1}</span>
          <div style={{flex:1}}/>
          {content.pairs.length>1&&<button onClick={()=>removePair(idx)} style={{background:"none",border:"none",color:RED,cursor:"pointer",fontSize:14,fontFamily:SANS,padding:0}}>Remove</button>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".5rem",marginBottom:pair.rationale!==undefined?".4rem":0}}>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:TT,marginBottom:".25rem"}}>Left (term / prompt)</div>
            <input value={pair.left} onChange={e=>setPair(idx,"left",e.target.value)} placeholder="Term, name, or concept" style={iStyle}/>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:TT,marginBottom:".25rem"}}>Right (definition / answer)</div>
            <input value={pair.right} onChange={e=>setPair(idx,"right",e.target.value)} placeholder="Definition or matching answer" style={iStyle}/>
          </div>
        </div>
        <div style={{marginTop:".4rem"}}>
          <div style={{fontSize:11,fontWeight:600,color:TT,marginBottom:".25rem"}}>Rationale (shown in results)</div>
          <input value={pair.rationale||""} onChange={e=>setPair(idx,"rationale",e.target.value)} placeholder="Why do these two belong together?" style={iStyle}/>
        </div>
      </div>
    ))}
    <button onClick={addPair} style={{width:"100%",fontSize:14,color:NAVY,background:"none",border:`1px dashed ${BORDER}`,borderRadius:8,padding:".5rem",cursor:"pointer",fontFamily:SANS,marginTop:".25rem"}}>+ Add pair</button>
  </div>);
}

// ─── Copy button ────────────────────────────────────────────────────────────
function CopyButton({label,hint,copied,onClick,primary}){
  return(<button onClick={onClick} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:primary?".55rem .75rem":".45rem .5rem",borderRadius:primary?50:8,border:`1.5px solid ${copied?GRN:primary?"#B8D4C8":BORDER}`,background:copied?GRN:primary?GRN_L:"#F8F9FB",color:copied?"#fff":primary?GRN:TS,fontFamily:SANS,fontSize:primary?14:13,fontWeight:primary?700:600,cursor:"pointer",transition:"all .18s",flexDirection:"column",gap:2}}>
    {copied?<span style={{display:"flex",alignItems:"center",gap:5}}><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 7l3.5 3.5L11 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>Copied!</span>:<span style={{display:"flex",alignItems:"center",gap:5}}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 4V2.5A1.5 1.5 0 0 0 6.5 1H2.5A1.5 1.5 0 0 0 1 2.5V6.5A1.5 1.5 0 0 0 2.5 8H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>{label}</span>}
    {hint&&!copied&&<span style={{fontSize:11,fontWeight:400,opacity:.65}}>{hint}</span>}
  </button>);
}

// ─── AI Panel ───────────────────────────────────────────────────────────────
function AIPanel({onApply,pairCount}){
  const [open,setOpen]=useState(false);
  const [desc,setDesc]=useState("");
  const [files,setFiles]=useState([]);
  const [fileCtx,setFileCtx]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [done,setDone]=useState(false);
  const fileRef=useRef(null);
  const taRef=useRef(null);
  const handleFiles=async(list)=>{const arr=Array.from(list);setFiles(prev=>[...prev,...arr]);const texts=await Promise.all(arr.map(f=>new Promise(res=>{const r=new FileReader();r.onload=e=>res(`--- ${f.name} ---\n${e.target.result}`);r.onerror=()=>res(`[Could not read ${f.name}]`);r.readAsText(f);})));setFileCtx(prev=>prev+(prev?"\n\n":"")+texts.join("\n\n"));};
  const removeFile=idx=>{const next=files.filter((_,i)=>i!==idx);setFiles(next);if(next.length===0)setFileCtx("");};
  const canGenerate=!loading&&(desc.trim()||fileCtx);
  const generate=async()=>{if(!canGenerate)return;setLoading(true);setError(null);setDone(false);try{const raw=await aiGen(desc,fileCtx,pairCount);const parsed=parseJ(raw);if(!parsed)throw new Error("Could not parse response. Try rephrasing.");onApply(parsed);setDone(true);setTimeout(()=>{setOpen(false);setDone(false);},900);}catch(e){setError(e.message);}setLoading(false);};
  const handleKey=e=>{if((e.metaKey||e.ctrlKey)&&e.key==="Enter")generate();};
  return(<div style={{marginBottom:"1.25rem"}}>
    {!open&&(<button onClick={()=>{setOpen(true);setTimeout(()=>taRef.current?.focus(),80);}} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"1rem 1.25rem",borderRadius:12,border:`1.5px solid ${BORDER}`,background:"#fff",cursor:"pointer",textAlign:"left",fontFamily:SANS,boxShadow:"0 1px 3px rgba(24,48,63,.04)"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=NAVY;e.currentTarget.style.boxShadow="0 2px 8px rgba(24,48,63,.1)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=BORDER;e.currentTarget.style.boxShadow="0 1px 3px rgba(24,48,63,.04)";}}>
      <div style={{width:34,height:34,borderRadius:8,background:NAVY,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 1L3 9h5l-1 6 7-9H9l1-5z" fill="#fff" stroke="#fff" strokeWidth=".5" strokeLinejoin="round"/></svg></div>
      <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:NAVY,marginBottom:2}}>Generate with AI</div><div style={{fontSize:14,color:TT}}>Describe your topic — AI drafts all pairs with rationales</div></div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,color:TT}}><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>)}
    {open&&(<div style={{borderRadius:12,border:`1.5px solid ${NAVY}`,background:"#fff",overflow:"hidden",boxShadow:"0 2px 8px rgba(24,48,63,.1)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:".875rem 1.25rem",borderBottom:`1px solid ${BORDER}`}}>
        <div style={{width:34,height:34,borderRadius:8,background:NAVY,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 1L3 9h5l-1 6 7-9H9l1-5z" fill="#fff" stroke="#fff" strokeWidth=".5" strokeLinejoin="round"/></svg></div>
        <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:NAVY}}>Generate with AI</div><div style={{fontSize:14,color:TT}}>Describe your topic — AI drafts all pairs with rationales</div></div>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:TT,cursor:"pointer",fontSize:20,lineHeight:1,padding:"0 0 0 .5rem",fontFamily:SANS}}>&times;</button>
      </div>
      <div style={{padding:"1.125rem 1.25rem"}}>
        <textarea ref={taRef} value={desc} onChange={e=>setDesc(e.target.value)} onKeyDown={handleKey} placeholder="e.g. Match procurement roles to their responsibilities — include DND, PSPC, CAF, ISED, and Treasury Board" rows={3} style={{...iStyle,resize:"none",lineHeight:1.65,minHeight:90,marginBottom:".75rem"}}/>
        <div style={{display:"flex",alignItems:"center",gap:".625rem",flexWrap:"wrap"}}>
          <button onClick={()=>fileRef.current?.click()} style={{display:"inline-flex",alignItems:"center",gap:5,padding:".35rem .875rem",borderRadius:50,border:`1.5px solid ${BORDER}`,background:"#F4F6F7",color:TS,fontFamily:SANS,fontSize:14,fontWeight:500,cursor:"pointer"}}><svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 4l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 10h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>Attach files</button>
          <input ref={fileRef} type="file" multiple accept=".txt,.md,.csv,.json" onChange={e=>handleFiles(e.target.files)} style={{display:"none"}}/>
          <span style={{fontSize:13,color:TT,flex:1}}>or ⌘↵ to generate</span>
          <button onClick={generate} disabled={!canGenerate} style={{display:"flex",alignItems:"center",gap:6,padding:".45rem 1.25rem",borderRadius:50,border:"none",background:done?"#0F6E56":canGenerate?NAVY:BORDER,color:canGenerate?"#fff":TT,fontFamily:SANS,fontSize:15,fontWeight:700,cursor:canGenerate?"pointer":"default",transition:"background .2s",whiteSpace:"nowrap"}}>
            {loading?<><svg style={{animation:"spin 1s linear infinite"}} width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,.35)" strokeWidth="1.5"/><path d="M6 1.5A4.5 4.5 0 0 1 10.5 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>Generating…</>:done?<>✓ Done</>:"Generate →"}
          </button>
        </div>
        {files.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:".375rem",marginTop:".625rem"}}>{files.map((f,i)=><span key={i} style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:13,padding:"3px 9px",borderRadius:20,background:"#EEF4FF",color:NAVY,fontWeight:500}}>{f.name}<button onClick={()=>removeFile(i)} style={{background:"none",border:"none",color:TT,cursor:"pointer",fontSize:13,padding:0,lineHeight:1}}>×</button></span>)}</div>}
        {error&&<div style={{fontSize:14,color:"#A32D2D",marginTop:".625rem",padding:".5rem .875rem",background:"#FCEBEB",borderRadius:6,border:"1px solid #F09595",lineHeight:1.5}}>{error}</div>}
      </div>
    </div>)}
    <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
  </div>);
}

// ─── App ────────────────────────────────────────────────────────────────────
export default function MatchingPage(){
  useInterFont();
  const mobile=useMobile();
  const [view,setView]=useState("studio");
  const [content,setContent]=useState(mkMatch);
  const [outputSnippet,setOutputSnippet]=useState(null);
  const [copiedSnippet,setCopiedSnippet]=useState(false);
  const [copiedEmbed,setCopiedEmbed]=useState(false);
  const [copiedFull,setCopiedFull]=useState(false);

  const isReady=
    content.topic.trim().length>1&&
    content.pairs.length>=2&&
    content.pairs.every(p=>p.left.trim()&&p.right.trim());

  const handleCreate=()=>{const s=buildOutputHTML(content);setOutputSnippet(s);setTimeout(()=>document.getElementById("output-panel")?.scrollIntoView({behavior:"smooth"}),60);};

  function copyText(text,setFlag){
    const finish=()=>{setFlag(true);setTimeout(()=>setFlag(false),2200);};
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(finish).catch(()=>fallback(text,finish));}else{fallback(text,finish);}
    function fallback(t,cb){const el=document.createElement('textarea');el.value=t;el.style.cssText='position:fixed;top:-9999px;left:-9999px;opacity:0';document.body.appendChild(el);el.focus();el.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(el);cb();}
  }
  const handleCopySnippet=()=>copyText(outputSnippet,setCopiedSnippet);
  const handleCopyEmbed=()=>copyText(buildEmbedSnippet(content),setCopiedEmbed);
  const handleCopyFull=()=>copyText(wrapFullHTML(outputSnippet,content.topic),setCopiedFull);
  const handleDownload=()=>{const full=wrapFullHTML(outputSnippet,content.topic);const fname=(content.topic||'matching').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,40)+'.html';downloadFile(full,fname);};

  return(
    <div style={{fontFamily:SANS,minHeight:"100vh",background:"#F4F6F7",color:NAVY}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}button:active{transform:scale(.97);}button:focus,input:focus,textarea:focus{outline:none;}input:focus,textarea:focus{border-color:${RED}!important;}`}</style>

      {/* Nav */}
      <div style={{background:"#fff",borderBottom:"1px solid #E8ECEE",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:820,margin:"0 auto",padding:"0 1.5rem",display:"flex",alignItems:"center",height:56,position:"relative",width:"100%"}}>
          <div style={{fontSize:27,fontWeight:700,color:NAVY,letterSpacing:"-.02em",flexShrink:0}}>bdc<span style={{color:RED}}>*</span></div>
          <div style={{display:"flex",gap:0,position:"absolute",left:"50%",transform:"translateX(-50%)"}}>
            {[{id:"studio",label:"Studio"},{id:"preview",label:"Preview"}].map(v=><button key={v.id} onClick={()=>setView(v.id)} style={{padding:"0 1.25rem",height:56,background:"none",border:"none",borderBottom:`2px solid ${view===v.id?RED:"transparent"}`,color:view===v.id?NAVY:TT,fontSize:15,fontWeight:view===v.id?600:400,cursor:"pointer",fontFamily:SANS,transition:"all .2s"}}>{v.label}</button>)}
          </div>
        </div>
      </div>

      {/* Preview */}
      {view==="preview"&&(
        <div style={{maxWidth:820,margin:"0 auto",padding:"2rem 1.5rem"}}>
          <div style={{marginBottom:"1.75rem"}}>
            <div style={{fontSize:14,fontWeight:600,color:RED,marginBottom:".5rem"}}>Matching</div>
            <h1 style={{fontSize:mobile?26:32,fontWeight:300,color:NAVY,marginBottom:".5rem",lineHeight:1.2,letterSpacing:"-.01em"}}>{content.topic||<em style={{opacity:.35,fontWeight:300,fontStyle:"italic"}}>No topic yet</em>}</h1>
            <p style={{fontSize:15,color:TS,lineHeight:1.6}}>{content.objective}</p>
          </div>
          <MatchPreview key={JSON.stringify(content)} data={content}/>
        </div>
      )}

      {/* Studio */}
      {view==="studio"&&(
        <div style={{maxWidth:820,margin:"0 auto",padding:mobile?"1rem":"1.75rem 1.5rem"}}>
          <AIPanel onApply={parsed=>applyAI(parsed,setContent)} pairCount={content.pairs.length}/>
          <div style={{padding:"1.25rem",background:"#fff",border:`1px solid ${BORDER}`,borderRadius:12,boxShadow:"0 1px 4px rgba(26,43,74,0.05)",marginBottom:"1.5rem"}}>
            <div style={{fontSize:14,fontWeight:600,color:TT,marginBottom:"1rem"}}>Content editor</div>
            <MatchEditor content={content} onChange={setContent}/>
          </div>

          {/* Sticky action bar */}
          <div style={{position:"sticky",bottom:0,background:"#fff",borderTop:`1px solid ${BORDER}`,padding:".875rem 1.25rem",display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap",marginLeft:mobile?"-1rem":"-1.5rem",marginRight:mobile?"-1rem":"-1.5rem",zIndex:50}}>
            <div style={{display:"flex",gap:"1rem",flex:1,flexWrap:"wrap"}}>
              {[
                {ok:content.topic.trim().length>1,label:"Topic"},
                {ok:content.pairs.length>=2,label:"Min 2 pairs"},
                {ok:content.pairs.every(p=>p.left.trim()),label:"Left items"},
                {ok:content.pairs.every(p=>p.right.trim()),label:"Right items"},
              ].map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:15,color:item.ok?GRN:"#C8D0D6",lineHeight:1}}>{item.ok?"✓":"○"}</span>
                <span style={{fontSize:14,color:item.ok?TS:TT}}>{item.label}</span>
              </div>)}
            </div>
            <div style={{display:"flex",gap:".5rem",flexShrink:0}}>
              <button onClick={()=>setView("preview")} style={{padding:".5rem 1.125rem",borderRadius:50,border:`1.5px solid ${BORDER}`,background:"transparent",color:NAVY,fontFamily:SANS,fontSize:14,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap"}}>Preview ↗</button>
              <button onClick={handleCreate} disabled={!isReady} style={{padding:".5rem 1.25rem",borderRadius:50,border:"none",background:isReady?RED:BORDER,color:isReady?"#fff":TT,fontFamily:SANS,fontSize:15,fontWeight:700,cursor:isReady?"pointer":"default",transition:"all .2s",whiteSpace:"nowrap"}}>Create activity →</button>
            </div>
          </div>

          {/* Output panel */}
          {outputSnippet&&(
            <div id="output-panel" style={{padding:"1.25rem",background:"#fff",border:`1.5px solid ${GRN}`,borderRadius:12,boxShadow:"0 2px 10px rgba(15,110,86,0.08)",marginTop:"1.5rem"}}>
              <div style={{fontSize:14,fontWeight:600,color:GRN,marginBottom:".75rem"}}>Activity ready</div>
              <div style={{display:"flex",gap:".75rem",flexWrap:"wrap",marginBottom:".875rem",alignItems:"stretch"}}>
                <button onClick={handleDownload} style={{display:"flex",alignItems:"center",gap:7,padding:".55rem 1.25rem",borderRadius:50,border:"none",background:GRN,color:"#fff",fontFamily:SANS,fontSize:15,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8M3 6l3.5 3.5L10 6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M1.5 11.5h10" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  Download .html
                </button>
                <CopyButton label="Copy LMS embed" hint="Inline CSS · paste into HTML editor" copied={copiedEmbed} onClick={handleCopyEmbed} primary/>
                <CopyButton label="Copy with style tag" copied={copiedSnippet} onClick={handleCopySnippet}/>
                <CopyButton label="Copy full HTML" copied={copiedFull} onClick={handleCopyFull}/>
              </div>
              <div style={{background:"#F4F6F7",border:`1px solid ${BORDER}`,borderRadius:8,padding:".875rem",fontSize:14,color:TS,lineHeight:1.7}}>
                <div style={{fontWeight:600,color:NAVY,marginBottom:".375rem",fontSize:13}}>How to add to D2L</div>
                <div style={{marginBottom:".25rem"}}>① <strong>Recommended:</strong> Download .html → upload to <em>Manage Files</em> → insert as Content Topic.</div>
                <div>② <strong>Inline:</strong> Copy LMS embed → paste via <em>Insert → HTML Source</em>. Requires admin to enable <em>Allow HTML in Content</em>.</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
