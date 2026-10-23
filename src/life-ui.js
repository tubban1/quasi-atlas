import {LIFE_LESSONS,getLifeLesson,scorePrediction,beatSamples,lifeReport} from './life-content.js';
/** Self-contained G1 educational view. The G0 mathematical engine remains owned by main.js. */
export function setupLifeLens({selectModel,setContourLevel,setPhase,enterResearch,readStats,download}){
 const $=s=>document.querySelector(s),list=$('#lifeLessons'),lab=$('#lifeLab'),beatStage=$('#beatStage'),beatPlot=$('#beatPlot'),wrap=$('#canvasWrap');
 let current=null,prediction=null,value=0,isApplying=false;
 const fmt=n=>Number(n).toFixed(Number.isInteger(n)?0:2);
 list.innerHTML=LIFE_LESSONS.map(l=>'<button class="life-tile" data-life="'+l.id+'" aria-pressed="false"><span class="life-tile-icon">'+l.icon+'</span><span class="life-tile-main"><strong>'+l.title+'</strong><small>'+l.subtitle+'</small></span><span class="life-tile-arrow">↗</span></button>').join('');
 function refreshBeat(){
   if(!current||current.id!=='beats')return;
   const d=beatSamples(value),draw=(key,y,scale)=>d.map((p,i)=>(i?'L':'M')+(40+i*820/(d.length-1)).toFixed(2)+','+(y-p[key]*scale).toFixed(2)).join(' ');
   beatPlot.innerHTML='<defs><linearGradient id="beatGradient" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#85e0cf"/><stop offset="1" stop-color="#f9d69f"/></linearGradient></defs>'+
   '<g stroke="#85b5b4" stroke-opacity=".22"><path d="M40 91H860M40 197H860M40 303H860" /></g>'+
   '<g font-family="sans-serif" fill="#c8ece5" font-size="12"><text x="40" y="38">第一个信号 · 9 Hz</text><text x="40" y="145">第二个信号 · '+(9+value).toFixed(1)+' Hz</text><text x="40" y="251">相加的声音 · 拍频 '+value.toFixed(1)+' Hz</text></g>'+
   '<path d="'+draw('a',91,35)+'" stroke="#9ddfd4" stroke-width="2" fill="none"/>'+
   '<path d="'+draw('b',197,35)+'" stroke="#efc99d" stroke-width="2" fill="none"/>'+
   '<path d="'+draw('sum',303,29)+'" stroke="url(#beatGradient)" stroke-width="2.8" fill="none"/>'+
   '<text x="860" y="363" font-size="12" fill="#cce9d9" text-anchor="end">时间 → 3.6 秒</text>';
 }
 function measure(){
   if(!current)return;
   $('#lifeSliderValue').textContent=fmt(value)+' '+current.units;
   const s=readStats();
   $('#lifeMeasure').textContent=current.id==='beats'?'频率差 '+fmt(value)+' Hz；拍频周期约 '+(1/value).toFixed(2)+' 秒。':s?'当前有限网格：'+s.components+' 个等值线分量，其中 '+s.closed+' 个闭合。注意这不是连续空间真值。':'正在生成数学图形…';
   if(current.id==='beats')refreshBeat();
 }
 function show(id){
   const next=getLifeLesson(id);if(!next)return;
   isApplying=true;current=next;prediction=null;value=next.value;
   const isBeat=next.id==='beats';
   beatStage.hidden=!isBeat;wrap.classList.toggle('life-beat-active',isBeat);document.body.classList.toggle('life-beat-mode',isBeat);
   if(!isBeat){selectModel(next.model);if(next.controlType==='phase')setPhase(value);else setContourLevel(value);}
   isApplying=false;lab.hidden=false;
   document.querySelectorAll('.life-tile').forEach(el=>{const selected=el.dataset.life===next.id;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected));});
   $('#lifeTitle').textContent=next.title;$('#lifeCaption').textContent=next.subtitle;
   $('#lifeQuestion').textContent=next.question;$('#lifeExperiment').textContent=next.experiment;
   $('#lifeInsight').textContent=next.insight;$('#lifeFormula').textContent=next.formula;
   $('#lifeCounterexample').textContent=next.counterexample;$('#lifeModelNote').textContent=next.modelNote;
   $('#lifeResearchQuestion').textContent=next.researchPrompt;
   $('#lifeSliderLabel').textContent=next.control;const slider=$('#lifeSlider');slider.min=next.min;slider.max=next.max;slider.step=next.step;slider.value=value;
   const feedback=$('#lifeFeedback');feedback.textContent='先做一个预测，再观察。答错了也可以修改。';
   $('#lifeChoices').replaceChildren();
   next.choices.forEach((label,i)=>{
     const b=document.createElement('button');b.textContent=label;b.dataset.choice=String(i);
     b.onclick=()=>{prediction=i;document.querySelectorAll('#lifeChoices button').forEach((el,j)=>{el.classList.toggle('chosen',j===i);el.classList.toggle('correct',j===next.answer);});feedback.textContent=scorePrediction(next.id,i)?'✓ 这个预测符合当前的数学模型。':'这是一个很好的探索机会。继续调节参数，看看哪里与你的预期不同。';};
     $('#lifeChoices').append(b);
   });
   document.querySelectorAll('.life-lesson-detail').forEach(d=>d.open=false);
   measure();if(isBeat)refreshBeat();
   const pane=lab.closest('.rail-scroll');if(pane)pane.scrollTop=0;
   const q=new URLSearchParams(location.search);q.set('life',next.id);if(isBeat){q.delete('world');}history.replaceState(null,'',location.pathname+'?'+q);
 }
 list.querySelectorAll('button').forEach(b=>b.onclick=()=>show(b.dataset.life));
 $('#lifeSlider').addEventListener('input',e=>{if(!current)return;value=Number(e.target.value);if(current.controlType==='level')setContourLevel(value);else if(current.controlType==='phase')setPhase(value);measure();});
 $('#lifeResearch').onclick=()=>{if(!current)return;if(current.id==='beats'){document.querySelector('.life-lesson-detail').open=true;$('#lifeModelNote').textContent='研究提示：这是独立的一维时间信号，不应使用右侧二维等值线统计。可导出学习记录，再使用频率分析工具计算谱峰。';}else enterResearch();};
 $('#lifeExport').onclick=()=>{if(!current)return;download(JSON.stringify(lifeReport({lessonId:current.id,prediction,value}),null,2),'quasi-atlas-life-'+current.id+'.json','application/json');};
 function hide(){current=null;lab.hidden=true;beatStage.hidden=true;wrap.classList.remove('life-beat-active');document.body.classList.remove('life-beat-mode');document.querySelectorAll('.life-tile').forEach(el=>{el.classList.remove('selected');el.setAttribute('aria-pressed','false');});}
 const params=new URLSearchParams(location.search);
 if(params.has('life')&&getLifeLesson(params.get('life')))show(params.get('life'));
 else if(!params.has('world'))show('mountain');
 return {get current(){return current;},get isApplying(){return isApplying;},hide,show,measure};
}
