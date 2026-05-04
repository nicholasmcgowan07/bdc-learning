import { useState, useRef, useEffect } from "react";

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

// ─── Default blank content ──────────────────────────────────────────────────
const mkSeq=()=>({topic:"",objective:"",instruction:"Drag the steps into the correct order, then submit your sequence.",submitLabel:"Check my sequence",items:Array.from({length:4},()=>({id:uid(),label:"",rationale:""}))});

// ─── AI generation ──────────────────────────────────────────────────────────
async function aiGen(desc,ctx){
  const extra=ctx?"\n\nAdditional context from uploaded files:\n"+ctx:"";
  const sys=`You are an expert instructional designer. Create a drag-and-drop SEQUENCING activity.
Rules: 5-7 steps listed in CORRECT order. At least 2 adjacent pairs learners commonly confuse. Each rationale explains WHY this step must be in this position — the reasoning is the learning.
Return ONLY valid JSON, no markdown, no preamble:
{"topic":"Short title","objective":"One sentence starting with a verb","items":[{"id":"s1","label":"Step text","rationale":"Why this position matters and what goes wrong if misplaced"},…]}`;
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,system:sys,messages:[{role:"user",content:desc+extra}]})});
  const d=await res.json();
  if(d.error)throw new Error(d.error.message);
  return d.content[0].text;
}
function applyAI(parsed,setContent){
  setContent(c=>({...c,topic:parsed.topic||"",objective:parsed.objective||"",items:(parsed.items||[]).map(it=>({id:uid(),label:it.label||"",rationale:it.rationale||""}))}));
}

// ─── HTML output builders ───────────────────────────────────────────────────
function buildSeqJS(id){
  return `(function(){
  var C=CONTRACT,correct=C.items.map(function(i){return i.id;}),items=sf(C.items.slice()),submitted=false,showCorrect=false,dSrc=null;
  var app=document.getElementById('${id}a');
  function sf(a){var b=a.slice();for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=b[i];b[i]=b[j];b[j]=t;}return b;}
  function ec(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function render(){
    var h='<p style="font-size:15px;color:#18303F;line-height:1.65;margin-bottom:1.25rem">'+ec(C.instruction)+'</p><div id="${id}l">';
    items.forEach(function(item,i){
      var ic=submitted&&item.id===correct[i],iw=submitted&&!ic;
      h+='<div class="bi'+(ic?' bc':iw?' bw':'')+'" data-i="'+i+'" draggable="'+(!submitted)+'" style="display:flex;align-items:center;gap:10px;padding:.75rem 1rem;margin-bottom:.5rem;background:'+(ic?'#E1F5EE':iw?'#FDE8EA':'#fff')+';border:1.5px solid '+(ic?'#0F6E56':iw?'#E8192C':'#D8DDE3')+';border-radius:8px;cursor:'+(submitted?'default':'grab')+';user-select:none;transition:background .12s,border-color .12s">';
      h+='<span style="font-size:13px;font-weight:600;color:#4A6070;min-width:18px;text-align:right;flex-shrink:0">'+(i+1)+'</span>';
      if(submitted){h+='<span style="font-size:15px;font-weight:700;color:'+(ic?'#0F6E56':'#E8192C')+';width:14px;flex-shrink:0">'+(ic?'&#10003;':'&#10007;')+'</span>';}
      else{h+='<svg style="flex-shrink:0;opacity:.22" width="10" height="14" viewBox="0 0 10 14"><circle cx="3" cy="2.5" r="1.2" fill="#18303F"/><circle cx="7" cy="2.5" r="1.2" fill="#18303F"/><circle cx="3" cy="7" r="1.2" fill="#18303F"/><circle cx="7" cy="7" r="1.2" fill="#18303F"/><circle cx="3" cy="11.5" r="1.2" fill="#18303F"/><circle cx="7" cy="11.5" r="1.2" fill="#18303F"/></svg>';}
      h+='<span style="font-size:15px;color:#18303F;line-height:1.5;flex:1">'+ec(item.label)+'</span></div>';
    });
    h+='</div>';
    if(!submitted){
      h+='<div style="display:flex;justify-content:flex-end;margin-top:.25rem"><button id="${id}sb" style="padding:.6rem 1.5rem;border-radius:50px;border:none;background:#E8192C;color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit">'+ec(C.submitLabel)+'</button></div>';
    }else{
      var wrong=items.map(function(it,i){return{it:it,p:i,c:correct.indexOf(it.id)};}).filter(function(r){return r.p!==r.c;});
      var ok=wrong.length===0,cc=items.length-wrong.length;
      h+='<div style="padding:1rem 1.25rem;border-radius:10px;margin-bottom:1rem;display:flex;align-items:center;gap:14px;background:'+(ok?'#E1F5EE':'#FDE8EA')+';border:1.5px solid '+(ok?'#0F6E56':'#E8192C')+'"><span style="font-size:26px;line-height:1">'+(ok?'&#10003;':'&#10007;')+'</span><div><div style="font-size:15px;font-weight:600;color:'+(ok?'#0F6E56':'#E8192C')+';margin-bottom:2px">'+(ok?'All correct.':cc+' of '+items.length+' correct.')+'</div><div style="font-size:14px;color:#18303F">'+(ok?'Every step is in the right place.':'Read the explanations below.')+'</div></div></div>';
      if(wrong.length>0){
        h+='<div style="font-size:12px;font-weight:600;color:#4A6070;margin-bottom:.5rem">Why these steps are out of order</div>';
        wrong.forEach(function(r){h+='<div style="padding:.875rem 1rem;border-radius:8px;margin-bottom:.5rem;background:#FAEEDA;border:1px solid #FAC775"><div style="font-size:12px;font-weight:600;color:#854F0B;margin-bottom:4px">You placed this at step '+(r.p+1)+' \u2014 it belongs at step '+(r.c+1)+'</div><div style="font-size:15px;font-weight:500;color:#18303F;line-height:1.5;margin-bottom:4px">'+ec(r.it.label)+'</div><div style="font-size:14px;color:#18303F;line-height:1.65">'+ec(r.it.rationale)+'</div></div>';});
        if(!showCorrect)h+='<button id="${id}sc" style="font-size:14px;color:#18303F;background:none;border:1px solid #D8DDE3;border-radius:50px;padding:.4rem 1rem;cursor:pointer;font-family:inherit;font-weight:600;margin-top:4px;display:inline-block;margin-bottom:1rem">Show correct order &#8594;</button>';
      }
      if(showCorrect){
        h+='<div style="font-size:12px;font-weight:600;color:#0F6E56;margin-bottom:.5rem;margin-top:.5rem">Correct sequence</div>';
        C.items.forEach(function(it,i){h+='<div style="display:flex;align-items:flex-start;gap:10px;padding:.6rem .875rem;margin-bottom:.375rem;background:#E1F5EE;border:1px solid #0F6E56;border-radius:8px"><span style="font-size:13px;font-weight:700;color:#0F6E56;min-width:18px;flex-shrink:0">'+(i+1)+'.</span><span style="font-size:15px;color:#04342C;line-height:1.5">'+ec(it.label)+'</span></div>';});
      }
      h+='<button id="${id}rb" style="font-size:14px;color:#18303F;background:none;border:1px solid #D8DDE3;border-radius:50px;padding:.4rem 1rem;cursor:pointer;font-family:inherit;font-weight:500;margin-top:.5rem">Try again</button>';
    }
    app.innerHTML=h;
    var sb=document.getElementById('${id}sb');if(sb)sb.onclick=function(){submitted=true;render();};
    var rb=document.getElementById('${id}rb');if(rb)rb.onclick=function(){items=sf(C.items.slice());submitted=false;showCorrect=false;dSrc=null;render();};
    var sc=document.getElementById('${id}sc');if(sc)sc.onclick=function(){showCorrect=true;render();};
    if(!submitted){
      document.querySelectorAll('#${id}l .bi').forEach(function(el){
        var i=parseInt(el.getAttribute('data-i'));
        el.ondragstart=function(e){dSrc=i;e.dataTransfer.effectAllowed='move';setTimeout(function(){el.style.opacity='.35';},0);};
        el.ondragend=function(){el.style.opacity='1';document.querySelectorAll('#${id}l .bi').forEach(function(x){x.style.borderTopWidth='1.5px';x.style.background=x.classList.contains('bc')?'#E1F5EE':x.classList.contains('bw')?'#FDE8EA':'#fff';x.style.borderColor=x.classList.contains('bc')?'#0F6E56':x.classList.contains('bw')?'#E8192C':'#D8DDE3';});dSrc=null;};
        el.ondragover=function(e){e.preventDefault();if(i!==dSrc){document.querySelectorAll('#${id}l .bi').forEach(function(x){x.style.borderTopWidth='1.5px';x.style.background='#fff';x.style.borderColor='#D8DDE3';});el.style.background='#EEF4FF';el.style.borderColor='#185FA5';el.style.borderTopWidth='3px';}};
        el.ondrop=function(e){e.preventDefault();if(dSrc===null||dSrc===i)return;var n=items.slice();var m=n.splice(dSrc,1)[0];n.splice(i,0,m);items=n;dSrc=null;render();};
      });
    }
  }
  render();
})();`;
}

function buildOutputHTML(content){
  const id='bdc'+Math.random().toString(36).slice(2,9);
  const C=JSON.stringify(content).replace(/<\/script>/gi,'<\\/script>');
  return `<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
#${id}{font-family:'Inter',system-ui,-apple-system,sans-serif;max-width:720px;margin:0 auto;padding:2rem 1.5rem;color:#18303F;-webkit-font-smoothing:antialiased;}
#${id} *{box-sizing:border-box;}
#${id} button{font-family:'Inter',system-ui,-apple-system,sans-serif;}
</style>
<div id="${id}">
  <div style="margin-bottom:1.75rem">
    <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:#E8192C;margin-bottom:.5rem">Sequencing</div>
    <h1 style="font-size:30px;font-weight:300;color:#18303F;margin:0 0 .5rem;line-height:1.2;letter-spacing:-.01em">${eH(content.topic)}</h1>
    <p style="font-size:15px;color:#3D5060;margin:0;line-height:1.6">${eH(content.objective)}</p>
  </div>
  <div id="${id}a"></div>
</div>
<script>
var CONTRACT=${C};
${buildSeqJS(id)}
<\/script>`;
}

function buildEmbedSnippet(content){
  const id='bdc'+Math.random().toString(36).slice(2,9);
  const C=JSON.stringify(content).replace(/<\/script>/gi,'<\\/script>');
  return `<div id="${id}" style="font-family:'Inter',system-ui,-apple-system,sans-serif;max-width:720px;margin:0 auto;padding:2rem 1.5rem;color:#18303F;-webkit-font-smoothing:antialiased;box-sizing:border-box">
  <div style="margin-bottom:1.75rem">
    <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:#E8192C;margin-bottom:.5rem">Sequencing</div>
    <h1 style="font-size:30px;font-weight:300;color:#18303F;margin:0 0 .5rem;line-height:1.2;letter-spacing:-.01em">${eH(content.topic)}</h1>
    <p style="font-size:15px;color:#3D5060;margin:0;line-height:1.6">${eH(content.objective)}</p>
  </div>
  <div id="${id}a"></div>
</div>
<script>
var CONTRACT=${C};
${buildSeqJS(id)}
<\/script>`;
}

function wrapFullHTML(snippet,title){
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${eH(title||'Sequencing Activity')}</title>
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
  const a=document.createElement('a');
  a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();
  document.body.removeChild(a);URL.revokeObjectURL(url);
}

// ─── Preview ────────────────────────────────────────────────────────────────
function DragHandle(){return <svg width="10" height="14" viewBox="0 0 10 14" fill="none" style={{flexShrink:0,opacity:.22}}><circle cx="3" cy="2.5" r="1.2" fill={NAVY}/><circle cx="7" cy="2.5" r="1.2" fill={NAVY}/><circle cx="3" cy="7" r="1.2" fill={NAVY}/><circle cx="7" cy="7" r="1.2" fill={NAVY}/><circle cx="3" cy="11.5" r="1.2" fill={NAVY}/><circle cx="7" cy="11.5" r="1.2" fill={NAVY}/></svg>;}

function SequencingPreview({data}){
  const correct=data.items.map(i=>i.id);
  const [items,setItems]=useState(()=>shuffle([...data.items]));
  const [submitted,setSubmitted]=useState(false);
  const [showCorrect,setShowCorrect]=useState(false);
  const [dSrc,setDSrc]=useState(null);
  const [dOver,setDOver]=useState(null);
  const dragEnd=()=>{setDSrc(null);setDOver(null);};
  const drop=(e,i)=>{e.preventDefault();if(dSrc===null||dSrc===i){dragEnd();return;}const n=[...items];const[m]=n.splice(dSrc,1);n.splice(i,0,m);setItems(n);dragEnd();};
  const wrong=submitted?items.map((it,i)=>({it,i,ci:correct.indexOf(it.id)})).filter(r=>r.i!==r.ci):[];
  const cc=items.length-wrong.length;const allOk=wrong.length===0;
  const reset=()=>{setItems(shuffle([...data.items]));setSubmitted(false);setShowCorrect(false);};
  return(<div>
    <p style={{fontSize:15,color:TS,lineHeight:1.65,marginBottom:"1.25rem"}}>{data.instruction}</p>
    <div style={{marginBottom:"1.25rem"}}>
      {items.map((item,idx)=>{const ic=submitted&&item.id===correct[idx],iw=submitted&&!ic,io=dOver===idx&&dSrc!==idx,id=dSrc===idx;return(<div key={item.id} draggable={!submitted} onDragStart={()=>setDSrc(idx)} onDragEnd={dragEnd} onDragOver={e=>{e.preventDefault();if(idx!==dSrc)setDOver(idx);}} onDrop={e=>drop(e,idx)} style={{display:"flex",alignItems:"center",gap:10,padding:".75rem 1rem",marginBottom:".5rem",background:ic?GRN_L:iw?RED_L:io?"#EEF4FF":"#fff",border:`1.5px solid ${ic?GRN:iw?RED:io?"#185FA5":BORDER}`,borderTop:io&&!submitted?"3px solid #185FA5":undefined,borderRadius:8,cursor:submitted?"default":id?"grabbing":"grab",opacity:id?.35:1,userSelect:"none",transition:"background .12s,border-color .12s"}}>
        <span style={{fontSize:13,fontWeight:600,color:TT,width:18,textAlign:"right",flexShrink:0}}>{idx+1}</span>
        {submitted?<span style={{fontSize:15,fontWeight:700,color:ic?GRN:RED,width:14,flexShrink:0}}>{ic?"✓":"✗"}</span>:<DragHandle/>}
        <span style={{fontSize:15,color:NAVY,lineHeight:1.5,flex:1}}>{item.label||<em style={{color:TT,fontWeight:400}}>Empty step</em>}</span>
      </div>);})}
    </div>
    {!submitted&&<div style={{display:"flex",justifyContent:"flex-end"}}><button onClick={()=>setSubmitted(true)} style={{padding:".6rem 1.5rem",borderRadius:50,border:"none",background:RED,color:"#fff",fontFamily:SANS,fontSize:15,fontWeight:700,cursor:"pointer"}}>{data.submitLabel}</button></div>}
    {submitted&&<div>
      <div style={{padding:"1rem 1.25rem",borderRadius:10,marginBottom:"1rem",background:allOk?GRN_L:RED_L,border:`1.5px solid ${allOk?GRN:RED}`,display:"flex",alignItems:"center",gap:14}}><span style={{fontSize:26}}>{allOk?"✓":"✗"}</span><div><div style={{fontSize:15,fontWeight:600,color:allOk?GRN:RED,marginBottom:2}}>{allOk?"All correct.":`${cc} of ${items.length} correct.`}</div><div style={{fontSize:14,color:TS}}>{allOk?"Every step is in the right place.":"Read the explanations below."}</div></div></div>
      {wrong.length>0&&<div style={{marginBottom:"1rem"}}>
        <div style={{fontSize:12,fontWeight:600,color:TT,marginBottom:".5rem"}}>Why these steps are out of order</div>
        {wrong.map(({it,i,ci})=><div key={it.id} style={{padding:".875rem 1rem",borderRadius:8,marginBottom:".5rem",background:AMB_L,border:"1px solid #FAC775"}}>
          <div style={{fontSize:12,fontWeight:600,color:AMB,marginBottom:4}}>You placed this at step {i+1} — it belongs at step {ci+1}</div>
          <div style={{fontSize:15,fontWeight:500,color:NAVY,lineHeight:1.5,marginBottom:4}}>{it.label}</div>
          <div style={{fontSize:14,color:TS,lineHeight:1.65}}>{it.rationale}</div>
        </div>)}
        {!showCorrect&&<button onClick={()=>setShowCorrect(true)} style={{fontSize:14,color:NAVY,background:"none",border:`1px solid ${BORDER}`,borderRadius:50,padding:".4rem 1rem",cursor:"pointer",fontFamily:SANS,fontWeight:600,marginTop:4}}>Show correct order →</button>}
      </div>}
      {showCorrect&&<div style={{marginBottom:"1rem"}}>
        <div style={{fontSize:12,fontWeight:600,color:GRN,marginBottom:".5rem"}}>Correct sequence</div>
        {data.items.map((it,i)=><div key={it.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:".6rem .875rem",marginBottom:".375rem",background:GRN_L,border:`1px solid ${GRN}`,borderRadius:8}}><span style={{fontSize:13,fontWeight:700,color:GRN,width:18,flexShrink:0}}>{i+1}.</span><span style={{fontSize:15,color:"#04342C",lineHeight:1.5}}>{it.label}</span></div>)}
      </div>}
      <button onClick={reset} style={{fontSize:14,color:TS,background:"none",border:`1px solid ${BORDER}`,borderRadius:50,padding:".4rem 1rem",cursor:"pointer",fontFamily:SANS,fontWeight:500}}>Try again</button>
    </div>}
  </div>);
}

// ─── Editor ─────────────────────────────────────────────────────────────────
function Lbl({children}){return <div style={{fontSize:11,fontWeight:600,color:TT,fontFamily:SANS,marginBottom:".375rem"}}>{children}</div>;}
const iStyle={width:"100%",border:`1.5px solid ${BORDER}`,borderRadius:8,padding:".65rem 1rem",fontFamily:SANS,fontSize:15,color:NAVY,background:"#fff",outline:"none",lineHeight:1.6,boxSizing:"border-box"};

function SeqEditor({content,onChange}){
  const set=(k,v)=>onChange({...content,[k]:v});
  const setItem=(idx,k,v)=>{const items=[...content.items];items[idx]={...items[idx],[k]:v};onChange({...content,items});};
  const addItem=()=>onChange({...content,items:[...content.items,{id:uid(),label:"",rationale:""}]});
  const removeItem=idx=>content.items.length>2&&onChange({...content,items:content.items.filter((_,i)=>i!==idx)});
  return(<div>
    <div style={{marginBottom:".875rem"}}><Lbl>Topic *</Lbl><input value={content.topic} onChange={e=>set("topic",e.target.value)} placeholder="e.g. Conducting a performance review conversation" style={iStyle}/></div>
    <div style={{marginBottom:"1.25rem"}}><Lbl>Objective *</Lbl><input value={content.objective} onChange={e=>set("objective",e.target.value)} placeholder="e.g. Arrange the stages of the conversation in the correct order." style={iStyle}/></div>
    <div style={{marginBottom:".375rem"}}><Lbl>Steps in correct order ({content.items.length})</Lbl></div>
    <div style={{fontSize:14,color:TS,marginBottom:".875rem",lineHeight:1.6}}>List steps in the correct sequence — the activity shuffles them for learners. Include at least 2 pairs that are commonly swapped.</div>
    {content.items.map((item,idx)=><div key={item.id} style={{padding:".625rem .875rem",marginBottom:".375rem",background:"#F8F9FB",border:`1px solid ${BORDER}`,borderLeft:`3px solid ${NAVY}`,borderRadius:8,display:"flex",gap:"1rem",alignItems:"flex-start"}}>
      <span style={{fontSize:13,fontWeight:600,color:NAVY,flexShrink:0,paddingTop:".55rem",minWidth:16}}>{idx+1}</span>
      <div style={{flex:1,minWidth:0}}>
        <input value={item.label} onChange={e=>setItem(idx,"label",e.target.value)} placeholder={`Step ${idx+1} label`} style={{...iStyle,marginBottom:".3rem",padding:".45rem .75rem"}}/>
        <textarea value={item.rationale} onChange={e=>setItem(idx,"rationale",e.target.value)} placeholder="Why does this step belong here? What goes wrong if it's misplaced?" style={{...iStyle,resize:"none",lineHeight:1.5,padding:".45rem .75rem"}} rows={2}/>
      </div>
      {content.items.length>2&&<button onClick={()=>removeItem(idx)} style={{background:"none",border:"none",color:RED,cursor:"pointer",fontSize:14,fontFamily:SANS,padding:0,flexShrink:0,paddingTop:".55rem"}}>×</button>}
    </div>)}
    <button onClick={addItem} style={{width:"100%",fontSize:14,color:NAVY,background:"none",border:`1px dashed ${BORDER}`,borderRadius:8,padding:".5rem",cursor:"pointer",fontFamily:SANS,marginTop:".25rem"}}>+ Add step</button>
  </div>);
}

// ─── AI Panel ───────────────────────────────────────────────────────────────
function CopyButton({label,hint,copied,onClick,primary}){
  return(<button onClick={onClick} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:primary?".55rem .75rem":".45rem .5rem",borderRadius:primary?50:8,border:`1.5px solid ${copied?GRN:primary?"#B8D4C8":BORDER}`,background:copied?GRN:primary?GRN_L:"#F8F9FB",color:copied?"#fff":primary?GRN:TS,fontFamily:SANS,fontSize:primary?14:13,fontWeight:primary?700:600,cursor:"pointer",transition:"all .18s",textAlign:"center",flexDirection:"column",gap:2}}>
    {copied?<span style={{display:"flex",alignItems:"center",gap:5}}><svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 7l3.5 3.5L11 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>Copied!</span>:<span style={{display:"flex",alignItems:"center",gap:5}}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 4V2.5A1.5 1.5 0 0 0 6.5 1H2.5A1.5 1.5 0 0 0 1 2.5V6.5A1.5 1.5 0 0 0 2.5 8H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>{label}</span>}
    {hint&&!copied&&<span style={{fontSize:11,fontWeight:400,opacity:.65,letterSpacing:".02em"}}>{hint}</span>}
  </button>);
}

function AIPanel({onApply}){
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
  const generate=async()=>{if(!canGenerate)return;setLoading(true);setError(null);setDone(false);try{const raw=await aiGen(desc,fileCtx);const parsed=parseJ(raw);if(!parsed)throw new Error("Could not parse response. Try rephrasing.");onApply(parsed);setDone(true);setTimeout(()=>{setOpen(false);setDone(false);},900);}catch(e){setError(e.message);}setLoading(false);};
  const handleKey=e=>{if((e.metaKey||e.ctrlKey)&&e.key==="Enter")generate();};
  return(<div style={{marginBottom:"1.25rem"}}>
    {!open&&(<button onClick={()=>{setOpen(true);setTimeout(()=>taRef.current?.focus(),80);}} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"1rem 1.25rem",borderRadius:12,border:`1.5px solid ${BORDER}`,background:"#fff",cursor:"pointer",textAlign:"left",fontFamily:SANS,boxShadow:"0 1px 3px rgba(24,48,63,.04)"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=NAVY;e.currentTarget.style.boxShadow="0 2px 8px rgba(24,48,63,.1)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=BORDER;e.currentTarget.style.boxShadow="0 1px 3px rgba(24,48,63,.04)";}}>
      <div style={{width:34,height:34,borderRadius:8,background:NAVY,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 1L3 9h5l-1 6 7-9H9l1-5z" fill="#fff" stroke="#fff" strokeWidth=".5" strokeLinejoin="round"/></svg></div>
      <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:NAVY,marginBottom:2}}>Generate with AI</div><div style={{fontSize:14,color:TT}}>Describe your topic — AI drafts the full activity in seconds</div></div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,color:TT}}><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>)}
    {open&&(<div style={{borderRadius:12,border:`1.5px solid ${NAVY}`,background:"#fff",overflow:"hidden",boxShadow:"0 2px 8px rgba(24,48,63,.1)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:".875rem 1.25rem",borderBottom:`1px solid ${BORDER}`}}>
        <div style={{width:34,height:34,borderRadius:8,background:NAVY,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 1L3 9h5l-1 6 7-9H9l1-5z" fill="#fff" stroke="#fff" strokeWidth=".5" strokeLinejoin="round"/></svg></div>
        <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:NAVY}}>Generate with AI</div><div style={{fontSize:14,color:TT}}>Describe your topic — AI drafts the full activity in seconds</div></div>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:TT,cursor:"pointer",fontSize:20,lineHeight:1,padding:"0 0 0 .5rem",fontFamily:SANS}}>&times;</button>
      </div>
      <div style={{padding:"1.125rem 1.25rem"}}>
        <textarea ref={taRef} value={desc} onChange={e=>setDesc(e.target.value)} onKeyDown={handleKey} placeholder="e.g. The correct steps for escalating a client complaint — from initial acknowledgement through to resolution sign-off" rows={3} style={{...iStyle,resize:"none",lineHeight:1.65,minHeight:90,marginBottom:".75rem"}}/>
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
export default function SequencingPage(){
  useInterFont();
  const mobile=useMobile();
  const [view,setView]=useState("studio");
  const [content,setContent]=useState(mkSeq);
  const [outputSnippet,setOutputSnippet]=useState(null);
  const [copiedSnippet,setCopiedSnippet]=useState(false);
  const [copiedEmbed,setCopiedEmbed]=useState(false);
  const [copiedFull,setCopiedFull]=useState(false);

  const isReady=content.topic.trim().length>1&&content.items.filter(i=>i.label.trim()).length>=2;

  const handleCreate=()=>{const s=buildOutputHTML(content);setOutputSnippet(s);setTimeout(()=>document.getElementById("output-panel")?.scrollIntoView({behavior:"smooth"}),60);};

  function copyText(text,setFlag){
    const finish=()=>{setFlag(true);setTimeout(()=>setFlag(false),2200);};
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(finish).catch(()=>fallback(text,finish));}else{fallback(text,finish);}
    function fallback(t,cb){const el=document.createElement('textarea');el.value=t;el.style.cssText='position:fixed;top:-9999px;left:-9999px;opacity:0';document.body.appendChild(el);el.focus();el.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(el);cb();}
  }
  const handleCopySnippet=()=>copyText(outputSnippet,setCopiedSnippet);
  const handleCopyEmbed=()=>copyText(buildEmbedSnippet(content),setCopiedEmbed);
  const handleCopyFull=()=>copyText(wrapFullHTML(outputSnippet,content.topic),setCopiedFull);
  const handleDownload=()=>{const full=wrapFullHTML(outputSnippet,content.topic);const fname=(content.topic||'sequencing').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,40)+'.html';downloadFile(full,fname);};

  return(
    <div style={{fontFamily:SANS,minHeight:"100vh",background:"#F4F6F7",color:NAVY}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}[draggable=true]{-webkit-user-drag:element;}button:active{transform:scale(.97);}button:focus,input:focus,textarea:focus,select:focus{outline:none;}input:focus,textarea:focus{border-color:${RED}!important;}`}</style>

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
        <div style={{maxWidth:720,margin:"0 auto",padding:"2rem 1.5rem"}}>
          <div style={{marginBottom:"1.75rem"}}>
            <div style={{fontSize:14,fontWeight:600,color:RED,marginBottom:".5rem"}}>Sequencing</div>
            <h1 style={{fontSize:mobile?26:32,fontWeight:300,color:NAVY,marginBottom:".5rem",lineHeight:1.2,letterSpacing:"-.01em"}}>{content.topic||<em style={{opacity:.35,fontWeight:300,fontStyle:"italic"}}>No topic yet</em>}</h1>
            <p style={{fontSize:15,color:TS,lineHeight:1.6}}>{content.objective}</p>
          </div>
          <SequencingPreview key={JSON.stringify(content)} data={content}/>
        </div>
      )}

      {/* Studio */}
      {view==="studio"&&(
        <div style={{maxWidth:820,margin:"0 auto",padding:mobile?"1rem":"1.75rem 1.5rem"}}>
          <AIPanel onApply={parsed=>applyAI(parsed,setContent)}/>
          <div style={{padding:"1.25rem",background:"#fff",border:`1px solid ${BORDER}`,borderRadius:12,boxShadow:"0 1px 4px rgba(26,43,74,0.05)",marginBottom:"1.5rem"}}>
            <div style={{fontSize:14,fontWeight:600,color:TT,marginBottom:"1rem"}}>Content editor</div>
            <SeqEditor content={content} onChange={setContent}/>
          </div>

          {/* Sticky action bar */}
          <div style={{position:"sticky",bottom:0,background:"#fff",borderTop:`1px solid ${BORDER}`,padding:".875rem 1.25rem",display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap",marginLeft:mobile?"-1rem":"-1.5rem",marginRight:mobile?"-1rem":"-1.5rem",zIndex:50}}>
            <div style={{display:"flex",gap:"1rem",flex:1,flexWrap:"wrap"}}>
              {[
                {ok:content.topic.trim().length>1,label:"Topic"},
                {ok:content.items.filter(i=>i.label.trim()).length>=2,label:"Steps"},
                {ok:content.items.every(i=>i.rationale.trim()),label:"Rationales"},
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
