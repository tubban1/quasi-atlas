// G2 portable, local-first Discovery Notebook.
// A hash detects mutation; it does NOT authenticate a sender or certify mathematical truth.
// v1: only audited 2-D preset fields. Unrecognized/future schemas fail closed.
import {createModel,createExperiment,verifyExperiment,sha256,canonicalJSON,ContractError,EXPERIMENT_SCHEMA} from './math/contract.js';
import {getPreset,PRESETS,evaluateField} from './math/fields.js';
import {extractContours} from './math/contours.js';

export const NOTEBOOK_SCHEMA='quasi-atlas.notebook/1.0';
export const G2_ENGINE='g2-replay/1.0';
export const MAX_SNAPSHOTS=16;
export const MAX_FILE_BYTES=2_000_000;
export const REPLAY_TOLERANCE=Object.freeze({lengthAbsolute:0.00001,lengthRelative:0.00001,countsExact:true});
const fail=(code,message)=>{throw new ContractError(code,message);};
const plain=(v)=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const checkKeys=(v,keys,label)=>{if(!plain(v))fail('INVALID_OBJECT',label+' must be a plain object');for(const key of Object.keys(v))if(!keys.includes(key))fail('UNKNOWN_FIELD',label+': '+key);};
const short=(v,label,max=1400)=>{if(typeof v!=='string'||v.length>max)fail('INVALID_TEXT',label+' invalid');return v;};
const bounded=(v,name,low,high)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<low||v>high)fail('INVALID_NUMBER',name+' invalid');return Object.is(v,-0)?0:v;};
const iso=(v)=>{if(typeof v!=='string'||v.length>40||!Number.isFinite(Date.parse(v)))fail('INVALID_DATE','date invalid');return v;};
const NOTES=['question','hypothesis','observation','counterexample','conclusion'];
export function cleanNotes(input={}){
 checkKeys(input,NOTES,'notes');
 return Object.fromEntries(NOTES.map(k=>[k,short(input[k]??'',k)]));
}
export function cleanView(v){
 checkKeys(v,['id','level','phase','scale','panX','panY','resolution','mode','view','theme'],'view');
 if(!PRESETS.some(p=>p.id===v.id))fail('UNKNOWN_PRESET','Unknown field');
 const p=getPreset(v.id);
 const view={id:v.id,level:bounded(v.level,'level',p.min,p.max),
 phase:bounded(v.phase,'phase',-Math.PI,Math.PI),scale:bounded(v.scale,'scale',5,58),
 panX:bounded(v.panX,'panX',-1e5,1e5),panY:bounded(v.panY,'panY',-1e5,1e5),
 resolution:bounded(v.resolution,'resolution',160,560),mode:v.mode,view:v.view,theme:v.theme};
 if(!Number.isInteger(view.resolution)||!['wander','learn','research'].includes(view.mode)||!['terrain','heat','contours'].includes(view.view)||!Number.isInteger(view.theme)||view.theme<0||view.theme>2)
   fail('INVALID_VIEW','View parameters invalid');
 return view;
}
function snapshotContent(item){const {createdAt,snapshotHash,scientific,...body}=item;if(!plain(scientific))fail('MODEL_INVALID','Missing scientific experiment');const {createdAt:scienceTimestamp,...scienceContent}=scientific;return {...body,scientific:scienceContent};}
export async function createSnapshot({view,scientific,notes={},label='探索快照'}){
 const clean=cleanView(view);
 await verifyTrustedExperiment(scientific);
 if(clean.id!==scientific.model.id||clean.level!==scientific.model.parameters.level||clean.phase!==scientific.model.parameters.phase)
   fail('MODEL_VIEW_MISMATCH','The visible field and scientific model differ');
 const item={schema:'quasi-atlas.snapshot/1.0',label:short(label,'label',100),createdAt:new Date().toISOString(),
   view:clean,notes:cleanNotes(notes),scientific};
 return {...item,snapshotHash:'sha256:'+await sha256(snapshotContent(item))};
}
export async function verifyTrustedExperiment(sci){
 await verifyExperiment(sci);
 const m=sci.model;
 if(!plain(m))fail('MODEL_INVALID','Missing model');
 const expected=createModel({presetId:m.id,phase:m.parameters?.phase,level:m.parameters?.level,
  bounds:{xmin:m.domain?.xmin,xmax:m.domain?.xmax,ymin:m.domain?.ymin,ymax:m.domain?.ymax},
  resolution:[m.sampling?.nx,m.sampling?.ny]});
 if(canonicalJSON(m)!==canonicalJSON(expected))fail('MODEL_MUTATED','Preset model differs from source definition');
 if(sci.engineVersion!=='g0.1')fail('ENGINE_VERSION_UNSUPPORTED','Unsupported mathematical engine version');
 if(sci.result.algorithm!=='marching-squares-bilinear-asymptotic-decider-v2')
   fail('UNKNOWN_ALGORITHM','Algorithm is unsupported for G2 replay');
 const st=sci.result.stats;
 if(!plain(st)||!Number.isInteger(st.components)||!Number.isInteger(st.closed)||!Number.isInteger(st.boundary)||st.closed+st.boundary!==st.components||
  ![st.components,st.closed,st.boundary,st.totalLength].every(x=>typeof x==='number'&&Number.isFinite(x)&&x>=0))
   fail('INVALID_STATS','Invalid result statistics');
 return true;
}
export async function verifySnapshot(item){
 checkKeys(item,['schema','label','createdAt','view','notes','scientific','snapshotHash'],'snapshot');
 if(item.schema!=='quasi-atlas.snapshot/1.0')fail('UNSUPPORTED_SCHEMA','Unknown snapshot schema');
 short(item.label,'label',100);iso(item.createdAt);
 cleanView(item.view);cleanNotes(item.notes);
 if(typeof item.snapshotHash!=='string'||!/^sha256:[a-f0-9]{64}$/.test(item.snapshotHash))fail('INVALID_HASH','Invalid snapshot hash');
 if('sha256:'+await sha256(snapshotContent(item))!==item.snapshotHash)fail('HASH_MISMATCH','Snapshot was altered');
 await verifyTrustedExperiment(item.scientific);
 if(item.view.id!==item.scientific.model.id||item.view.phase!==item.scientific.model.parameters.phase||item.view.level!==item.scientific.model.parameters.level)
   fail('MODEL_VIEW_MISMATCH','Snapshot field mismatch');
 return true;
}
export async function createNotebook({title='我的数学发现',notes={},snapshots=[]}={}){
 short(title,'title',120);if(!Array.isArray(snapshots)||snapshots.length>MAX_SNAPSHOTS)fail('SNAPSHOT_LIMIT','Too many snapshots');
 const hashes=new Set();
 for(const s of snapshots){await verifySnapshot(s);if(hashes.has(s.snapshotHash))fail('DUPLICATE_SNAPSHOT','Duplicate immutable snapshot');hashes.add(s.snapshotHash);}
 const doc={schema:NOTEBOOK_SCHEMA,engine:G2_ENGINE,title,notes:cleanNotes(notes),snapshots,
   provenance:{source:'audited-synthetic-presets',storage:'local-first',networkUpload:false,certified:false,
    warning:'G2 hash checks integrity, not identity, authenticity or mathematical proof.'}};
 return {...doc,notebookHash:'sha256:'+await sha256(doc),exportedAt:new Date().toISOString()};
}
export async function verifyNotebook(input){
 checkKeys(input,['schema','engine','title','notes','snapshots','provenance','notebookHash','exportedAt'],'notebook');
 if(input.schema!==NOTEBOOK_SCHEMA||input.engine!==G2_ENGINE)fail('UNSUPPORTED_SCHEMA','Unknown notebook format or engine version');
 if(typeof input.notebookHash!=='string'||!/^sha256:[a-f0-9]{64}$/.test(input.notebookHash))fail('INVALID_HASH','Invalid notebook hash');
 iso(input.exportedAt);
 const {notebookHash,exportedAt,...signed}=input;
 if('sha256:'+await sha256(signed)!==notebookHash)fail('HASH_MISMATCH','Notebook content modified');
 // Reconstruct exact required provenance and validated nested data.
 const clean=await createNotebook({title:input.title,notes:input.notes,snapshots:input.snapshots});
 if(canonicalJSON(signed)!==canonicalJSON((({notebookHash,exportedAt,...v})=>v)(clean)))fail('INVALID_NOTEBOOK','Unknown or invalid notebook contents');
 return true;
}
// Explicit one-way migration for old audited G0 exports, not arbitrary version guessing.
// Exact numeric model/domain are kept; reconstructed canvas view is only a visual approximation.
export async function migrateG0Experiment(input){
 if(!plain(input))fail('UNSUPPORTED_SCHEMA','Expected a G0 export object');
 const sci=input.schema===EXPERIMENT_SCHEMA?input:input.scientific;
 if(!sci||sci.schema!==EXPERIMENT_SCHEMA)fail('UNSUPPORTED_SCHEMA','No supported G0 experiment');
 await verifyTrustedExperiment(sci);
 const m=sci.model,b=m.domain;
 const range=(b.xmax-b.xmin)/2;
 const view={id:m.id,level:m.parameters.level,phase:m.parameters.phase,
   scale:Math.min(58,Math.max(5,range)),panX:(b.xmin+b.xmax)/2,panY:(b.ymin+b.ymax)/2,
   resolution:Math.max(160,Math.min(560,m.sampling.nx)),mode:'research',view:'terrain',theme:0};
 const snapshot=await createSnapshot({view,scientific:sci,label:'G0 数值实验（已迁移）',notes:{
   observation:'原有 G0 实验包已保留数学模型、有限域数值结果和 SHA-256 哈希。',
   counterexample:'原始交互视图信息不完整，恢复的视图可能和导出时不同；复算使用旧实验包内的精确数学域。'
 }});
 return createNotebook({title:'从 G0 导入的研究',notes:{question:'核查旧实验能否在新版本复算'},snapshots:[snapshot]});
}
export function notebookAsCSV(doc){
 const columns=['index','snapshot_hash','title','model','level','phase','xmin','xmax','ymin','ymax','nx','ny','components','closed','boundary','length','evidence','question','hypothesis','observation','counterexample','conclusion'];
 const numericColumns=new Set([0,4,5,6,7,8,9,10,11,12,13,14,15]);
 const escape=(x,untrusted=true)=>{const raw=String(x??'');const safe=(untrusted&&/^[=+@\-\t\r]/.test(raw)?'’':'')+raw;return '"'+safe.replace(/"/g,'""')+'"';};
 const lines=[columns.map(escape).join(',')];
 doc.snapshots.forEach((s,i)=>{const m=s.scientific.model,st=s.scientific.result.stats;const values=[
 i+1,s.snapshotHash,s.label,m.id,m.parameters.level,m.parameters.phase,m.domain.xmin,m.domain.xmax,m.domain.ymin,m.domain.ymax,
 m.sampling.nx,m.sampling.ny,st.components,st.closed,st.boundary,st.totalLength,'E1',
 ...NOTES.map(x=>s.notes[x])];lines.push(values.map((v,col)=>escape(v,!numericColumns.has(col))).join(','));});
 return lines.join('\r\n')+'\r\n';
}
// Deterministic headless re-computation of the SAME finite grid and float32 sampling as worker.js.
// No evaluation of user code, SVG, or formulas from imported files.
export function recomputeModel(model){
 const m=createModel({presetId:model.id,phase:model.parameters.phase,level:model.parameters.level,
  bounds:{xmin:model.domain.xmin,xmax:model.domain.xmax,ymin:model.domain.ymin,ymax:model.domain.ymax},
  resolution:[model.sampling.nx,model.sampling.ny]});
 if(canonicalJSON(m)!==canonicalJSON(model))fail('MODEL_MUTATED','Model changed');
 const {nx,ny}=m.sampling,{xmin,xmax,ymin,ymax}=m.domain;
 const dx=(xmax-xmin)/nx,dy=(ymax-ymin)/ny;
 const vals=new Float32Array((nx+1)*(ny+1)),p=getPreset(m.id);
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)vals[j*(nx+1)+i]=evaluateField(xmin+i*dx,ymin+j*dy,p,m.parameters.phase);
 const r=extractContours(vals,nx,ny,m.parameters.level,dx,dy,xmin,ymin);
 return {stats:{components:r.stats.components,closed:r.stats.closed,boundary:r.stats.boundary,totalLength:r.stats.totalLength},algorithm:r.algorithm};
}
export async function replaySnapshot(item,{tolerance=REPLAY_TOLERANCE}={}){
 await verifySnapshot(item);
 checkKeys(tolerance,['lengthAbsolute','lengthRelative','countsExact'],'tolerance');
 const abs=bounded(tolerance.lengthAbsolute,'lengthAbsolute',0,1),rel=bounded(tolerance.lengthRelative,'lengthRelative',0,1);
 if(tolerance.countsExact!==true)fail('INVALID_TOLERANCE','Counts must match exactly');
 const actual=recomputeModel(item.scientific.model),expected=item.scientific.result.stats,a=actual.stats;
 const delta={components:a.components-expected.components,closed:a.closed-expected.closed,boundary:a.boundary-expected.boundary,totalLength:a.totalLength-expected.totalLength};
 const limit=abs+rel*Math.max(Math.abs(expected.totalLength),Math.abs(a.totalLength));
 const match=delta.components===0&&delta.closed===0&&delta.boundary===0&&Math.abs(delta.totalLength)<=limit;
 return {schema:'quasi-atlas.replay-result/1.0',status:match?'MATCH':'DIFFERENT',level:'E1',
    snapshotHash:item.snapshotHash,modelHash:item.scientific.scientificHash,engine:G2_ENGINE,
    expected,actual:a,delta,tolerance:{lengthAbsolute:abs,lengthRelative:rel,countsExact:true},withinLengthTolerance:Math.abs(delta.totalLength)<=limit,
    warning:'Finite-grid numerical replay. A match is not numerical certification, independent solver agreement or proof.'};
}
export function compareSnapshots(a,b){
 const x=a.scientific,y=b.scientific,mx=x.model,my=y.model,sx=x.result.stats,sy=y.result.stats;
 return {sameModel:mx.id===my.id,sameDomain:canonicalJSON(mx.domain)===canonicalJSON(my.domain),
  sameSampling:canonicalJSON(mx.sampling)===canonicalJSON(my.sampling),
  sameParameters:canonicalJSON(mx.parameters)===canonicalJSON(my.parameters),
  left:{label:a.label,level:mx.parameters.level,phase:mx.parameters.phase,stats:sx,hash:a.snapshotHash},
  right:{label:b.label,level:my.parameters.level,phase:my.parameters.phase,stats:sy,hash:b.snapshotHash},
  delta:{components:sy.components-sx.components,closed:sy.closed-sx.closed,boundary:sy.boundary-sx.boundary,totalLength:sy.totalLength-sx.totalLength},
  notice:'Two finite-grid observations. Different sampling domains/resolutions are not an equivalent experiment comparison.'};
}
