import './style.css';
import './ui-v2.css';
import './notebook.css';
import './studio-focus.css';
import './h0.css';
import {setupH0UI} from './h0-ui.js';
import {setupStudioFocus} from './studio-focus.js';
import {setupAppShell} from './shell.js';
import {PRESETS,getPreset,evaluateField} from './math/fields.js';
import {createModel,createExperiment} from './math/contract.js';
import {setupLifeLens} from './life-ui.js';
import {setupNotebook} from './notebook-ui.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const canvas=$('#worldCanvas'),ctx=canvas.getContext('2d',{alpha:false}),wrap=$('#canvasWrap');
const worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});
const restored=new URLSearchParams(location.search);
const initialSearch=new URLSearchParams(location.search);
const state={
 id:restored.get('world')||'quasi',level:Number(restored.get('level')||0),
 phase:Number(restored.get('phase')||0),scale:Number(restored.get('scale')||22),
 panX:Number(restored.get('x')||0),panY:Number(restored.get('y')||0),
 resolution:Number(restored.get('res')||280),mode:'wander',view:'terrain',theme:0,
 grid:null,coords:null,contour:null,spectrum:null,pin:null,playing:false,seq:0,
 pending:0,drag:null,resizeWidth:0,resizeHeight:0
};
const palettes=[
 [[4,37,53],[7,91,109],[39,139,144],[102,183,165],[204,217,165],[239,208,151],[242,174,113]],
 [[7,17,42],[25,44,85],[61,88,137],[119,143,176],[202,198,179],[239,215,177],[249,240,214]],
 [[13,22,26],[39,65,66],[65,93,79],[120,139,102],[182,174,128],[227,203,150],[250,228,193]]
];
const bgForTheme=['#092e38','#0d1c32','#152521'];
let baseline=null,latestVerification=null,criticalResult=null,criticalSignature='',researchRequest=0,focusPoint=null,h0UI=null;
let raster=document.createElement('canvas'),rctx=raster.getContext('2d'),refreshTimer=null,playTime=0,toastTimer=null;
const fmt=n=>(n>=0?'+':'')+Number(n).toFixed(2);
const finite=(n,fallback=0)=>Number.isFinite(n)?n:fallback;
const safe=(n,a,b)=>Math.min(b,Math.max(a,finite(n,a)));
const preset=()=>getPreset(state.id);

function buildList(){
 $('#presetList').innerHTML=PRESETS.map((p,i)=>'<button class="preset'+(p.id===state.id?' selected':'')+'" data-id="'+p.id+'"><span class="preset-icon">'+p.icon+'</span><span><strong>'+p.title+'</strong><small>'+p.short+'</small></span><span class="preset-arrow">↗</span></button>').join('');
 $$('.preset').forEach(b=>b.onclick=()=>selectPreset(b.dataset.id));
}
function selectPreset(id){
 if(window.__lifeLens&&!window.__lifeLens.isApplying){window.__lifeLens.hide();const q=new URLSearchParams(location.search);q.delete('life');history.replaceState(null,'',location.pathname+'?'+q);}
 const p=getPreset(id); state.id=p.id;state.level=0;state.phase=0;state.panX=0;state.panY=0;state.scale=p.id==='archipelago'?21:22;state.pin=null;
 $('#pin').hidden=true;$('#phaseSlider').value=0;$('#scaleSlider').value=state.scale;
 $('#levelSlider').min=p.min;$('#levelSlider').max=p.max;$('#levelSlider').step=.01;$('#levelSlider').value=0;
 updateStatic();schedule();saveURL();
}
function updateStatic(){
 const p=preset();
 $('#worldIndex').textContent=p.code;$('#worldTitle').textContent=p.title;$('#worldTagline').textContent=p.subtitle;
 $('#questionCard p').textContent=p.question;
 $('#formulaText').innerHTML='<p><strong>当前数学定义</strong></p><code>'+p.formula+'</code><p>“等值线”是满足 f(x,y)=c 的点的集合。改变 c，就像让海平面升降。</p><p>所有统计只针对当前有限采样窗口。边界穿越曲线不等于数学上已证明无界。部分高频细节可能因网格分辨率不足而丢失。</p>';
 $('#levelValue').textContent=fmt(state.level);$('#scaleValue').textContent=state.scale.toFixed(1);
 $('#phaseValue').textContent=state.phase.toFixed(2);$('#detailValue').textContent=state.resolution;
 buildList();updateInsights(); updateScaleMarkers();
}
function updateScaleMarkers(){
 const p=preset();$('#levelSlider').min=p.min;$('#levelSlider').max=p.max;
 $('#levelSlider').value=state.level;
 $('.range-ticks').children[0].textContent=p.min.toFixed(1);$('.range-ticks').children[1].textContent='0 · 参考高度';$('.range-ticks').children[2].textContent='+'+p.max.toFixed(1);
}
function updateInsights(){
 const data={
 wander:['欢迎来到数学秘境','不必理解所有公式。试着改变高度、点击地图，寻找一种让你想继续探索的形状。'],
 learn:['为什么曲线会合并？','当高度穿过临界值，等值线可能重新连接。观察事件轴，然后试着用自己的话解释。'],
 research:['观察并不等于证明','这是有限窗口的离散数值近似。请改变网格精度与探索尺度，测试现象能否复现。']
 };
 const [t,p]=data[state.mode];$('#modeInsight h3').textContent=t;$('#modeInsight p').textContent=p;
 $('#inspectorHeading').textContent=state.mode==='research'?'数值测量':state.mode==='learn'?'观察与解释':'正在观察';
 $('#scientificNote').textContent=state.mode==='research'?'边界穿越是有限视窗分类，不构成开放或无界轨道的严格证明。改变窗口与网格精度再比较。':state.mode==='learn'?'闭合曲线可以像岛屿边缘；碰到边框的曲线只表示它离开当前地图。':'看见边缘的线，可能只是没有足够宽的画布，不一定真的通向无穷远。';
}
function computeSize(){const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);if(box.width<1||box.height<1)return;
  state.resizeWidth=box.width;state.resizeHeight=box.height;canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);schedule();
}
function schedule(){clearTimeout(refreshTimer);$('#numericStatus').textContent='参数待计算';window.__notebook?.markStale();h0UI?.markStale();refreshTimer=setTimeout(calculate,38);if(latestVerification){$('#verificationOutput').dataset.stale=String(experimentSignature()!==latestVerification.signature);if($('#verificationOutput').dataset.stale==='true')$('#verificationOutput').innerHTML='<span>参数已改变。上次报告仍可导出，但请重新运行三档精度验证。</span>';}}
function calculate(){
 refreshTimer=null;if(!state.resizeWidth)return;state.seq++;
 $('#numericStatus').textContent='计算中…';
 worker.postMessage({seq:state.seq,id:state.id,level:state.level,phase:state.phase,scale:state.scale,panX:state.panX,panY:state.panY,resolution:state.resolution,width:state.resizeWidth,height:state.resizeHeight});
}
worker.onmessage=ev=>{
 const m=ev.data;
 if(m.action==='topology-h0'){h0UI?.receive(m);return;}
 if(m.action==='critical'||m.action==='verify'){handleResearchResponse(m);return;}
 if(m.error){$('#numericStatus').textContent='计算失败';console.error(m.error);toast('计算失败，请查看控制台');return;}
 // Always retain a grid received from worker; it may be reused for subsequent contour requests.
 if(m.gridChanged&&m.grid){state.grid=m.grid;state.coords=m.coords;rasterDirty=true;}
 if(m.seq!==state.seq)return;
 state.coords=m.coords;state.contour=m.contour;
 if(m.spectrum){state.spectrum=m.spectrum;renderSpectrum();}
 render();updateStats();window.__lifeLens?.measure();
 $('#numericStatus').textContent='计算完成';window.__notebook?.markStale();
 $('#loading')?.remove();
};
let rasterDirty=true;
function lerp(a,b,t){return a+(b-a)*t;}
function color(t){
 const arr=palettes[state.theme],x=safe(t,0,1)*(arr.length-1),i=Math.min(arr.length-2,Math.floor(x)),f=x-i;
 return [lerp(arr[i][0],arr[i+1][0],f),lerp(arr[i][1],arr[i+1][1],f),lerp(arr[i][2],arr[i+1][2],f)];
}
function buildRaster(){
 const g=state.grid,c=state.coords;if(!g||!c)return;
 const {nx,ny,dx,dy}=c;raster.width=nx+1;raster.height=ny+1;
 const img=rctx.createImageData(nx+1,ny+1),pixels=img.data;
 const p=preset(),lo=p.min*.75,hi=p.max*.75;
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
  const ind=j*(nx+1)+i,v=g[ind],t=safe((v-lo)/(hi-lo),0,1);
  let [r,gg,b]=state.view==='contours'?[11,34,43]:color(t);
  if(state.view==='terrain'){
   const left=g[j*(nx+1)+Math.max(0,i-1)],right=g[j*(nx+1)+Math.min(nx,i+1)];
   const up=g[Math.max(0,j-1)*(nx+1)+i],down=g[Math.min(ny,j+1)*(nx+1)+i];
   let sx=(right-left)/(2*dx),sy=(down-up)/(2*dy);
   const light=safe(.90+(-sx*.18-sy*.24)/(1+Math.hypot(sx,sy)*.36),.62,1.20);
   r*=light;gg*=light;b*=light;
  }
  const k=ind*4;pixels[k]=r;pixels[k+1]=gg;pixels[k+2]=b;pixels[k+3]=255;
 }
 rctx.putImageData(img,0,0);rasterDirty=false;
}
function transformPoint(p){const c=state.coords;return [(p[0]-c.x0)/(c.dx*c.nx)*canvas.width,(p[1]-c.y0)/(c.dy*c.ny)*canvas.height];}
function render(){
 if(!state.coords||!state.contour||!state.grid)return;
 if(rasterDirty)buildRaster();
 ctx.setTransform(1,0,0,1,0,0);
 ctx.fillStyle=bgForTheme[state.theme];ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(raster,0,0,canvas.width,canvas.height);
 const p=state.contour.paths;
 // The subtle double line provides clarity against the relief while preserving the painterly quality.
 ctx.lineCap='round';ctx.lineJoin='round';
 for(let pass=0;pass<2;pass++){
  ctx.strokeStyle=pass===0?'rgba(9,36,46,.33)':'rgba(250,247,224,.92)';
  ctx.lineWidth=(pass===0?4:1.5)*Math.min(devicePixelRatio||1,2);
  for(const path of p){if(path.points.length<2)continue;ctx.beginPath();
   path.points.forEach((pt,i)=>{let [x,y]=transformPoint(pt);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});
   if(path.closed)ctx.closePath();ctx.stroke();
  }
 }
 if(criticalResult&&criticalSignature===geometrySignature()){
  const points=criticalResult.points.filter(p=>Math.abs(p.value-state.level)<.55).slice(0,28);
  for(const cp of points){const [cx,cy]=transformPoint([cp.x,cp.y]);if(cx<0||cy<0||cx>canvas.width||cy>canvas.height)continue;
   const radius=5*Math.min(devicePixelRatio||1,2);
   ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);
   ctx.fillStyle=cp.type==='saddle'?'rgba(239,176,114,.95)':'rgba(194,248,229,.93)';ctx.fill();ctx.lineWidth=1.4;ctx.strokeStyle='#173844';ctx.stroke();
  }
 }
 if(state.pin){
  const [px,py]=transformPoint([state.pin.x,state.pin.y]);
  if(px>=0&&px<=canvas.width&&py>=0&&py<=canvas.height){ctx.strokeStyle='#fff5d8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,8*Math.min(devicePixelRatio||1,2),0,Math.PI*2);ctx.stroke();}
 }
}
function updateStats(){
 const s=state.contour?.stats;if(!s)return;
 $('#totalLines').textContent=s.components.toLocaleString();
 $('#closedCount').textContent=s.closed.toLocaleString();
 $('#openCount').textContent=s.boundary.toLocaleString();
 $('#totalLength').textContent=s.totalLength.toFixed(1);
 updateComparison();
}
function updateComparison(){
 const el=$('#comparisonReadout');if(!baseline||!state.contour){el.textContent='建立基准后，观察改变高度或相位会怎样影响结构。';return;}
 const s=state.contour.stats,delta=s.closed-baseline.closed,bd=s.boundary-baseline.boundary;
 el.innerHTML='<strong>闭合曲线 '+(delta>=0?'+':'')+delta+'</strong> · 边界穿越 '+(bd>=0?'+':'')+bd+'<br/><span>基准：'+baseline.world+' · c='+baseline.level.toFixed(2)+' · '+baseline.resolution+'× 网格</span>';
}
function renderSpectrum(){
 const el=$('#eventTrack');if(!state.spectrum)return;const p=preset();
 const arr=state.spectrum.events;$('#eventCount').textContent=arr.length+' 次采样差异';
 el.innerHTML='<div class="event-bed"></div>'+arr.map(e=>'<button class="event-mark" data-level="'+e.level+'" style="left:'+((e.level-p.min)/(p.max-p.min)*100).toFixed(2)+'%; height:'+Math.min(24,7+e.delta*2)+'px" title="跳转至高度 '+e.level.toFixed(2)+'"></button>').join('');
 el.querySelectorAll('button').forEach(b=>b.onclick=()=>{setLevel(Number(b.dataset.level));toast('已定位到变化候选的高度。下一步可寻找临界点或做三档精度验证。');});
}
function setLevel(v){const p=preset();state.level=safe(v,p.min,p.max);$('#levelSlider').value=state.level;$('#levelValue').textContent=fmt(state.level);schedule();saveURL();}
function saveURL(){const params=new URLSearchParams();params.set('world',state.id);params.set('level',state.level.toFixed(3));params.set('phase',state.phase.toFixed(3));params.set('scale',state.scale.toFixed(2));params.set('x',state.panX.toFixed(3));params.set('y',state.panY.toFixed(3));params.set('res',state.resolution);if(document.body.dataset.page==='studio')params.set('screen','studio');if(window.__lifeLens?.current?.id)params.set('life',window.__lifeLens.current.id);history.replaceState(null,'',location.pathname+'?'+params.toString());}
function worldFromClient(clientX,clientY){const r=canvas.getBoundingClientRect(),c=state.coords;if(!c)return null;return {x:c.x0+(clientX-r.left)/r.width*c.dx*c.nx,y:c.y0+(clientY-r.top)/r.height*c.dy*c.ny};}
function updateProbe(ev){const pos=worldFromClient(ev.clientX,ev.clientY);if(!pos)return;const probe=$('#probe'),v=evaluateField(pos.x,pos.y,preset(),state.phase);
 probe.hidden=false;probe.style.left=Math.min(ev.clientX-canvas.getBoundingClientRect().left+16,canvas.clientWidth-180)+'px';
 probe.style.top=Math.max(8,ev.clientY-canvas.getBoundingClientRect().top-55)+'px';
 probe.textContent='f = '+v.toFixed(3)+'  ·  ('+pos.x.toFixed(1)+', '+pos.y.toFixed(1)+')';
}
canvas.addEventListener('pointerdown',ev=>{canvas.setPointerCapture(ev.pointerId);state.drag={x:ev.clientX,y:ev.clientY,panX:state.panX,panY:state.panY,moved:false};});
canvas.addEventListener('pointermove',ev=>{updateProbe(ev);if(!state.drag)return;const dx=ev.clientX-state.drag.x,dy=ev.clientY-state.drag.y;if(Math.abs(dx)+Math.abs(dy)>5)state.drag.moved=true;if(state.drag.moved){
  state.panX=state.drag.panX-dx/state.resizeWidth*2*state.scale;
  state.panY=state.drag.panY-dy/state.resizeWidth*2*state.scale;
  schedule();
 }});
canvas.addEventListener('pointerup',ev=>{if(state.drag&&!state.drag.moved){const pt=worldFromClient(ev.clientX,ev.clientY);if(pt){
 state.pin=pt;$('#pin').hidden=false;
 $('#pinValue').textContent='f(x, y) = '+evaluateField(pt.x,pt.y,preset(),state.phase).toFixed(5);
 $('#pinCoords').textContent='x = '+pt.x.toFixed(3)+'   y = '+pt.y.toFixed(3);render();
 }}state.drag=null;saveURL();});
canvas.addEventListener('pointerleave',()=>{$('#probe').hidden=true;});
canvas.addEventListener('wheel',ev=>{ev.preventDefault();state.scale=safe(state.scale*Math.exp(ev.deltaY*.001),5,58);$('#scaleSlider').value=state.scale;$('#scaleValue').textContent=state.scale.toFixed(1);schedule();saveURL();},{passive:false});
$('#clearPin').onclick=()=>{state.pin=null;$('#pin').hidden=true;render();};
$('#setBaseline').onclick=()=>{if(!state.contour)return;const s=state.contour.stats;baseline={world:state.id,level:state.level,resolution:state.resolution,closed:s.closed,boundary:s.boundary,components:s.components};updateComparison();toast('对照已固定。改变高度或参数，再观察结构数量的差异。');};
$('#levelSlider').oninput=e=>setLevel(Number(e.target.value));
$('#scaleSlider').oninput=e=>{state.scale=+e.target.value;$('#scaleValue').textContent=state.scale.toFixed(1);schedule();saveURL();};
$('#phaseSlider').oninput=e=>{state.phase=+e.target.value;$('#phaseValue').textContent=state.phase.toFixed(2);schedule();saveURL();};
$('#detailSlider').oninput=e=>{state.resolution=+e.target.value;$('#detailValue').textContent=state.resolution;schedule();saveURL();};
$$('.mode').forEach(btn=>btn.onclick=()=>{state.mode=btn.dataset.mode;$$('.mode').forEach(b=>{const active=b===btn;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});updateInsights();if(state.mode==='research')toast('研究模式：记得改变采样网格与观察窗口进行稳健性检查。');});
$('#viewToggle').onclick=()=>{state.view=state.view==='terrain'?'heat':state.view==='heat'?'contours':'terrain';$('#viewLabel').textContent=state.view==='terrain'?'地貌':state.view==='heat'?'色场':'线稿';rasterDirty=true;render();};
$('#themeToggle').onclick=()=>{state.theme=(state.theme+1)%palettes.length;rasterDirty=true;render();};
$('#resetView').onclick=()=>{state.panX=0;state.panY=0;state.scale=22;$('#scaleSlider').value=22;$('#scaleValue').textContent='22.0';schedule();saveURL();};
$('#tryChallenge').onclick=()=>{const p=preset();state.phase=1.25;$('#phaseSlider').value=1.25;$('#phaseValue').textContent='1.25';state.level=p.id==='archipelago'?1:0.1;setLevel(state.level);schedule();toast(p.hint);};
function animate(t){if(state.playing){if(t-playTime>55){playTime=t;const p=preset();let next=state.level+(p.max-p.min)*.0018;if(next>p.max)next=p.min;setLevel(next);}requestAnimationFrame(animate);}}
$('#playLevel').onclick=()=>{state.playing=!state.playing;$('#playLevel').innerHTML=(state.playing?'Ⅱ &nbsp;暂停观察':'▶ &nbsp;观察变化');if(state.playing)requestAnimationFrame(animate);};
document.addEventListener('keydown',ev=>{if(ev.code==='Space'&&ev.target.tagName!=='INPUT'&&!ev.repeat){ev.preventDefault();$('#playLevel').click();}if(ev.key==='Escape')$('#clearPin').click();});
function toast(txt){const el=$('#toast');el.textContent=txt;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3400);}
async function share(){saveURL();try{await navigator.clipboard.writeText(location.href);toast('实验链接已复制。分享后可恢复参数、观察窗口与高度。');}catch{prompt('复制实验链接',location.href);}}
$('#copyLink').onclick=share;$('#copyState').onclick=share;

function geometrySignature(){return JSON.stringify([state.id,state.phase,state.panX,state.panY,state.scale,state.resizeWidth,state.resizeHeight]);}
function experimentSignature(){return JSON.stringify([state.id,state.phase,state.panX,state.panY,state.scale,state.resizeWidth,state.resizeHeight,state.level]);}
function researchPayload(action){
 return {action,requestId:++researchRequest,signature:action==='critical'?geometrySignature():experimentSignature(),id:state.id,phase:state.phase,level:state.level,scale:state.scale,panX:state.panX,panY:state.panY,width:state.resizeWidth,height:state.resizeHeight};
}
function runCritical(){const button=$('#findCritical');button.disabled=true;$('#criticalList').textContent='正在扫描局部驻点，并计算梯度与 Hessian…';worker.postMessage(researchPayload('critical'));}
function runVerification(){const button=$('#verifyGrid');button.disabled=true;$('#verificationOutput').textContent='正在计算 120、220、340 三组网格和相邻三个高度…';worker.postMessage(researchPayload('verify'));}
$('#findCritical').onclick=runCritical;$('#verifyGrid').onclick=runVerification;
function handleResearchResponse(m){
 const button=$(m.action==='critical'?'#findCritical':'#verifyGrid');button.disabled=false;
 if(m.error){toast('研究检查发生错误');console.error(m.error);return;}
 const expected=m.action==='critical'?geometrySignature():experimentSignature();
 if(m.signature!==expected){toast('地图参数已变化，旧计算被忽略。请重新运行检查。');return;}
 if(m.action==='critical'){
   criticalResult=m.result;criticalSignature=m.signature;
   const list=$('#criticalList');
   const sorted=[...m.result.points].sort((a,b)=>Math.abs(a.value-state.level)-Math.abs(b.value-state.level)).slice(0,8);
   if(!sorted.length){list.textContent='此窗口尚未发现满足数值阈值的候选驻点。试着扩大探索区域。';}
   else{const tags={saddle:'鞍点',minimum:'局部极小',maximum:'局部极大'};
     list.innerHTML=sorted.map((p,i)=>'<button class="critical-point" data-index="'+i+'"><span>◈ '+tags[p.type]+' <small>('+p.x.toFixed(2)+', '+p.y.toFixed(2)+')</small></span><small>f='+p.value.toFixed(3)+'</small></button>').join('');
     list.querySelectorAll('button').forEach(b=>b.onclick=()=>{
      const p=sorted[Number(b.dataset.index)];state.panX=p.x;state.panY=p.y;state.scale=Math.max(5,Math.min(state.scale*.47,12));
      $('#scaleSlider').value=state.scale;$('#scaleValue').textContent=state.scale.toFixed(1);
      state.pin={x:p.x,y:p.y};$('#pin').hidden=false;$('#pinValue').textContent='f(x, y) = '+p.value.toFixed(5);
      $('#pinCoords').textContent='x = '+p.x.toFixed(3)+'   y = '+p.y.toFixed(3);
      setLevel(p.value+Math.min(.04,(getPreset(state.id).max-getPreset(state.id).min)*.01));saveURL();
      toast('已进入局部显微镜视图；可运行三档精度验证。');
     });
   }
   render();
   toast('已找到 '+m.result.points.length+' 个数值驻点候选（不等于已证明的临界点）。');
 } else{
    latestVerification={signature:m.signature,...m.result};
    const checks=m.result.checks,yes=checks.filter(c=>c.comparison.flag==='consistent').length;
    $('#verificationOutput').dataset.stale='false';
    $('#verificationOutput').innerHTML='<strong>'+(yes===3?'三档网格观察一致':'仍需加密网格')+'</strong><br/><span>'+yes+'/3 个高度邻域符合相邻两档计数一致、曲线长度差 < 4.5% 的经验阈值。</span><br/>'+
      checks.map(c=>'c='+c.level.toFixed(3)+'：闭合 '+c.rows.map(r=>r.closed).join(' → ')+' · 漂移 '+(100*c.comparison.lengthDrift).toFixed(1)+'%').join('<br/>')+
      '<br/><span>仅为有限窗口的启发式数值检查，不是数学证明。</span>';
    $('#downloadReport').disabled=false;
    toast('已完成三档采样：'+yes+'/3 高度层符合观察一致性阈值。');
 }
}
$('#downloadReport').onclick=()=>{
 if(!latestVerification)return;
 const out={project:'Quasi Atlas',version:'0.2',experiment:{world:state.id,formula:preset().formula},verified:latestVerification,disclaimer:'Heuristic finite-domain grid sampling. Stability is not a proof.'};
 downloadBlob(JSON.stringify(out,null,2),filename('verification.json'),'application/json');
};

function downloadBlob(data,name,type){const blob=new Blob([data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function filename(ext){return 'quasi-atlas-'+state.id+'-c'+state.level.toFixed(2)+'-'+Date.now()+'.'+ext;}
$('#saveSnapshot').onclick=()=>{if(!state.contour)return;canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename('png');a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('PNG 已导出');},'image/png');};
$('#exportData').onclick=async()=>{if(!state.contour||!state.coords)return;const out={project:'Quasi Atlas',version:'0.1',generatedAt:new Date().toISOString(),scientificNotice:'Finite window numerical estimate. Boundary crossing does not prove unboundedness.',formula:preset().formula,parameters:{preset:state.id,level:state.level,phase:state.phase,scale:state.scale,panX:state.panX,panY:state.panY,gridResolution:state.resolution},sampling:state.coords,stats:state.contour.stats,baseline,verification:latestVerification,criticalCandidates:criticalResult,algorithm:state.contour.algorithm,spectrum:state.spectrum,contours:state.contour.paths.map(p=>({closed:p.closed,touchesBoundary:p.touchesBoundary,length:p.length,points:p.points}))};try {const {nx,ny,x0,y0,dx,dy}=state.coords;const model=createModel({presetId:state.id,phase:state.phase,level:state.level,bounds:{xmin:x0,xmax:x0+dx*nx,ymin:y0,ymax:y0+dy*ny},resolution:[nx,ny]});out.scientific=await createExperiment({model,observations:state.contour.stats,algorithm:state.contour.algorithm});}catch(err){console.warn('Scientific contract not included:',err.code||err.name);toast('数学数据有效性检查未通过，未导出实验包');return;}downloadBlob(JSON.stringify(out,null,2),filename('json'),'application/json');toast('实验数据已导出，含 E1 证据和 SHA-256 哈希');};
$('#exportSvg').onclick=()=>{if(!state.contour)return;const c=state.coords;let n=0;const paths=state.contour.paths.map(p=>{if(p.points.length<2)return '';n++;return '<path d="'+p.points.map((xy,i)=>{const x=(xy[0]-c.x0)/(c.dx*c.nx)*1400,y=(xy[1]-c.y0)/(c.dy*c.ny)*900;return (i?'L':'M')+x.toFixed(2)+','+y.toFixed(2);}).join(' ')+(p.closed?' Z':'')+'" />';}).join('');const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 900"><rect width="1400" height="900" fill="#082c37"/><g fill="none" stroke="#f4e9c9" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">'+paths+'</g><text x="35" y="55" fill="#f4e9c9" font-family="sans-serif" font-size="20">QUASI ATLAS · '+state.id+' · c = '+state.level.toFixed(3)+'</text></svg>';downloadBlob(svg,filename('svg'),'image/svg+xml');toast(n+' 条曲线已导出 SVG');};
const ro=new ResizeObserver(computeSize);ro.observe(wrap);window.addEventListener('resize',computeSize);
state.id=preset().id;state.level=safe(state.level,preset().min,preset().max);state.phase=safe(state.phase,-3.14,3.14);state.scale=safe(state.scale,5,58);state.resolution=safe(state.resolution,160,560);
$('#phaseSlider').value=state.phase;$('#scaleSlider').value=state.scale;$('#detailSlider').value=state.resolution;updateStatic();computeSize();
window.__lifeLens=setupLifeLens({
 selectModel:id=>selectPreset(id),setContourLevel:v=>setLevel(v),
 setPhase:v=>{state.phase=v;$('#phaseSlider').value=v;$('#phaseValue').textContent=v.toFixed(2);schedule();saveURL();},
 enterResearch:()=>{const b=document.querySelector('.mode[data-mode="research"]');if(b)b.click();document.querySelector('#lifeResearch').textContent='研究模式已打开：下方可检验网格精度';},
 readStats:()=>state.contour?.stats,download:(data,name,type)=>downloadBlob(data,name,type)
});
window.__appShell=setupAppShell({initialSearch,life:window.__lifeLens,
 activateResearch:mode=>document.querySelector('.mode[data-mode="'+mode+'"]').click(),
 showExperiment:id=>selectPreset(id)
});

function notebookView(){return {id:state.id,level:state.level,phase:state.phase,scale:state.scale,
 panX:state.panX,panY:state.panY,resolution:state.resolution,mode:state.mode,view:state.view,theme:state.theme};}
function notebookInputs(){
 if(window.__lifeLens?.current?.id==='beats')return {ready:false,reason:'一维声波教程尚未接入二维等值线实验复算；请切换二维世界。'};
 if(!state.contour||!state.coords||$('#numericStatus').textContent!=='计算完成'||refreshTimer!==null)
  return {ready:false,reason:'正在计算当前二维地图。计算完成后可保存新的不可变快照。'};
 const {nx,ny,x0,y0,dx,dy}=state.coords;
 return {ready:true,view:notebookView(),bounds:{xmin:x0,xmax:x0+nx*dx,ymin:y0,ymax:y0+ny*dy},resolution:[nx,ny]};
}
window.__notebook=setupNotebook({
 isValidField:notebookInputs,
 async capture(){
  const inputs=notebookInputs();
  if(!inputs.ready)throw new Error(inputs.reason);
  const model=createModel({presetId:state.id,phase:state.phase,level:state.level,
    bounds:inputs.bounds,resolution:inputs.resolution});
  const scientific=await createExperiment({model,observations:state.contour.stats,algorithm:state.contour.algorithm});
  return {view:notebookView(),scientific};
 },
 restore(view){
  window.__lifeLens?.hide();selectPreset(view.id);
  Object.assign(state,{id:view.id,level:view.level,phase:view.phase,scale:view.scale,
    panX:view.panX,panY:view.panY,resolution:view.resolution,view:view.view,theme:view.theme});
  rasterDirty=true;$('#phaseSlider').value=state.phase;$('#scaleSlider').value=state.scale;$('#detailSlider').value=state.resolution;
  updateStatic();$('#viewLabel').textContent=state.view==='terrain'?'地貌':state.view==='heat'?'色场':'线稿';
  const mode=document.querySelector('.mode[data-mode="'+view.mode+'"]');if(mode)mode.click();
  schedule();saveURL();
 },
 download:downloadBlob,showMessage:toast
});

window.__studioFocus=setupStudioFocus();
// G3.1 is progressive disclosure inside Research, not another permanent panel.
h0UI=setupH0UI({
 signature:experimentSignature,
 request:(direction,signature)=>{
  if(window.__lifeLens?.current?.id==='beats'){
   toast('拍频是一维信号，不属于二维 H0 网格实验。请先选二维世界。');return false;
  }
  worker.postMessage({...researchPayload('topology-h0'),direction,signature});return true;
 },
 download:downloadBlob,notify:toast
});
