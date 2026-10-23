import {createSnapshot,createNotebook,verifyNotebook,migrateG0Experiment,compareSnapshots,notebookAsCSV,MAX_SNAPSHOTS,MAX_FILE_BYTES} from './notebook-core.js';
const STORAGE_KEY='quasi-atlas.g2.notebook/1';
const fields={question:'nbQuestion',hypothesis:'nbHypothesis',observation:'nbObservation',counterexample:'nbCounterexample',conclusion:'nbConclusion'};
export function setupNotebook({capture,restore,download,showMessage,isValidField}){
 const $=(id)=>document.getElementById(id),dialog=$('notebookDialog'),worker=new Worker(new URL('./notebook-worker.js',import.meta.url),{type:'module'});
 let snapshots=[],selected=-1,storeWarning='',dirty=false,updateTimer=null,pendingReplay=null,runId=0,lastRenderedCount=-1;
 const status=(msg,error=false)=>{$('nbStatus').textContent=msg;$('nbStatus').dataset.error=String(error);};
 const getNotes=()=>Object.fromEntries(Object.entries(fields).map(([key,id])=>[key,$(id).value]));
 const setNotes=o=>{for(const [key,id] of Object.entries(fields))$(id).value=o?.[key]||'';};
 function alertError(err,prefix='操作失败'){status(prefix+'：'+(err?.code||err?.message||'未知错误'),true);}
 const current=()=>snapshots[selected]||null;
 function renderStale(){
  const s=current(),v=isValidField();
  const hint=$('nbStale');
  if(!v.ready){hint.textContent=v.reason;hint.dataset.stale='true';return;}
  if(!s){hint.textContent='当前模型已计算，可以记录第一份快照。';hint.dataset.stale='false';return;}
  const a=s.view,b=v.view;
  const stale=['id','phase','level','scale','panX','panY','resolution'].some(k=>a[k]!==b[k])||
    s.scientific.model.domain.xmin!==v.bounds?.xmin||s.scientific.model.domain.xmax!==v.bounds?.xmax||
    s.scientific.model.domain.ymin!==v.bounds?.ymin||s.scientific.model.domain.ymax!==v.bounds?.ymax||
    s.scientific.model.sampling.nx!==v.resolution?.[0]||s.scientific.model.sampling.ny!==v.resolution?.[1];
  dirty=stale;
  hint.dataset.stale=String(stale);
  hint.textContent=stale?'● 当前参数或观察窗口已变化；所选旧快照保留。请重新记录以获得新证据。':'✓ 当前输入与所选快照匹配（不代表已重新复算）。';
 }
 function makeOption(value,label){const opt=document.createElement('option');opt.value=String(value);opt.textContent=label;return opt;}
 function render(){
  $('nbCount').textContent=String(snapshots.length);
  $('nbStorageInfo').textContent=snapshots.length+'/'+MAX_SNAPSHOTS+' 个永久快照（本机）';
  const list=$('nbList');list.replaceChildren();
  if(!snapshots.length){const empty=document.createElement('p');empty.className='nb-empty';empty.textContent='还没有实验快照。先改变工作台里的数值，再点击左侧“记录当前模型”。';list.append(empty);}
  snapshots.forEach((item,i)=>{
   const s=item.scientific.result.stats,button=document.createElement('button');
   button.type='button';button.className='nb-item'+(i===selected?' selected':'');button.dataset.index=String(i);
   const title=document.createElement('strong');title.textContent=item.label;
   const caption=document.createElement('small');caption.textContent=item.view.id+' · c='+item.view.level.toFixed(3)+' · '+s.components+' 条曲线 · E1';
   const fingerprint=document.createElement('code');fingerprint.textContent=item.snapshotHash.slice(0,21)+'…';
   button.append(title,caption,fingerprint);button.addEventListener('click',()=>{selected=i;render();status('已选中：'+item.label);});
   list.append(button);
  });
  const has=!!current();for(const id of ['nbRestore','nbReplay','nbDelete'])$(id).disabled=!has;
  $('nbCompare').disabled=snapshots.length<2;
  for(const [id,def] of [['nbCompareA',0],['nbCompareB',snapshots.length-1]]){
   const select=$(id),old=select.value;select.replaceChildren();
   if(!snapshots.length){select.append(makeOption('','没有快照'));select.disabled=true;continue;}
   select.disabled=false;snapshots.forEach((item,i)=>select.append(makeOption(i,(i+1)+'. '+item.label)));
   select.value=(lastRenderedCount===snapshots.length&&old!==''&&Number(old)>=0&&Number(old)<snapshots.length)?old:String(def);
  }
  lastRenderedCount=snapshots.length;renderStale();
 }
 async function persist(){
  const doc=await createNotebook({title:$('nbTitle').value||'我的数学发现',notes:getNotes(),snapshots});
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(doc));storeWarning='';return doc;}
  catch(err){storeWarning='本地存储不可用。请立即导出 JSON 保存研究。';status(storeWarning,true);return doc;}
 }
 function queuePersist(){clearTimeout(updateTimer);updateTimer=setTimeout(()=>{persist().catch(e=>alertError(e,'保存失败'));},450);}
 async function load(){
  let raw;try{raw=localStorage.getItem(STORAGE_KEY);}catch{status('本机存储不可用；可以使用 JSON 下载与导入。',true);return;}
  if(!raw)return;
  if(new Blob([raw]).size>MAX_FILE_BYTES){status('本地缓存超过允许大小，未加载；请手动处理。',true);return;}
  try{const doc=JSON.parse(raw);await verifyNotebook(doc);
   snapshots=[...doc.snapshots];selected=snapshots.length-1;$('nbTitle').value=doc.title;setNotes(doc.notes);
   render();status('已从本机恢复 '+snapshots.length+' 个实验快照。');
  }catch(err){alertError(err,'本机数据校验失败，未加载');}
 }
 $('openNotebook').addEventListener('click',()=>{render();dialog.showModal();});
 $('nbClose').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',ev=>{if(ev.target===dialog)dialog.close();});
 for(const id of ['nbTitle',...Object.values(fields)])$(id).addEventListener('input',queuePersist);
 $('nbCapture').addEventListener('click',async()=>{
  const button=$('nbCapture');if(button.disabled)return;button.disabled=true;status('正在固定数学模型和 E1 观测…');
  try{
   if(snapshots.length>=MAX_SNAPSHOTS)throw Object.assign(new Error('达到 '+MAX_SNAPSHOTS+' 个快照上限，请先导出并整理。'),{code:'SNAPSHOT_LIMIT'});
   const {view,scientific}=await capture();
   const label=$('nbLabel').value.trim()||('发现 '+(snapshots.length+1)+' · '+view.id+' / '+view.level.toFixed(2));
   const item=await createSnapshot({view,scientific,notes:getNotes(),label});
   if(snapshots.some(x=>x.snapshotHash===item.snapshotHash))throw Object.assign(new Error('相同数学数据和笔记已保存，调整参数或内容后再试。'),{code:'DUPLICATE_SNAPSHOT'});
   snapshots.push(item);selected=snapshots.length-1;
   await persist();render();status('快照已固定，数学哈希 '+item.scientific.scientificHash.slice(0,20)+'…');
  }catch(err){alertError(err,'快照未保存');}finally{button.disabled=false;}
 });
 $('nbRestore').addEventListener('click',()=>{
  const item=current();if(!item)return;
  try{restore(item.view);dialog.close();showMessage('已恢复交互视图。复现实验请再点击“独立复算”。');}
  catch(err){alertError(err,'恢复失败');}
 });
 $('nbDelete').addEventListener('click',async()=>{
  const item=current();if(!item||!confirm('确定删除「'+item.label+'」吗？请确认已经导出 JSON 备份。'))return;
  snapshots.splice(selected,1);selected=Math.min(selected,snapshots.length-1);
  await persist();render();status('已从本机删除。');
 });
 $('nbCompare').addEventListener('click',()=>{
  const a=Number($('nbCompareA').value),b=Number($('nbCompareB').value),output=$('nbComparison');
  if(a===b||!snapshots[a]||!snapshots[b]){output.textContent='请选两次不同的快照。';return;}
  const d=compareSnapshots(snapshots[a],snapshots[b]);output.replaceChildren();
  const header=document.createElement('div');header.className='nb-compare-badges';
  const intro=document.createElement('strong');intro.textContent=d.sameModel?'同一预设数学世界':'不同数学世界';
  const check=document.createElement('span');check.textContent=d.sameDomain&&d.sameSampling?'相同坐标窗口与采样栅格':'⚠ 坐标窗口或分辨率不同，数值不适合直接归因';
  header.append(intro,check);output.append(header);
  const grid=document.createElement('div');grid.className='nb-side-by-side';
  for(const [name,item] of [['之前',d.left],['之后',d.right]]){
   const box=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('p');
   title.textContent=name+' · '+item.label;
   detail.textContent='c='+item.level.toFixed(3)+' / φ='+item.phase.toFixed(2)+'\n连通分量 '+item.stats.components+'；闭合 '+item.stats.closed+'\n总长度 '+item.stats.totalLength.toFixed(3);
   box.append(title,detail);grid.append(box);
  }
  output.append(grid);const footer=document.createElement('p');footer.className='nb-compare-delta';footer.textContent='差值：分量 '+(d.delta.components>=0?'+':'')+d.delta.components+' · 长度 '+d.delta.totalLength.toFixed(3)+'。仅是 E1 有限区域数值比较。';output.append(footer);
  status('对照结果已生成，原始两份快照未修改。');
 });
 worker.addEventListener('message',({data})=>{
  if(!pendingReplay||data.requestId!==pendingReplay.id)return;
  const {button,snapshot}=pendingReplay;pendingReplay=null;button.disabled=false;
  const el=$('nbReplayOutput');el.dataset.status=data.error?'INVALID':data.result.status;
  if(data.error){el.textContent='复算失败：'+data.error.code+' · '+data.error.message;status('复算未通过：'+data.error.code,true);return;}
  const r=data.result;el.textContent=(r.status==='MATCH'?'✓ MATCH · 同一网格算法重算一致':'⚠ DIFFERENT · 与保存结果不一致')+
   '\n原记录：'+r.expected.components+' 条，长度 '+r.expected.totalLength.toFixed(5)+
   '\n新计算：'+r.actual.components+' 条，长度 '+r.actual.totalLength.toFixed(5)+
   '\n长度差：'+r.delta.totalLength.toFixed(8)+'；精度规则：计数必须相等，长度差 ≤ 1e-5 + 1e-5×参考长度。'+
   '\n仅检验离散计算复现，不是独立算法认证或数学证明。';
  status('同引擎离线复算 '+r.status+' · '+snapshot.label,r.status!=='MATCH');
 });
 $('nbReplay').addEventListener('click',()=>{
  const snapshot=current();if(!snapshot||pendingReplay)return;
  const button=$('nbReplay'),id=++runId;button.disabled=true;pendingReplay={id,button,snapshot};
  $('nbReplayOutput').textContent='正在工作线程中从固定数学输入重新生成 float32 网格…';
  worker.postMessage({requestId:id,snapshot});
 });
 $('nbExportJSON').addEventListener('click',async()=>{
  try{const doc=await persist();download(JSON.stringify(doc,null,2),'quasi-atlas-notebook.json','application/json');status('已导出带哈希的完整 Notebook JSON。');}
  catch(err){alertError(err,'导出失败');}
 });
 $('nbExportCSV').addEventListener('click',async()=>{
  try{const doc=await persist();download(notebookAsCSV(doc),'quasi-atlas-notebook.csv','text/csv;charset=utf-8');status('已导出安全转义的 CSV 概览。');}
  catch(err){alertError(err,'导出失败');}
 });
 $('nbExportSVG').addEventListener('click',()=>{
  if(!isValidField().ready){status('当前二维地图尚未完成计算，无法导出 SVG。',true);return;}
  dialog.close();document.getElementById('exportSvg').click();
 });
 $('nbImport').addEventListener('change',async(e)=>{
  const file=e.target.files?.[0];e.target.value='';if(!file)return;
  try{
   if(file.size>MAX_FILE_BYTES)throw Object.assign(new Error('文件不得超过 2 MB'),{code:'RESOURCE_LIMIT'});
   const raw=JSON.parse(await file.text());const data=raw.schema==='quasi-atlas.notebook/1.0'?raw:await migrateG0Experiment(raw);await verifyNotebook(data);
   if(snapshots.length&&!confirm('确认用导入的 '+data.snapshots.length+' 个快照替换本机当前笔记吗？请先备份原有内容。'))return;
   snapshots=[...data.snapshots];selected=snapshots.length-1;$('nbTitle').value=data.title;setNotes(data.notes);
   const saved=await persist();render();status('成功导入 '+saved.snapshots.length+' 个经过哈希与数学契约校验的快照。'+(raw.schema==='quasi-atlas.notebook/1.0'?'':' 已从旧 G0 格式迁移；视图恢复可能是近似的。'));
  }catch(err){alertError(err,'不可信或不支持的文件，已拒绝导入');}
 });
 load().catch(err=>alertError(err,'Notebook 初始化失败'));
 return {markStale:renderStale,open:()=>{$('openNotebook').click();},get count(){return snapshots.length;}};
}
