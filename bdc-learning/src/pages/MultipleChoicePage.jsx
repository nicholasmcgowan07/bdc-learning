import { useState, useRef, useEffect } from "react";

function useMobile(){const[m,setM]=useState(()=>typeof window!=='undefined'&&window.innerWidth<700);useEffect(()=>{const h=()=>setM(window.innerWidth<700);window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h);},[]);return m;}
function useInterFont(){useEffect(()=>{if(document.getElementById('inter-font'))return;const l=document.createElement('link');l.id='inter-font';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700&display=swap';document.head.appendChild(l);},[]);}

// ─── Design system ─────────────────────────────────────────────────────────
const RED="#E8192C",RED_L="#FDEAEA",NAVY="#18303F",GRN="#0F6E56",GRN_L="#E1F5EE";
const AMB="#854F0B",AMB_L="#FAEEDA",BORDER="#D8DDE3",TS="#18303F",TT="#4A6070";
const SANS="'Inter',system-ui,-apple-system,sans-serif";
const OPTION_LETTERS=["A","B","C","D"];

// ─── Utilities ──────────────────────────────────────────────────────────────
let _n=0;
const uid=()=>`i${++_n}`;
function parseJ(raw){try{return JSON.parse(raw.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim());}catch{return null;}}
function eH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
const mkOpts=()=>["","","",""].map((_,i)=>({id:OPTION_LETTERS[i].toLowerCase(),text:""}));
const mkQ=()=>({id:uid(),text:"",options:mkOpts(),correct:"a",feedbackCorrect:"",feedbackIncorrect:""});

// ─── Default blank content ──────────────────────────────────────────────────
const mkMC=()=>({
  topic:"",
  objective:"",
  // Designer note: distractors (wrong options) must be plausible — learners should need to think to rule them out.
  questions:Array.from({length:1},mkQ),
  submitLabel:"See my results",
});

// ─── AI generation ──────────────────────────────────────────────────────────
async function aiGen(desc,ctx,count){
  const extra=ctx?"\n\nAdditional context from uploaded files:\n"+ctx:"";
  const n=count||1;
  const sys=`You are an expert instructional designer. Create a multiple choice activity with exactly ${n} question${n===1?"":"s"}.
Rules:
- Exactly ${n} question${n===1?"":"s"}, each with exactly 4 options (ids: "a","b","c","d")
- Mark exactly one correct answer per question
- Distractors MUST be plausible — a learner who doesn't know the material well should pause before ruling them out. Avoid obviously wrong options.
- feedbackCorrect: 1 sentence explaining WHY the correct answer is right
- feedbackIncorrect: 1 sentence explaining what to remember or what makes the correct answer better
- Questions should test application and understanding, not just recall

Return ONLY valid JSON, no markdown, no preamble:
{
  "topic": "Short title",
  "objective": "One sentence starting with a verb",
  "questions": [
    {
      "id": "q1",
      "text": "Question text",
      "options": [
        {"id":"a","text":"Option A"},
        {"id":"b","text":"Option B"},
        {"id":"c","text":"Option C"},
        {"id":"d","text":"Option D"}
      ],
      "correct": "a",
      "feedbackCorrect": "Why this is right",
      "feedbackIncorrect": "What to remember / why the correct answer is better"
    }
  ],
  "submitLabel": "See my results"
}`;
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,system:sys,messages:[{role:"user",content:desc+extra}]})});
  const d=await res.json();
  if(d.error)throw new Error(d.error.message);
  return d.content[0].text;
}
function applyAI(parsed,setContent){
  setContent(c=>({...c,
    topic:parsed.topic||"",
    objective:parsed.objective||"",
    submitLabel:parsed.submitLabel||c.submitLabel,
    questions:(parsed.questions||[]).map(q=>({
      id:uid(),
      text:q.text||"",
      options:(q.options||mkOpts()).map(o=>({id:o.id||"a",text:o.text||""})),
      correct:q.correct||"a",
      feedbackCorrect:q.feedbackCorrect||"",
      feedbackIncorrect:q.feedbackIncorrect||"",
    })),
  }));
}

// ─── HTML output builder ────────────────────────────────────────────────────
function buildMCJS(id){
  return `(function(){
  var C=CONTRACT;
  var answers={};
  var app=document.getElementById('${id}a');
  var letters=['A','B','C','D'];
  function ec(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function allAnswered(){return C.questions.every(function(q){return answers[q.id]!==undefined;});}
  function render(){
    var h='<p style="font-size:15px;color:#18303F;line-height:1.65;margin-bottom:1.5rem">'+(C.instruction||'')+'</p>';
    C.questions.forEach(function(q,qi){
      var sel=answers[q.id],locked=sel!==undefined;
      h+='<div style="padding:1.25rem;margin-bottom:.875rem;background:#fff;border:1.5px solid '+(locked?'#D8DDE3':'#D8DDE3')+';border-left:3px solid '+(locked&&sel===q.correct?'#0F6E56':locked?'#E8192C':'#18303F')+';border-radius:10px">';
      h+='<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:.875rem">';
      h+='<span style="font-size:12px;font-weight:700;color:#4A6070;flex-shrink:0;padding-top:2px">Q'+(qi+1)+'</span>';
      h+='<div style="font-size:16px;font-weight:500;color:#18303F;line-height:1.5">'+ec(q.text)+'</div></div>';
      h+='<div style="display:flex;flex-direction:column;gap:.4rem">';
      q.options.forEach(function(opt,oi){
        var isSelected=sel===opt.id,isCorrect=opt.id===q.correct;
        var bg='#fff',border='#D8DDE3',textColor='#18303F',letterBg='#F4F6F7',letterColor='#4A6070';
        if(locked){
          if(isCorrect){bg='#E1F5EE';border='#0F6E56';if(!isSelected){letterBg='#0F6E56';letterColor='#fff';}textColor='#04342C';}
          if(isSelected&&!isCorrect){bg='#FDEAEA';border='#E8192C';letterBg='#E8192C';letterColor='#fff';textColor='#7A0E14';}
          if(isSelected&&isCorrect){letterBg='#0F6E56';letterColor='#fff';}
        }
        h+='<div '+(locked?'':' onclick="window[\\'mc_${id}_pick\\'](\\''+ q.id +'\\',\\''+ opt.id +'\\')"')
          +' style="display:flex;align-items:center;gap:10px;padding:.6rem .875rem;border-radius:8px;border:1.5px solid '+border+';background:'+bg+';cursor:'+(locked?'default':'pointer')+';transition:background .1s,border-color .1s;user-select:none"'
          +(locked?'':' onmouseover="if(!this.dataset.locked){this.style.borderColor=\\'#18303F\\';this.style.background=\\'#F4F6F7\\';}" onmouseout="this.style.borderColor=\\'#D8DDE3\\';this.style.background=\\'#fff\\';"')
          +'>';
        h+='<div style="width:22px;height:22px;border-radius:50%;background:'+letterBg+';border:1.5px solid '+(locked&&(isSelected||isCorrect)?border:'#D8DDE3')+';display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font-size:11px;font-weight:700;color:'+letterColor+'">'+letters[oi]+'</span></div>';
        h+='<span style="font-size:15px;color:'+textColor+';line-height:1.4;flex:1">'+ec(opt.text)+'</span>';
        if(locked&&isSelected&&isCorrect)h+='<span style="font-size:14px;color:#0F6E56;flex-shrink:0">&#10003;</span>';
        if(locked&&isSelected&&!isCorrect)h+='<span style="font-size:14px;color:#E8192C;flex-shrink:0">&#10007;</span>';
        h+='</div>';
      });
      h+='</div>';
      if(locked){
        var correct=sel===q.correct;
        h+='<div style="margin-top:.75rem;padding:.625rem .875rem;border-radius:8px;background:'+(correct?'#E1F5EE':'#FAEEDA')+';border:1px solid '+(correct?'#0F6E56':'#FAC775')+'">';
        h+='<span style="font-size:13px;font-weight:600;color:'+(correct?'#0F6E56':'#854F0B')+'">'+( correct?'Correct — ':'Incorrect — ')+ec(correct?q.feedbackCorrect:q.feedbackIncorrect)+'</span>';
        h+='</div>';
      }
      h+='</div>';
    });
    var done=allAnswered();
    h+='<div style="display:flex;justify-content:flex-end;margin-top:.5rem"><button id="${id}sb" style="padding:.6rem 1.5rem;border-radius:50px;border:none;background:'+(done?'#E8192C':'#D8DDE3')+';color:'+(done?'#fff':'#4A6070')+';font-size:15px;font-weight:700;cursor:'+(done?'pointer':'default')+';font-family:inherit;transition:all .2s">'+(done?ec(C.submitLabel):'Answer all questions first')+'</button></div>';
    app.innerHTML=h;
    var sb=document.getElementById('${id}sb');
    if(sb&&done)sb.onclick=showResults;
  }
  window['mc_${id}_pick']=function(qid,optId){
    if(answers[qid]!==undefined)return;
    answers[qid]=optId;render();
  };
  function showResults(){
    var correct=C.questions.filter(function(q){return answers[q.id]===q.correct;}).length;
    var total=C.questions.length;var ok=correct===total;
    var h='<div style="padding:1rem 1.25rem;border-radius:10px;margin-bottom:1.25rem;display:flex;align-items:center;gap:14px;background:'+(ok?'#E1F5EE':'#FDEAEA')+';border:1.5px solid '+(ok?'#0F6E56':'#E8192C')+'">';
    h+='<span style="font-size:32px;line-height:1">'+(ok?'&#10003;':'&#9733;')+'</span>';
    h+='<div><div style="font-size:20px;font-weight:300;color:'+(ok?'#0F6E56':'#18303F')+';letter-spacing:-.01em">'+correct+' of '+total+' correct</div>';
    h+='<div style="font-size:14px;color:#18303F;margin-top:2px">'+(ok?'Perfect score.':correct/total>=0.6?'Good effort — review the explanations below.':'Review the explanations below before trying again.')+'</div></div></div>';
    h+='<div style="font-size:13px;font-weight:600;color:#4A6070;margin-bottom:.625rem">Review</div>';
    C.questions.forEach(function(q,qi){
      var sel=answers[q.id],cor=sel===q.correct;
      var selOpt=q.options.find(function(o){return o.id===sel;})||{};
      var corOpt=q.options.find(function(o){return o.id===q.correct;})||{};
      h+='<div style="padding:.875rem 1rem;margin-bottom:.5rem;border-radius:8px;border:1px solid '+(cor?'#0F6E56':'#FAC775')+';background:'+(cor?'#E1F5EE':'#FAEEDA')+'">';
      h+='<div style="font-size:13px;font-weight:600;color:#4A6070;margin-bottom:.3rem">Q'+(qi+1)+'</div>';
      h+='<div style="font-size:15px;font-weight:500;color:#18303F;line-height:1.4;margin-bottom:.5rem">'+ec(q.text)+'</div>';
      if(!cor)h+='<div style="font-size:13px;color:#854F0B;margin-bottom:.2rem">Your answer: '+ec(selOpt.text||'—')+'</div>';
      h+='<div style="font-size:13px;color:'+(cor?'#0F6E56':'#18303F')+';margin-bottom:.375rem">'+(cor?'&#10003; ':'Correct answer: ')+ec(corOpt.text||'—')+'</div>';
      h+='<div style="font-size:13px;color:#18303F;line-height:1.55">'+ec(cor?q.feedbackCorrect:q.feedbackIncorrect)+'</div>';
      h+='</div>';
    });
    h+='<button id="${id}rb" style="font-size:14px;color:#18303F;background:none;border:1px solid #D8DDE3;border-radius:50px;padding:.4rem 1rem;cursor:pointer;font-family:inherit;font-weight:500;margin-top:.5rem">Try again</button>';
    app.innerHTML=h;
    document.getElementById('${id}rb').onclick=function(){answers={};render();};
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
    <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:#E8192C;margin-bottom:.5rem">Multiple Choice</div>
    <h1 style="font-size:30px;font-weight:300;color:#18303F;margin:0 0 .5rem;line-height:1.2;letter-spacing:-.01em">${eH(content.topic)}</h1>
    <p style="font-size:15px;color:#3D5060;margin:0;line-height:1.6">${eH(content.objective)}</p>
  </div>
  <div id="${id}a"></div>
</div>
<script>
var CONTRACT=${C};
${buildMCJS(id)}
<\/script>`;
}

function buildEmbedSnippet(content){
  const id='bdc'+Math.random().toString(36).slice(2,9);
  const C=JSON.stringify(content).replace(/<\/script>/gi,'<\\/script>');
  return `<div id="${id}" style="font-family:'Inter',system-ui,-apple-system,sans-serif;max-width:720px;margin:0 auto;padding:2rem 1.5rem;color:#18303F;-webkit-font-smoothing:antialiased;box-sizing:border-box">
  <div style="margin-bottom:1.75rem">
    <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;color:#E8192C;margin-bottom:.5rem">Multiple Choice</div>
    <h1 style="font-size:30px;font-weight:300;color:#18303F;margin:0 0 .5rem;line-height:1.2;letter-spacing:-.01em">${eH(content.topic)}</h1>
    <p style="font-size:15px;color:#3D5060;margin:0;line-height:1.6">${eH(content.objective)}</p>
  </div>
  <div id="${id}a"></div>
</div>
<script>
var CONTRACT=${C};
${buildMCJS(id)}
<\/script>`;
}

function wrapFullHTML(snippet,title){
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${eH(title||'Multiple Choice Activity')}</title>
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
function MCPreview({data}){
  const [answers,setAnswers]=useState({});
  const [showResults,setShowResults]=useState(false);
  const allAnswered=data.questions.every(q=>answers[q.id]!==undefined);
  const pick=(qid,optId)=>{if(answers[qid]!==undefined)return;setAnswers(a=>({...a,[qid]:optId}));};
  const reset=()=>{setAnswers({});setShowResults(false);};
  const score=data.questions.filter(q=>answers[q.id]===q.correct).length;
  const total=data.questions.length;
  const allOk=score===total;

  if(showResults) return(
    <div>
      <div style={{padding:"1rem 1.25rem",borderRadius:10,marginBottom:"1.25rem",display:"flex",alignItems:"center",gap:14,background:allOk?GRN_L:RED_L,border:`1.5px solid ${allOk?GRN:RED}`}}>
        <span style={{fontSize:32,lineHeight:1}}>{allOk?"✓":"★"}</span>
        <div>
          <div style={{fontSize:20,fontWeight:300,color:allOk?GRN:NAVY,letterSpacing:"-.01em"}}>{score} of {total} correct</div>
          <div style={{fontSize:14,color:TS,marginTop:2}}>{allOk?"Perfect score.":score/total>=0.6?"Good effort — review the explanations below.":"Review the explanations below before trying again."}</div>
        </div>
      </div>
      <div style={{fontSize:13,fontWeight:600,color:TT,marginBottom:".625rem"}}>Review</div>
      {data.questions.map((q,qi)=>{
        const sel=answers[q.id],cor=sel===q.correct;
        const selOpt=q.options.find(o=>o.id===sel)||{};
        const corOpt=q.options.find(o=>o.id===q.correct)||{};
        return(<div key={q.id} style={{padding:".875rem 1rem",marginBottom:".5rem",borderRadius:8,border:`1px solid ${cor?GRN:"#FAC775"}`,background:cor?GRN_L:AMB_L}}>
          <div style={{fontSize:13,fontWeight:600,color:TT,marginBottom:".3rem"}}>Q{qi+1}</div>
          <div style={{fontSize:15,fontWeight:500,color:NAVY,lineHeight:1.4,marginBottom:".5rem"}}>{q.text||<em style={{opacity:.4}}>Empty question</em>}</div>
          {!cor&&<div style={{fontSize:13,color:AMB,marginBottom:".2rem"}}>Your answer: {selOpt.text||"—"}</div>}
          <div style={{fontSize:13,color:cor?GRN:TS,marginBottom:".375rem"}}>{cor?"✓ ":"Correct answer: "}{corOpt.text||"—"}</div>
          <div style={{fontSize:13,color:TS,lineHeight:1.55}}>{cor?q.feedbackCorrect:q.feedbackIncorrect}</div>
        </div>);
      })}
      <button onClick={reset} style={{fontSize:14,color:TS,background:"none",border:`1px solid ${BORDER}`,borderRadius:50,padding:".4rem 1rem",cursor:"pointer",fontFamily:SANS,fontWeight:500,marginTop:".5rem"}}>Try again</button>
    </div>
  );

  return(<div>
    {data.questions.map((q,qi)=>{
      const sel=answers[q.id];const locked=sel!==undefined;
      const cor=locked&&sel===q.correct;
      return(<div key={q.id} style={{padding:"1.25rem",marginBottom:".875rem",background:"#fff",border:`1.5px solid ${BORDER}`,borderLeft:`3px solid ${locked?cor?GRN:RED:NAVY}`,borderRadius:10}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:".875rem"}}>
          <span style={{fontSize:12,fontWeight:700,color:TT,flexShrink:0,paddingTop:2}}>Q{qi+1}</span>
          <div style={{fontSize:16,fontWeight:500,color:NAVY,lineHeight:1.5}}>{q.text||<em style={{color:TT,fontWeight:400}}>Empty question</em>}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:".4rem"}}>
          {q.options.map((opt,oi)=>{
            const isSelected=sel===opt.id,isCorrect=opt.id===q.correct;
            let bg="#fff",border=BORDER,textColor=NAVY,letterBg="#F4F6F7",letterColor=TT;
            if(locked){
              if(isCorrect){bg=GRN_L;border=GRN;textColor="#04342C";if(!isSelected){letterBg=GRN;letterColor="#fff";}}
              if(isSelected&&!isCorrect){bg=RED_L;border=RED;letterBg=RED;letterColor="#fff";textColor="#7A0E14";}
              if(isSelected&&isCorrect){letterBg=GRN;letterColor="#fff";}
            }
            return(<div key={opt.id} onClick={()=>pick(q.id,opt.id)} style={{display:"flex",alignItems:"center",gap:10,padding:".6rem .875rem",borderRadius:8,border:`1.5px solid ${border}`,background:bg,cursor:locked?"default":"pointer",transition:"background .1s,border-color .1s",userSelect:"none"}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:letterBg,border:`1.5px solid ${locked&&(isSelected||isCorrect)?border:BORDER}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:11,fontWeight:700,color:letterColor}}>{OPTION_LETTERS[oi]}</span>
              </div>
              <span style={{fontSize:15,color:textColor,lineHeight:1.4,flex:1}}>{opt.text||<em style={{color:TT,fontWeight:400}}>Empty option</em>}</span>
              {locked&&isSelected&&<span style={{fontSize:14,color:cor?GRN:RED,flexShrink:0}}>{cor?"✓":"✗"}</span>}
            </div>);
          })}
        </div>
        {locked&&<div style={{marginTop:".75rem",padding:".625rem .875rem",borderRadius:8,background:cor?GRN_L:AMB_L,border:`1px solid ${cor?GRN:"#FAC775"}`}}>
          <span style={{fontSize:13,fontWeight:600,color:cor?GRN:AMB}}>{cor?"Correct — ":"Incorrect — "}</span>
          <span style={{fontSize:13,color:TS}}>{cor?q.feedbackCorrect:q.feedbackIncorrect}</span>
        </div>}
      </div>);
    })}
    <div style={{display:"flex",justifyContent:"flex-end",marginTop:".5rem"}}>
      <button onClick={()=>allAnswered&&setShowResults(true)} disabled={!allAnswered} style={{padding:".6rem 1.5rem",borderRadius:50,border:"none",background:allAnswered?RED:BORDER,color:allAnswered?"#fff":TT,fontFamily:SANS,fontSize:15,fontWeight:700,cursor:allAnswered?"pointer":"default",transition:"all .2s"}}>
        {allAnswered?data.submitLabel:`Answer ${data.questions.filter(q=>answers[q.id]===undefined).length} more question${data.questions.filter(q=>answers[q.id]===undefined).length===1?"":"s"} first`}
      </button>
    </div>
  </div>);
}

// ─── Editor ─────────────────────────────────────────────────────────────────
function Lbl({children}){return <div style={{fontSize:11,fontWeight:600,color:TT,fontFamily:SANS,marginBottom:".375rem"}}>{children}</div>;}
const iStyle={width:"100%",border:`1.5px solid ${BORDER}`,borderRadius:8,padding:".65rem 1rem",fontFamily:SANS,fontSize:15,color:NAVY,background:"#fff",outline:"none",lineHeight:1.6,boxSizing:"border-box"};

function MCEditor({content,onChange}){
  const set=(k,v)=>onChange({...content,[k]:v});
  const setQ=(qi,k,v)=>{const qs=[...content.questions];qs[qi]={...qs[qi],[k]:v};onChange({...content,questions:qs});};
  const setOpt=(qi,oi,v)=>{const qs=[...content.questions];const opts=[...qs[qi].options];opts[oi]={...opts[oi],text:v};qs[qi]={...qs[qi],options:opts};onChange({...content,questions:qs});};
  const addQ=()=>onChange({...content,questions:[...content.questions,mkQ()]});
  const removeQ=qi=>content.questions.length>1&&onChange({...content,questions:content.questions.filter((_,i)=>i!==qi)});

  return(<div>
    <div style={{marginBottom:".875rem"}}><Lbl>Topic *</Lbl><input value={content.topic} onChange={e=>set("topic",e.target.value)} placeholder="e.g. Data privacy in the workplace" style={iStyle}/></div>
    <div style={{marginBottom:"1.25rem"}}><Lbl>Objective *</Lbl><input value={content.objective} onChange={e=>set("objective",e.target.value)} placeholder="e.g. Apply data handling principles to common workplace scenarios." style={iStyle}/></div>
    <div style={{marginBottom:".375rem"}}><Lbl>Questions ({content.questions.length})</Lbl></div>
    <div style={{fontSize:14,color:TS,marginBottom:".875rem",lineHeight:1.6}}>Click an option's radio button to mark it as the correct answer. Distractors should require real thinking to rule out.</div>

    {content.questions.map((q,qi)=>(
      <div key={q.id} style={{padding:".875rem",marginBottom:".5rem",background:"#F8F9FB",border:`1px solid ${BORDER}`,borderLeft:`3px solid ${NAVY}`,borderRadius:10}}>
        {/* Question header */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:".625rem"}}>
          <span style={{fontSize:13,fontWeight:700,color:NAVY,flexShrink:0}}>Q{qi+1}</span>
          <div style={{flex:1}}/>
          {content.questions.length>1&&<button onClick={()=>removeQ(qi)} style={{background:"none",border:"none",color:RED,cursor:"pointer",fontSize:14,fontFamily:SANS,padding:0}}>Remove</button>}
        </div>

        {/* Question text */}
        <textarea value={q.text} onChange={e=>setQ(qi,"text",e.target.value)} placeholder="What is the question?" style={{...iStyle,resize:"none",lineHeight:1.55,marginBottom:".625rem"}} rows={2}/>

        {/* Options */}
        <div style={{marginBottom:".625rem"}}>
          {q.options.map((opt,oi)=>(
            <div key={opt.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:".375rem"}}>
              <label style={{display:"flex",alignItems:"center",gap:0,cursor:"pointer",flexShrink:0}}>
                <input type="radio" name={`correct-${q.id}`} checked={q.correct===opt.id} onChange={()=>setQ(qi,"correct",opt.id)} style={{cursor:"pointer"}}/>
              </label>
              <div style={{width:22,height:22,borderRadius:"50%",background:q.correct===opt.id?"#18303F":"#F4F6F7",border:`1.5px solid ${q.correct===opt.id?"#18303F":BORDER}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:10,fontWeight:700,color:q.correct===opt.id?"#fff":TT}}>{OPTION_LETTERS[oi]}</span>
              </div>
              <input value={opt.text} onChange={e=>setOpt(qi,oi,e.target.value)} placeholder={`Option ${OPTION_LETTERS[oi]}`} style={{flex:1,border:`1.5px solid ${q.correct===opt.id?NAVY:BORDER}`,borderRadius:7,padding:".4rem .75rem",fontFamily:SANS,fontSize:14,color:NAVY,background:q.correct===opt.id?"#fff":"#fff",outline:"none"}}/>
            </div>
          ))}
          <div style={{fontSize:12,color:TT,marginTop:".25rem",paddingLeft:54}}>Select the radio button to mark the correct answer</div>
        </div>

        {/* Feedback */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".5rem"}}>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:GRN,marginBottom:".25rem"}}>Correct feedback</div>
            <textarea value={q.feedbackCorrect} onChange={e=>setQ(qi,"feedbackCorrect",e.target.value)} placeholder="Why is this the right answer?" style={{...iStyle,resize:"none",lineHeight:1.5,fontSize:13,padding:".45rem .75rem"}} rows={2}/>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:AMB,marginBottom:".25rem"}}>Incorrect feedback</div>
            <textarea value={q.feedbackIncorrect} onChange={e=>setQ(qi,"feedbackIncorrect",e.target.value)} placeholder="What should they remember instead?" style={{...iStyle,resize:"none",lineHeight:1.5,fontSize:13,padding:".45rem .75rem"}} rows={2}/>
          </div>
        </div>
      </div>
    ))}
    <button onClick={addQ} style={{width:"100%",fontSize:14,color:NAVY,background:"none",border:`1px dashed ${BORDER}`,borderRadius:8,padding:".5rem",cursor:"pointer",fontFamily:SANS,marginTop:".25rem"}}>+ Add question</button>
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
function AIPanel({onApply,questionCount}){
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
  const generate=async()=>{if(!canGenerate)return;setLoading(true);setError(null);setDone(false);try{const raw=await aiGen(desc,fileCtx,questionCount);const parsed=parseJ(raw);if(!parsed)throw new Error("Could not parse response. Try rephrasing.");onApply(parsed);setDone(true);setTimeout(()=>{setOpen(false);setDone(false);},900);}catch(e){setError(e.message);}setLoading(false);};
  const handleKey=e=>{if((e.metaKey||e.ctrlKey)&&e.key==="Enter")generate();};
  return(<div style={{marginBottom:"1.25rem"}}>
    {!open&&(<button onClick={()=>{setOpen(true);setTimeout(()=>taRef.current?.focus(),80);}} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"1rem 1.25rem",borderRadius:12,border:`1.5px solid ${BORDER}`,background:"#fff",cursor:"pointer",textAlign:"left",fontFamily:SANS,boxShadow:"0 1px 3px rgba(24,48,63,.04)"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=NAVY;e.currentTarget.style.boxShadow="0 2px 8px rgba(24,48,63,.1)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=BORDER;e.currentTarget.style.boxShadow="0 1px 3px rgba(24,48,63,.04)";}}>
      <div style={{width:34,height:34,borderRadius:8,background:NAVY,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 1L3 9h5l-1 6 7-9H9l1-5z" fill="#fff" stroke="#fff" strokeWidth=".5" strokeLinejoin="round"/></svg></div>
      <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:NAVY,marginBottom:2}}>Generate with AI</div><div style={{fontSize:14,color:TT}}>Describe your topic — AI drafts all questions with options and feedback</div></div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,color:TT}}><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>)}
    {open&&(<div style={{borderRadius:12,border:`1.5px solid ${NAVY}`,background:"#fff",overflow:"hidden",boxShadow:"0 2px 8px rgba(24,48,63,.1)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:".875rem 1.25rem",borderBottom:`1px solid ${BORDER}`}}>
        <div style={{width:34,height:34,borderRadius:8,background:NAVY,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 1L3 9h5l-1 6 7-9H9l1-5z" fill="#fff" stroke="#fff" strokeWidth=".5" strokeLinejoin="round"/></svg></div>
        <div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:NAVY}}>Generate with AI</div><div style={{fontSize:14,color:TT}}>Describe your topic — AI drafts all questions with options and feedback</div></div>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:TT,cursor:"pointer",fontSize:20,lineHeight:1,padding:"0 0 0 .5rem",fontFamily:SANS}}>&times;</button>
      </div>
      <div style={{padding:"1.125rem 1.25rem"}}>
        <textarea ref={taRef} value={desc} onChange={e=>setDesc(e.target.value)} onKeyDown={handleKey} placeholder="e.g. Data privacy obligations for employees — cover what counts as personal data, how to handle it securely, and what to do in a breach" rows={3} style={{...iStyle,resize:"none",lineHeight:1.65,minHeight:90,marginBottom:".75rem"}}/>
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
export default function MultipleChoicePage(){
  useInterFont();
  const mobile=useMobile();
  const [view,setView]=useState("studio");
  const [content,setContent]=useState(mkMC);
  const [outputSnippet,setOutputSnippet]=useState(null);
  const [copiedSnippet,setCopiedSnippet]=useState(false);
  const [copiedEmbed,setCopiedEmbed]=useState(false);
  const [copiedFull,setCopiedFull]=useState(false);

  const isReady=
    content.topic.trim().length>1&&
    content.questions.length>=1&&
    content.questions.every(q=>q.text.trim()&&q.options.every(o=>o.text.trim())&&q.correct);

  const handleCreate=()=>{const s=buildOutputHTML(content);setOutputSnippet(s);setTimeout(()=>document.getElementById("output-panel")?.scrollIntoView({behavior:"smooth"}),60);};

  function copyText(text,setFlag){
    const finish=()=>{setFlag(true);setTimeout(()=>setFlag(false),2200);};
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(finish).catch(()=>fallback(text,finish));}else{fallback(text,finish);}
    function fallback(t,cb){const el=document.createElement('textarea');el.value=t;el.style.cssText='position:fixed;top:-9999px;left:-9999px;opacity:0';document.body.appendChild(el);el.focus();el.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(el);cb();}
  }
  const handleCopySnippet=()=>copyText(outputSnippet,setCopiedSnippet);
  const handleCopyEmbed=()=>copyText(buildEmbedSnippet(content),setCopiedEmbed);
  const handleCopyFull=()=>copyText(wrapFullHTML(outputSnippet,content.topic),setCopiedFull);
  const handleDownload=()=>{const full=wrapFullHTML(outputSnippet,content.topic);const fname=(content.topic||'multiple-choice').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,40)+'.html';downloadFile(full,fname);};

  return(
    <div style={{fontFamily:SANS,minHeight:"100vh",background:"#F4F6F7",color:NAVY}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}button:active{transform:scale(.97);}button:focus,input:focus,textarea:focus{outline:none;}input:focus,textarea:focus{border-color:${RED}!important;}`}</style>

      {/* Nav */}
      <div style={{background:"#fff",borderBottom:"1px solid #E8ECEE",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:720,margin:"0 auto",padding:"0 1.5rem",display:"flex",alignItems:"center",height:56,position:"relative",width:"100%"}}>
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
            <div style={{fontSize:14,fontWeight:600,color:RED,marginBottom:".5rem"}}>Multiple Choice</div>
            <h1 style={{fontSize:mobile?26:32,fontWeight:300,color:NAVY,marginBottom:".5rem",lineHeight:1.2,letterSpacing:"-.01em"}}>{content.topic||<em style={{opacity:.35,fontWeight:300,fontStyle:"italic"}}>No topic yet</em>}</h1>
            <p style={{fontSize:15,color:TS,lineHeight:1.6}}>{content.objective}</p>
          </div>
          <MCPreview key={JSON.stringify(content)} data={content}/>
        </div>
      )}

      {/* Studio */}
      {view==="studio"&&(
        <div style={{maxWidth:720,margin:"0 auto",padding:mobile?"1rem":"1.75rem 1.5rem"}}>
          <AIPanel onApply={parsed=>applyAI(parsed,setContent)} questionCount={content.questions.length}/>
          <div style={{padding:"1.25rem",background:"#fff",border:`1px solid ${BORDER}`,borderRadius:12,boxShadow:"0 1px 4px rgba(26,43,74,0.05)",marginBottom:"1.5rem"}}>
            <div style={{fontSize:14,fontWeight:600,color:TT,marginBottom:"1rem"}}>Content editor</div>
            <MCEditor content={content} onChange={setContent}/>
          </div>

          {/* Sticky action bar */}
          <div style={{position:"sticky",bottom:0,background:"#fff",borderTop:`1px solid ${BORDER}`,padding:".875rem 1.25rem",display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap",marginLeft:mobile?"-1rem":"-1.5rem",marginRight:mobile?"-1rem":"-1.5rem",zIndex:50}}>
            <div style={{display:"flex",gap:"1rem",flex:1,flexWrap:"wrap"}}>
              {[
                {ok:content.topic.trim().length>1,label:"Topic"},
                {ok:content.questions.every(q=>q.text.trim()),label:"Questions"},
                {ok:content.questions.every(q=>q.options.every(o=>o.text.trim())),label:"Options"},
                {ok:content.questions.every(q=>q.feedbackCorrect.trim()&&q.feedbackIncorrect.trim()),label:"Feedback"},
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
