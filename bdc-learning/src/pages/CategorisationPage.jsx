import { useState, useRef, useEffect } from "react";

function useMobile(){const[m,setM]=useState(()=>typeof window!=='undefined'&&window.innerWidth<700);useEffect(()=>{const h=()=>setM(window.innerWidth<700);window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h);},[]);return m;}
function useInterFont(){useEffect(()=>{if(document.getElementById('inter-font'))return;const l=document.createElement('link');l.id='inter-font';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700&display=swap';document.head.appendChild(l);},[]);}

// ─── Design system ─────────────────────────────────────────────────────────
const RED="#E8192C",RED_L="#FDEAEA",NAVY="#18303F",GRN="#0F6E56",GRN_L="#E1F5EE";
const AMB="#854F0B",AMB_L="#FAEEDA",BORDER="#D8DDE3",TS="#18303F",TT="#4A6070";
const SANS="'Inter',system-ui,-apple-system,sans-serif";
const CAT_COLORS=["#185FA5","#0F6E56","#A32D2D","#854F0B"];

// ─── Utilities ──────────────────────────────────────────────────────────────
let _n=0;
const uid=()=>`i${++_n}`;
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function parseJ(raw){try{return JSON.parse(raw.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim());}catch{return null;}}
function eH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// ─── Default blank content ──────────────────────────────────────────────────
const mkCat=()=>({topic:"",objective:"",instruction:"Drag each card into the category where it belongs. Place all cards before submitting.",submitLabel:"Check my categorisation",categories:[{id:uid(),label:"",color:CAT_COLORS[0]},{id:uid(),label:"",color:CAT_COLORS[1]}],items:Array.from({length:4},()=>({id:uid(),label:"",categoryId:"",rationale:""}))});

// ─── AI generation ──────────────────────────────────────────────────────────
async function aiGen(desc,ctx){
  const extra=ctx?"\n\nAdditional context from uploaded files:\n"+ctx:"";
  const sys=`You are an expert instructional designer. Create a drag-and-drop CATEGORISATION activity.
Rules: 2-3 categories (max 4). 5-8 items each belonging unambiguously to one category. At least 1 misclassification trap. Rationale explains WHY, especially for tricky items.
Return ONLY valid JSON, no markdown, no preamble:
{"topic":"Short title","objective":"One sentence starting with a verb","categories":[{"id":"cat-1","label":"Category name"},…],"items":[{"id":"c1","label":"Item text","categoryId":"cat-1","rationale":"Why this category"},…]}`;
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,system:sys,messages:[{role:"user",content:desc+extra}]})});
  const d=await res.json();
  if(d.error)throw new Error(d.error.message);
  return d.content[0].text;
}
function applyAI(parsed,setContent){
  const catMap={};
  const cats=(parsed.categories||[]).map((c,i)=>{const nid=uid();catMap[c.id]=nid;return{id:nid,label:c.label||"",color:CAT_COLORS[i]||CAT_COLORS[0]};});
  setContent(c=>({...c,topic:parsed.topic||"",objective:parsed.objective||"",categories:cats,items:(parsed.items||[]).map(it=>({id:uid(),label:it.label||"",categoryId:catMap[it.categoryId]||cats[0]?.id||"",rationale:it.rationale||""}))}));
}

// ─── HTML output builders ───────────────────────────────────────────────────
function buildCatJS(id){
  return `(function(){
  var C=CONTRACT;
  function sf(a){var b=a.slice();for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=b[i];b[i]=b[j];b[j]=t;}return b;}
  function ec(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  var pool=sf(C.items.slice()),placed={};
  C.categories.forEach(function(c){placed[c.id]=[];});
  var submitted=false,dItem=null,dSrc=null;
  var app=document.getElementById('${id}a');
  function allIn(){return pool.length===0;}
  function cardHtml(item,zone,sub,ok){
    var bc=ok===true?'#0F6E56':ok===false?'#E8192C':'#D8DDE3',bg=ok===true?'#E1F5EE':ok===false?'#FDE8EA':'#fff';
    var h='<div class="bi" data-id="'+item.id+'" data-zone="'+zone+'" draggable="'+(!sub)+'" style="display:flex;align-items:center;gap:8px;padding:.6rem .875rem;margin-bottom:.4rem;border-radius:8px;border:1.5px solid '+bc+';background:'+bg+';cursor:'+(sub?'default':'grab')+';user-select:none;font-size:15px;color:#18303F;line-height:1.5;transition:background .12s,border-color .12s">';
    if(sub){h+='<span style="font-size:15px;font-weight:700;color:'+(ok?'#0F6E56':'#E8192C')+';flex-shrink:0">'+(ok?'&#10003;':'&#10007;')+'</span>';}
    else{h+='<svg style="flex-shrink:0;opacity:.22" width="10" height="14" viewBox="0 0 10 14"><circle cx="3" cy="2.5" r="1.2" fill="#18303F"/><circle cx="7" cy="2.5" r="1.2" fill="#18303F"/><circle cx="3" cy="7" r="1.2" fill="#18303F"/><circle cx="7" cy="7" r="1.2" fill="#18303F"/><circle cx="3" cy="11.5" r="1.2" fill="#18303F"/><circle cx="7" cy="11.5" r="1.2" fill="#18303F"/></svg>';}
    h+='<span style="flex:1">'+ec(item.label)+'</span></div>';
    return h;
  }
  function render(){
    var h='<p style="font-size:15px;color:#18303F;line-height:1.65;margin-bottom:1.25rem">'+ec(C.instruction)+'</p>';
    if(!submitted){
      h+='<div id="${id}pl" style="padding:.875rem 1rem;border-radius:10px;margin-bottom:1.5rem;background:#F8F9FB;border:1.5px dashed #D8DDE3;min-height:56px;transition:all .15s"><div style="font-size:12px;font-weight:600;color:#4A6070;margin-bottom:'+(pool.length?'.5rem':'0')+'">Unplaced items '+(pool.length?'('+pool.length+')':'— all placed')+'</div>';
      if(!pool.length)h+='<div style="font-size:14px;color:#4A6070;font-style:italic">Drag a card back here to change your mind.</div>';
      pool.forEach(function(it){h+=cardHtml(it,'pool',false,null);});
      h+='</div>';
    }
    h+='<div style="display:grid;grid-template-columns:repeat('+C.categories.length+',1fr);gap:.875rem;margin-bottom:1.25rem">';
    C.categories.forEach(function(cat){
      var its=placed[cat.id]||[];
      h+='<div class="bz" data-cat="'+cat.id+'" style="padding:.875rem;background:#F8F9FB;border:1.5px solid #D8DDE3;border-top:3px solid '+cat.color+';border-radius:10px;min-height:80px;transition:all .15s"><div style="font-size:13px;font-weight:600;color:'+cat.color+';margin-bottom:.625rem">'+ec(cat.label)+(its.length?' <span style="font-weight:400;opacity:.6">('+its.length+')</span>':'')+'</div>';
      if(!its.length&&!submitted)h+='<div style="font-size:13px;color:#4A6070;font-style:italic;text-align:center;padding:.5rem 0">Drop here</div>';
      its.forEach(function(it){h+=cardHtml(it,cat.id,submitted,submitted?(it.categoryId===cat.id):null);});
      h+='</div>';
    });
    h+='</div>';
    if(!submitted){
      var ai=allIn();
      h+='<div style="display:flex;justify-content:flex-end"><button id="${id}sb" style="padding:.6rem 1.5rem;border-radius:50px;border:none;background:'+(ai?'#E8192C':'#D8DDE3')+';color:'+(ai?'#fff':'#4A6070')+';font-size:15px;font-weight:700;cursor:'+(ai?'pointer':'default')+';font-family:inherit;transition:all .2s">'+(ai?ec(C.submitLabel):'Place '+pool.length+' remaining card'+(pool.length===1?'':'s')+' first')+'</button></div>';
    }else{
      var results=C.items.map(function(item){var pid=Object.keys(placed).find(function(cid){return placed[cid].some(function(i){return i.id===item.id;});});return{item:item,ok:pid===item.categoryId,pcat:C.categories.find(function(c){return c.id===pid;}),ccat:C.categories.find(function(c){return c.id===item.categoryId;})};});
      var cc=results.filter(function(r){return r.ok;}).length,ok=cc===C.items.length;
      h+='<div style="padding:1rem 1.25rem;border-radius:10px;margin-bottom:1rem;display:flex;align-items:center;gap:14px;background:'+(ok?'#E1F5EE':'#FDE8EA')+';border:1.5px solid '+(ok?'#0F6E56':'#E8192C')+'"><span style="font-size:26px;line-height:1">'+(ok?'&#10003;':'&#10007;')+'</span><div><div style="font-size:15px;font-weight:600;color:'+(ok?'#0F6E56':'#E8192C')+';margin-bottom:2px">'+(ok?'All correctly categorised.':cc+' of '+C.items.length+' correctly placed.')+'</div><div style="font-size:14px;color:#18303F">'+(ok?'Every card is in the right category.':'Read the explanations below.')+'</div></div></div>';
      results.filter(function(r){return!r.ok;}).forEach(function(r){h+='<div style="padding:.875rem 1rem;border-radius:8px;margin-bottom:.5rem;background:#FAEEDA;border:1px solid #FAC775"><div style="font-size:12px;font-weight:600;color:#854F0B;margin-bottom:4px">You placed this in '+(r.pcat?ec(r.pcat.label):'unknown')+' \u2014 it belongs in '+ec(r.ccat.label)+'</div><div style="font-size:15px;font-weight:500;color:#18303F;line-height:1.5;margin-bottom:4px">'+ec(r.item.label)+'</div><div style="font-size:14px;color:#18303F;line-height:1.65">'+ec(r.item.rationale)+'</div></div>';});
      h+='<button id="${id}rb" style="font-size:14px;color:#18303F;background:none;border:1px solid #D8DDE3;border-radius:50px;padding:.4rem 1rem;cursor:pointer;font-family:inherit;font-weight:500;margin-top:.5rem">Try again</button>';
    }
    app.innerHTML=h;
    var sb=document.getElementById('${id}sb');if(sb)sb.onclick=function(){if(allIn()){submitted=true;render();}};
    var rb=document.getElementById('${id}rb');if(rb)rb.onclick=function(){pool=sf(C.items.slice());placed={};C.categories.forEach(function(c){placed[c.id]=[];});submitted=false;dItem=null;dSrc=null;render();};
    if(!submitted){
      var pl=document.getElementById('${id}pl');
      if(pl){
        pl.ondragover=function(e){e.preventDefault();pl.style.background='#EEF4FF';pl.style.borderColor='#185FA5';};
        pl.ondragleave=function(e){if(!pl.contains(e.relatedTarget)){pl.style.background='#F8F9FB';pl.style.borderColor='#D8DDE3';}};
        pl.ondrop=function(e){e.preventDefault();pl.style.background='#F8F9FB';pl.style.borderColor='#D8DDE3';if(!dItem||dSrc==='pool')return;placed[dSrc]=placed[dSrc].filter(function(i){return i.id!==dItem.id;});pool.push(dItem);dItem=null;dSrc=null;render();};
      }
      document.querySelectorAll('#${id}a .bz').forEach(function(zEl){
        var catId=zEl.getAttribute('data-cat');var cat=C.categories.find(function(c){return c.id===catId;});
        zEl.ondragover=function(e){e.preventDefault();if(dSrc!==catId){zEl.style.background=cat.color+'18';zEl.style.borderColor=cat.color;}};
        zEl.ondragleave=function(e){if(!zEl.contains(e.relatedTarget)){zEl.style.background='#F8F9FB';zEl.style.borderColor='#D8DDE3';}};
        zEl.ondrop=function(e){e.preventDefault();zEl.style.background='#F8F9FB';zEl.style.borderColor='#D8DDE3';if(!dItem||dSrc===catId)return;if(dSrc==='pool')pool=pool.filter(function(i){return i.id!==dItem.id;});else placed[dSrc]=placed[dSrc].filter(function(i){return i.id!==dItem.id;});placed[catId].push(dItem);dItem=null;dSrc=null;render();};
      });
      document.querySelectorAll('#${id}a .bi').forEach(function(el){
        var iid=el.getAttribute('data-id'),zone=el.getAttribute('data-zone');
        el.ondragstart=function(e){var all=pool.slice();Object.values(placed).forEach(function(a){all=all.concat(a);});dItem=all.find(function(i){return i.id===iid;})||null;dSrc=zone;e.dataTransfer.effectAllowed='move';setTimeout(function(){el.style.opacity='.3';},0);};
        el.ondragend=function(){el.style.opacity='1';};
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
#${id}{font-family:'Inter',system-ui,-apple-system,sans-serif;max-width:900px;margin:0 auto;padding:2rem 1.5rem;color:#18303F;-webkit-font-smoothing:antialiased;}
#${id} *{box-sizing:border-box;}
#${id} button{font-family:'Inter',system-ui,-apple-system,sans-serif;}
</style>
<div id="${id}">
  <div style="margin-bottom:1.75rem">
    <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:#E8192C;margin-bottom:.5rem">Categorisation</div>
    <h1 style="font-size:30px;font-weight:300;color:#18303F;margin:0 0 .5rem;line-height:1.2;letter-spacing:-.01em">${eH(content.topic)}</h1>
    <p style="font-size:15px;color:#3D5060;margin:0;line-height:1.6">${eH(content.objective)}</p>
  </div>
  <div id="${id}a"></div>
</div>
<script>
var CONTRACT=${C};
${buildCatJS(id)}
<\/script>`;
}

function buildEmbedSnippet(content){
  const id='bdc'+Math.random().toString(36).slice(2,9);
  const C=JSON.stringify(content).replace(/<\/script>/gi,'<\\/script>');
  return `<div id="${id}" style="font-family:'Inter',system-ui,-apple-system,sans-serif;max-width:900px;margin:0 auto;padding:2rem 1.5rem;color:#18303F;-webkit-font-smoothing:antialiased;box-sizing:border-box">
  <div style="margin-bottom:1.75rem">
    <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:#E8192C;margin-bottom:.5rem">Categorisation</div>
    <h1 style="font-size:30px;font-weight:300;color:#18303F;margin:0 0 .5rem;line-height:1.2;letter-spacing:-.01em">${eH(content.topic)}</h1>
    <p style="font-size:15px;color:#3D5060;margin:0;line-height:1.6">${eH(content.objective)}</p>
  </div>
  <div id="${id}a"></div>
</div>
<script>
var CONTRACT=${C};
${buildCatJS(id)}
<\/script>`;
}

function wrapFullHTML(snippet,title){
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${eH(title||'Categorisation Activity')}</title>
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

function CategorisationPreview({data}){
  const [pool,setPool]=useState(()=>shuffle([...data.items]));
  const [placed,setPlaced]=useState(()=>Object.fromEntries(data.categories.map(c=>[c.id,[]])));
  const [submitted,setSubmitted]=useState(false);
  const [drag,setDrag]=useState(null);
  const [src,setSrc]=useState(null);
  const [over,setOver]=useState(null);
  const allIn=pool.length===0;
  const startDrag=(item,s)=>{setDrag(item);setSrc(s);};
  const endDrag=()=>{setDrag(null);setSrc(null);setOver(null);};
  const dropCat=cat=>{if(!drag)return;if(src===cat){endDrag();return;}if(src==="pool")setPool(p=>p.filter(i=>i.id!==drag.id));else setPlaced(p=>({...p,[src]:p[src].filter(i=>i.id!==drag.id)}));setPlaced(p=>({...p,[cat]:[...p[cat],drag]}));endDrag();};
  const dropPool=()=>{if(!drag||src==="pool"){endDrag();return;}setPlaced(p=>({...p,[src]:p[src].filter(i=>i.id!==drag.id)}));setPool(p=>[...p,drag]);endDrag();};
  const results=submitted?data.items.map(item=>{const pe=Object.entries(placed).find(([,its])=>its.some(i=>i.id===item.id));const pid=pe?pe[0]:null;const ok=pid===item.categoryId;return{item,ok,pcat:data.categories.find(c=>c.id===pid),ccat:data.categories.find(c=>c.id===item.categoryId)};}):[]; 
  const cc=results.filter(r=>r.ok).length;const allOk=cc===data.items.length;
  const reset=()=>{setPool(shuffle([...data.items]));setPlaced(Object.fromEntries(data.categories.map(c=>[c.id,[]])));setSubmitted(false);setDrag(null);setSrc(null);setOver(null);};
  const card=(item,s)=>{const res=submitted?results.find(r=>r.item.id===item.id):null;const ic=res?.ok,iw=submitted&&!ic,id=drag?.id===item.id;return(<div key={item.id} draggable={!submitted} onDragStart={()=>startDrag(item,s)} onDragEnd={endDrag} style={{display:"flex",alignItems:"center",gap:8,padding:".6rem .875rem",marginBottom:".4rem",background:ic?GRN_L:iw?RED_L:"#fff",border:`1.5px solid ${ic?GRN:iw?RED:BORDER}`,borderRadius:8,cursor:submitted?"default":id?"grabbing":"grab",opacity:id?.3:1,fontSize:15,color:NAVY,lineHeight:1.5,userSelect:"none",transition:"background .12s,border-color .12s"}}>{submitted?<span style={{fontSize:15,fontWeight:700,color:ic?GRN:RED,flexShrink:0}}>{ic?"✓":"✗"}</span>:<DragHandle/>}<span style={{flex:1}}>{item.label||<em style={{color:TT}}>Empty item</em>}</span></div>);};
  return(<div>
    <p style={{fontSize:15,color:TS,lineHeight:1.65,marginBottom:"1.25rem"}}>{data.instruction}</p>
    {!submitted&&<div onDragOver={e=>{e.preventDefault();setOver("pool");}} onDrop={e=>{e.preventDefault();dropPool();}} style={{padding:".875rem 1rem",borderRadius:10,marginBottom:"1.5rem",background:over==="pool"?"#EEF4FF":"#F8F9FB",border:`1.5px dashed ${over==="pool"?"#185FA5":BORDER}`,minHeight:56,transition:"all .15s"}}>
      <div style={{fontSize:12,fontWeight:600,color:TT,marginBottom:pool.length>0?".625rem":0}}>Unplaced items {pool.length>0?`(${pool.length})`:"— all placed"}</div>
      {pool.length===0&&<div style={{fontSize:14,color:TT,fontStyle:"italic"}}>Drag a card back here to change your mind.</div>}
      {pool.map(it=>card(it,"pool"))}
    </div>}
    <div style={{display:"grid",gridTemplateColumns:`repeat(${data.categories.length},1fr)`,gap:".875rem",marginBottom:"1.25rem"}}>
      {data.categories.map(cat=>{const its=placed[cat.id]||[];const io=over===cat.id&&src!==cat.id;return(<div key={cat.id} onDragOver={e=>{e.preventDefault();setOver(cat.id);}} onDrop={e=>{e.preventDefault();dropCat(cat.id);}} style={{padding:".875rem",background:io?cat.color+"12":"#F8F9FB",border:`1.5px solid ${io?cat.color:BORDER}`,borderTop:`3px solid ${cat.color}`,borderRadius:10,minHeight:80,transition:"all .15s"}}>
        <div style={{fontSize:13,fontWeight:600,color:cat.color,marginBottom:".625rem"}}>{cat.label||<em style={{fontWeight:400,opacity:.6}}>Unnamed</em>}{its.length>0&&<span style={{fontWeight:400,opacity:.6}}> ({its.length})</span>}</div>
        {its.length===0&&!submitted&&<div style={{fontSize:13,color:TT,fontStyle:"italic",textAlign:"center",padding:".5rem 0"}}>Drop here</div>}
        {its.map(it=>card(it,cat.id))}
      </div>);})}
    </div>
    {!submitted&&<div style={{display:"flex",justifyContent:"flex-end"}}><button onClick={()=>allIn&&setSubmitted(true)} disabled={!allIn} style={{padding:".6rem 1.5rem",borderRadius:50,border:"none",background:allIn?RED:BORDER,color:allIn?"#fff":TT,fontFamily:SANS,fontSize:15,fontWeight:700,cursor:allIn?"pointer":"default",transition:"all .2s"}}>{allIn?data.submitLabel:`Place ${pool.length} remaining card${pool.length===1?"":"s"} first`}</button></div>}
    {submitted&&<div>
      <div style={{padding:"1rem 1.25rem",borderRadius:10,marginBottom:"1rem",background:allOk?GRN_L:RED_L,border:`1.5px solid ${allOk?GRN:RED}`,display:"flex",alignItems:"center",gap:14}}><span style={{fontSize:26}}>{allOk?"✓":"✗"}</span><div><div style={{fontSize:15,fontWeight:600,color:allOk?GRN:RED,marginBottom:2}}>{allOk?"All correctly categorised.":`${cc} of ${data.items.length} correctly placed.`}</div><div style={{fontSize:14,color:TS}}>{allOk?"Every card is in the right category.":"Read the explanations below."}</div></div></div>
      {results.filter(r=>!r.ok).length>0&&<div style={{marginBottom:"1rem"}}>
        <div style={{fontSize:12,fontWeight:600,color:TT,marginBottom:".5rem"}}>Why these are in the wrong category</div>
        {results.filter(r=>!r.ok).map(({item,pcat,ccat})=><div key={item.id} style={{padding:".875rem 1rem",borderRadius:8,marginBottom:".5rem",background:AMB_L,border:"1px solid #FAC775"}}>
          <div style={{fontSize:12,fontWeight:600,color:AMB,marginBottom:4}}>You placed this in {pcat?.label||"unknown"} — it belongs in {ccat?.label}</div>
          <div style={{fontSize:15,fontWeight:500,color:NAVY,lineHeight:1.5,marginBottom:4}}>{item.label}</div>
          <div style={{fontSize:14,color:TS,lineHeight:1.65}}>{item.rationale}</div>
        </div>)}
      </div>}
      <button onClick={reset} style={{fontSize:14,color:TS,background:"none",border:`1px solid ${BORDER}`,borderRadius:50,padding:".4rem 1rem",cursor:"pointer",fontFamily:SANS,fontWeight:500}}>Try again</button>
    </div>}
  </div>);
}

// ─── Editor ─────────────────────────────────────────────────────────────────
function Lbl({children}){return <div style={{fontSize:11,fontWeight:600,color:TT,fontFamily:SANS,marginBottom:".375rem"}}>{children}</div>;}
const iStyle={width:"100%",border:`1.5px solid ${BORDER}`,borderRadius:8,padding:".65rem 1rem",fontFamily:SANS,fontSize:15,color:NAVY,background:"#fff",outline:"none",lineHeight:1.6,boxSizing:"border-box"};

function CatEditor({content,onChange}){
  const set=(k,v)=>onChange({...content,[k]:v});
  const setCat=(idx,k,v)=>{const cats=[...content.categories];cats[idx]={...cats[idx],[k]:v};onChange({...content,categories:cats});};
  const addCat=()=>{if(content.categories.length>=4)return;onChange({...content,categories:[...content.categories,{id:uid(),label:"",color:CAT_COLORS[content.categories.length]||CAT_COLORS[0]}]});};
  const removeCat=idx=>{if(content.categories.length<=2)return;const catId=content.categories[idx].id;const cats=content.categories.filter((_,i)=>i!==idx);const items=content.items.map(it=>it.categoryId===catId?{...it,categoryId:cats[0]?.id||""}:it);onChange({...content,categories:cats,items});};
  const setItem=(idx,k,v)=>{const items=[...content.items];items[idx]={...items[idx],[k]:v};onChange({...content,items});};
  const addItem=()=>onChange({...content,items:[...content.items,{id:uid(),label:"",categoryId:content.categories[0]?.id||"",rationale:""}]});
  const removeItem=idx=>content.items.length>2&&onChange({...content,items:content.items.filter((_,i)=>i!==idx)});
  return(<div>
    <div style={{marginBottom:".875rem"}}><Lbl>Topic *</Lbl><input value={content.topic} onChange={e=>set("topic",e.target.value)} placeholder="e.g. Types of conflict resolution strategies" style={iStyle}/></div>
    <div style={{marginBottom:"1.25rem"}}><Lbl>Objective *</Lbl><input value={content.objective} onChange={e=>set("objective",e.target.value)} placeholder="e.g. Classify each strategy into the correct conflict style." style={iStyle}/></div>
    <div style={{marginBottom:"1rem"}}>
      <Lbl>Categories (2–4)</Lbl>
      {content.categories.map((cat,idx)=><div key={cat.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:".4rem"}}><div style={{width:12,height:12,borderRadius:2,background:cat.color,flexShrink:0}}/><input value={cat.label} onChange={e=>setCat(idx,"label",e.target.value)} placeholder={`Category ${idx+1} name`} style={{flex:1,border:`1.5px solid ${BORDER}`,borderRadius:7,padding:".45rem .75rem",fontFamily:SANS,fontSize:15,color:NAVY,background:"#fff",outline:"none"}}/>{content.categories.length>2&&<button onClick={()=>removeCat(idx)} style={{background:"none",border:"none",color:RED,cursor:"pointer",fontSize:14,fontFamily:SANS,flexShrink:0,padding:0}}>Remove</button>}</div>)}
      {content.categories.length<4&&<button onClick={addCat} style={{fontSize:14,color:NAVY,background:"none",border:`1px dashed ${BORDER}`,borderRadius:7,padding:".35rem .875rem",cursor:"pointer",fontFamily:SANS,marginTop:".25rem"}}>+ Add category</button>}
    </div>
    <div>
      <div style={{marginBottom:".375rem"}}><Lbl>Items ({content.items.length})</Lbl></div>
      <div style={{fontSize:14,color:TS,marginBottom:".875rem",lineHeight:1.6}}>Include at least one item learners commonly put in the wrong category.</div>
      {content.items.map((item,idx)=>{const cat=content.categories.find(c=>c.id===item.categoryId);return(<div key={item.id} style={{padding:".625rem .875rem",marginBottom:".375rem",background:"#F8F9FB",border:`1px solid ${BORDER}`,borderLeft:`3px solid ${cat?.color||BORDER}`,borderRadius:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:".5rem"}}><select value={item.categoryId} onChange={e=>setItem(idx,"categoryId",e.target.value)} style={{border:`1.5px solid ${BORDER}`,borderRadius:6,padding:".45rem .75rem",fontFamily:SANS,fontSize:14,color:NAVY,background:"#fff",outline:"none",flex:1}}><option value="">Select category…</option>{content.categories.map(c=><option key={c.id} value={c.id}>{c.label||`Category (unnamed)`}</option>)}</select>{content.items.length>2&&<button onClick={()=>removeItem(idx)} style={{background:"none",border:"none",color:RED,cursor:"pointer",fontSize:14,fontFamily:SANS,padding:0,flexShrink:0}}>Remove</button>}</div>
        <input value={item.label} onChange={e=>setItem(idx,"label",e.target.value)} placeholder="Item text" style={{...iStyle,marginBottom:".3rem",padding:".45rem .75rem"}}/>
        <textarea value={item.rationale} onChange={e=>setItem(idx,"rationale",e.target.value)} placeholder="Why this category? Especially important for tricky items." style={{...iStyle,resize:"none",lineHeight:1.5,padding:".45rem .75rem"}} rows={2}/>
      </div>);})}
      <button onClick={addItem} style={{width:"100%",fontSize:14,color:NAVY,background:"none",border:`1px dashed ${BORDER}`,borderRadius:8,padding:".5rem",cursor:"pointer",fontFamily:SANS,marginTop:".25rem"}}>+ Add item</button>
    </div>
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
        <textarea ref={taRef} value={desc} onChange={e=>setDesc(e.target.value)} onKeyDown={handleKey} placeholder="e.g. Classify feedback examples into constructive, positive reinforcement, and destructive criticism. Include a trap item learners often misclassify." rows={3} style={{...iStyle,resize:"none",lineHeight:1.65,minHeight:90,marginBottom:".75rem"}}/>
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
export default function CategorisationPage(){
  useInterFont();
  const mobile=useMobile();
  const [view,setView]=useState("studio");
  const [content,setContent]=useState(mkCat);
  const [outputSnippet,setOutputSnippet]=useState(null);
  const [copiedSnippet,setCopiedSnippet]=useState(false);
  const [copiedEmbed,setCopiedEmbed]=useState(false);
  const [copiedFull,setCopiedFull]=useState(false);

  const isReady=content.topic.trim().length>1&&content.items.filter(i=>i.label.trim()).length>=2&&content.categories.filter(c=>c.label.trim()).length>=2;

  const handleCreate=()=>{const s=buildOutputHTML(content);setOutputSnippet(s);setTimeout(()=>document.getElementById("output-panel")?.scrollIntoView({behavior:"smooth"}),60);};

  function copyText(text,setFlag){
    const finish=()=>{setFlag(true);setTimeout(()=>setFlag(false),2200);};
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(finish).catch(()=>fallback(text,finish));}else{fallback(text,finish);}
    function fallback(t,cb){const el=document.createElement('textarea');el.value=t;el.style.cssText='position:fixed;top:-9999px;left:-9999px;opacity:0';document.body.appendChild(el);el.focus();el.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(el);cb();}
  }
  const handleCopySnippet=()=>copyText(outputSnippet,setCopiedSnippet);
  const handleCopyEmbed=()=>copyText(buildEmbedSnippet(content),setCopiedEmbed);
  const handleCopyFull=()=>copyText(wrapFullHTML(outputSnippet,content.topic),setCopiedFull);
  const handleDownload=()=>{const full=wrapFullHTML(outputSnippet,content.topic);const fname=(content.topic||'categorisation').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,40)+'.html';downloadFile(full,fname);};

  return(
    <div style={{fontFamily:SANS,minHeight:"100vh",background:"#F4F6F7",color:NAVY}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}[draggable=true]{-webkit-user-drag:element;}button:active{transform:scale(.97);}button:focus,input:focus,textarea:focus,select:focus{outline:none;}input:focus,textarea:focus{border-color:${RED}!important;}`}</style>

      {/* Nav */}
      <div style={{background:"#fff",borderBottom:"1px solid #E8ECEE",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:900,margin:"0 auto",padding:"0 1.5rem",display:"flex",alignItems:"center",height:56,position:"relative",width:"100%"}}>
          <div style={{fontSize:27,fontWeight:700,color:NAVY,letterSpacing:"-.02em",flexShrink:0}}>bdc<span style={{color:RED}}>*</span></div>
          <div style={{display:"flex",gap:0,position:"absolute",left:"50%",transform:"translateX(-50%)"}}>
            {[{id:"studio",label:"Studio"},{id:"preview",label:"Preview"}].map(v=><button key={v.id} onClick={()=>setView(v.id)} style={{padding:"0 1.25rem",height:56,background:"none",border:"none",borderBottom:`2px solid ${view===v.id?RED:"transparent"}`,color:view===v.id?NAVY:TT,fontSize:15,fontWeight:view===v.id?600:400,cursor:"pointer",fontFamily:SANS,transition:"all .2s"}}>{v.label}</button>)}
          </div>
        </div>
      </div>

      {/* Preview */}
      {view==="preview"&&(
        <div style={{maxWidth:900,margin:"0 auto",padding:"2rem 1.5rem"}}>
          <div style={{marginBottom:"1.75rem"}}>
            <div style={{fontSize:14,fontWeight:600,color:RED,marginBottom:".5rem"}}>Categorisation</div>
            <h1 style={{fontSize:mobile?26:32,fontWeight:300,color:NAVY,marginBottom:".5rem",lineHeight:1.2,letterSpacing:"-.01em"}}>{content.topic||<em style={{opacity:.35,fontWeight:300,fontStyle:"italic"}}>No topic yet</em>}</h1>
            <p style={{fontSize:15,color:TS,lineHeight:1.6}}>{content.objective}</p>
          </div>
          <CategorisationPreview key={JSON.stringify(content)} data={content}/>
        </div>
      )}

      {/* Studio */}
      {view==="studio"&&(
        <div style={{maxWidth:900,margin:"0 auto",padding:mobile?"1rem":"1.75rem 1.5rem"}}>
          <AIPanel onApply={parsed=>applyAI(parsed,setContent)}/>
          <div style={{padding:"1.25rem",background:"#fff",border:`1px solid ${BORDER}`,borderRadius:12,boxShadow:"0 1px 4px rgba(26,43,74,0.05)",marginBottom:"1.5rem"}}>
            <div style={{fontSize:14,fontWeight:600,color:TT,marginBottom:"1rem"}}>Content editor</div>
            <CatEditor content={content} onChange={setContent}/>
          </div>

          {/* Sticky action bar */}
          <div style={{position:"sticky",bottom:0,background:"#fff",borderTop:`1px solid ${BORDER}`,padding:".875rem 1.25rem",display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap",marginLeft:mobile?"-1rem":"-1.5rem",marginRight:mobile?"-1rem":"-1.5rem",zIndex:50}}>
            <div style={{display:"flex",gap:"1rem",flex:1,flexWrap:"wrap"}}>
              {[
                {ok:content.topic.trim().length>1,label:"Topic"},
                {ok:content.categories.filter(c=>c.label.trim()).length>=2,label:"Categories"},
                {ok:content.items.filter(i=>i.label.trim()).length>=2,label:"Items"},
                {ok:content.items.every(i=>i.rationale.trim()),label:"Rationales"},
                {ok:content.items.every(i=>i.categoryId),label:"Assigned"},
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
