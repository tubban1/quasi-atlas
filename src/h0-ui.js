// G3.1 progressive research panel; only opens at the user's request.
export function setupH0UI({request,signature,download,notify}){
 const $=id=>document.getElementById(id),run=$('runH0'),exportButton=$('exportH0');
 let last=null,pending=null;
 const stale=()=>{if(!last)return;const changed=signature()!==last.signature||$('h0Direction').value!==last.result.filtration;
   $('h0Freshness').textContent=changed?'⚠ 数学输入已变化，请重新分析':'✓ 与当前实验参数一致';
   $('h0Freshness').dataset.stale=String(changed);exportButton.disabled=changed;
 };
 function render(msg){
  const {result,crossCheck,source,holes}=msg;
  const atLevel=result.thresholds.find(x=>x.level===source.level);
  const title=$('h0Overview');title.replaceChildren();
  const val=document.createElement('strong');val.textContent=atLevel?.components??'—';
  const info=document.createElement('span');info.textContent='个离散连通区域 · '+(result.filtration==='superlevel'?'高于阈值':'低于阈值');
  title.append(val,info);
  const atH1=holes?.results.find(x=>x.level===source.level);
  const hole=document.createElement('div');hole.className='h0-hole-count';hole.textContent='◌ '+(atH1?.betti1??'—')+' 个洞 · 有限网格 H1';title.after(hole);const old=title.parentElement.querySelectorAll('.h0-hole-count');if(old.length>1)old[0].remove();
  $('h0Audit').textContent=crossCheck.status==='MATCH'?
   '✓ 两套算法一致：并查集 H0 与独立 BFS 在 '+crossCheck.checks.length+' 个阈值均匹配。':
   '⚠ 发现差异，不能认定本次数值结果稳定。';
  $('h0Audit').dataset.status=crossCheck.status;
  const rows=$('h0Bars');rows.replaceChildren();
  const max=Math.max(1e-12,...result.bars.filter(x=>x.persistence!==null).map(x=>x.persistence));
  for(const b of result.bars.slice(0,9)){
   const row=document.createElement('div');row.className='h0-bar-row';
   const caption=document.createElement('span');
   caption.textContent=b.death===null?'最早区域 · 全程持续':'从 '+b.birth.toFixed(3)+' 到 '+b.death.toFixed(3);
   const rail=document.createElement('div');rail.className='h0-bar-rail';
   const bar=document.createElement('div');bar.className='h0-bar-fill'+(b.death===null?' essential':'');
   bar.style.width=(b.death===null?100:Math.max(3,100*b.persistence/max))+'%';
   rail.append(bar);row.append(caption,rail);rows.append(row);
  }
  $('h0Limits').textContent='有限 '+source.nx+'×'+source.ny+' 网格；'+result.positiveFiniteBars+
   ' 条正持续区间；'+result.truncatedBars+' 条因列表限制未展示。零长度配对 '+result.zeroLengthBars+
   ' 条被排除。边界开放且不作周期连接；H1 仅计算各高度的洞数量，尚无 H1 持久条形码。';
 }
 run.addEventListener('click',()=>{
  const direction=$('h0Direction').value;
  if(pending)return;
  pending=signature();run.disabled=true;exportButton.disabled=true;
  $('h0Overview').textContent='正在重新计算顶点网格与分量合并…';
  $('h0Audit').textContent='';
  if(request(direction,pending)===false){pending=null;run.disabled=false;$('h0Overview').textContent='请选择一个二维数学世界后再计算。';}
 });
 $('h0Direction').addEventListener('change',stale);
 exportButton.addEventListener('click',()=>{
  if(!last||signature()!==last.signature||$('h0Direction').value!==last.result.filtration)return notify('输入或分析方向已变化，请重新分析 H0');
  const report={schema:'quasi-atlas.h0-audit/1.0',createdAt:new Date().toISOString(),
    source:last.source,persistence:last.result,holes:last.holes,reference:last.crossCheck,
    evidence:'E1',scientificClaim:'Finite vertex-graph H0; not continuous topology, TTK/GUDHI certification or proof.'};
  download(JSON.stringify(report,null,2),'quasi-atlas-h0-audit.json','application/json');
 });
 return {
  receive(msg){
   if(msg.action!=='topology-h0')return false;
   run.disabled=false;pending=null;
   if(msg.error){$('h0Overview').textContent='H0 分析失败';$('h0Audit').textContent=msg.error;return true;}
   if(msg.signature!==signature()){$('h0Overview').textContent='参数已变化，忽略旧结果';notify('H0 计算期间参数已变化，请重试');return true;}
   last=msg;render(msg);stale();
   if(msg.crossCheck.status==='DIFFERENT')notify('H0 双算法输出不一致，已保留差异报告');
   return true;
  },markStale:stale
 };
}
