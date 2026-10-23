import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {createModel,createExperiment,sha256} from '../src/math/contract.js';
import {createSnapshot,createNotebook,verifyNotebook,verifySnapshot,replaySnapshot,recomputeModel,notebookAsCSV,compareSnapshots,migrateG0Experiment,cleanView,NOTEBOOK_SCHEMA,MAX_SNAPSHOTS} from '../src/notebook-core.js';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const view={id:'archipelago',phase:.16,level:.55,scale:22,panX:0,panY:0,resolution:280,mode:'research',view:'terrain',theme:0};
const bounds={xmin:-10,xmax:10,ymin:-8,ymax:8};
async function sample(v=view, overrideStats=null){
 const model=createModel({presetId:v.id,phase:v.phase,level:v.level,bounds,resolution:[56,44]});
 const actual=recomputeModel(model);
 const sci=await createExperiment({model,observations:overrideStats||actual.stats,algorithm:actual.algorithm});
 return createSnapshot({view:v,scientific:sci,notes:{question:'为何连通性改变？',hypothesis:'假设水位越高边界变少',observation:'看到线条接触',counterexample:'小网格可能漏线',conclusion:'目前只是计算观察'}});
}
test('portable immutable snapshot integrity and headless replay match',async()=>{
 const s=await sample(),n=await createNotebook({snapshots:[s],notes:{question:'测试'}});
 assert.equal(n.schema,NOTEBOOK_SCHEMA);assert.equal(await verifySnapshot(s),true);assert.equal(await verifyNotebook(n),true);
 const replay=await replaySnapshot(s);assert.equal(replay.status,'MATCH');assert.equal(replay.level,'E1');
 assert.equal(replay.delta.components,0);assert.ok(Math.abs(replay.delta.totalLength)<=replay.tolerance.lengthAbsolute+replay.tolerance.lengthRelative*replay.expected.totalLength);
});
test('snapshot rendering theme irrelevant for scientific hash but view has different snapshot hash',async()=>{
 const s=await sample();const v={...view,theme:1};const t=await sample(v);
 assert.equal(s.scientific.scientificHash,t.scientific.scientificHash);assert.notEqual(s.snapshotHash,t.snapshotHash);
});
test('same scientific input shares canonical hash across runs regardless of timestamps',async()=>{
 const a=await sample(),b=await sample();assert.equal(a.snapshotHash,b.snapshotHash);
});
test('mismatched numerical stats report DIFFERENT without claiming a proof',async()=>{
 const a=await sample();const fake={...a.scientific.result.stats,components:1,closed:1,boundary:0,totalLength:18};
 const b=await sample(view,fake);const out=await replaySnapshot(b);assert.equal(out.status,'DIFFERENT');assert.match(out.warning,/not.*proof/);
});
test('tampered snapshot hash fails closed',async()=>{
 const s=await sample();s.notes.question='changed';await assert.rejects(()=>verifySnapshot(s),e=>e.code==='HASH_MISMATCH');
});
test('unknown schema and unsupported future versions fail closed',async()=>{
 const s=await sample(),n=await createNotebook({snapshots:[s]});
 n.schema='quasi-atlas.notebook/99.0';
 await assert.rejects(()=>verifyNotebook(n),e=>e.code==='UNSUPPORTED_SCHEMA');
});
test('unknown or dangerous JSON keys fail closed',async()=>{
 const n=await createNotebook({snapshots:[]});n.__proto__={polluted:true};
 await assert.rejects(()=>verifyNotebook(JSON.parse('{"__proto__":1}')),e=>e.code==='UNKNOWN_FIELD');
});
test('missing or invalid document hashes fail closed',async()=>{
 const n=await createNotebook({snapshots:[]});n.title='forged';
 await assert.rejects(()=>verifyNotebook(n),e=>e.code==='HASH_MISMATCH');
});
test('snapshot limit and duplicate immutable snapshots reject import',async()=>{
 const s=await sample();await assert.rejects(()=>createNotebook({snapshots:[s,s]}),e=>e.code==='DUPLICATE_SNAPSHOT');
 await assert.rejects(()=>createNotebook({snapshots:Array(MAX_SNAPSHOTS+1).fill(s)}),e=>e.code==='SNAPSHOT_LIMIT');
});
test('all four required narrative fields plus question are versioned and kept',async()=>{
 const s=await sample(),n=await createNotebook({snapshots:[s],title:'海水实验'});
 const verified=await verifyNotebook(n);assert.equal(verified,true);
 assert.equal(n.snapshots[0].notes.counterexample,'小网格可能漏线');
});
test('compares snapshots with finite-domain caveat, never says same proves stability',async()=>{
 const a=await sample(),b=await sample({...view,level:1.1});
 const result=compareSnapshots(a,b);assert.equal(result.sameModel,true);assert.equal(result.sameParameters,false);
 assert.match(result.notice,/finite-grid/);
});
test('CSV escapes unsafe spreadsheet formula injection and includes model provenance',async()=>{
 const s=await sample();const n=await createNotebook({snapshots:[s],notes:{observation:'=WEBSERVICE("https://evil")'}});
 const csv=notebookAsCSV(n);assert.ok(csv.includes('model'));assert.ok(csv.includes('archipelago'));assert.ok(csv.includes('E1'));assert.ok(csv.includes('"-10"'),'negative numerical coordinates must stay numeric in CSV');
 const s2=await createSnapshot({view,scientific:s.scientific,notes:{question:'=HYPERLINK("https://bad")'}});
 const c=notebookAsCSV(await createNotebook({snapshots:[s2]}));assert.match(c,/’=HYPERLINK/);
});
test('strictly rejects inconsistent model/view and impossible coordinates',async()=>{
 assert.throws(()=>cleanView({...view,scale:Infinity}));
 const a=await sample(),wrong={...view,phase:1.2};
 await assert.rejects(()=>createSnapshot({view:wrong,scientific:a.scientific}),e=>e.code==='MODEL_VIEW_MISMATCH');
});
test('malicious untrusted JSON cannot include executable content as model',async()=>{
 const a=await sample();const n=await createNotebook({snapshots:[a]});
 n.snapshots[0].scientific.model.source.definition='alert(1)';
 await assert.rejects(()=>verifyNotebook(n),e=>e.code==='HASH_MISMATCH');
});
test('scientific hash is content-derived and independent of display notes',async()=>{
 const a=await sample();const b=await createSnapshot({view,scientific:a.scientific,notes:{question:'完全不同的文字'}});
 assert.equal(a.scientific.scientificHash,b.scientific.scientificHash);
});
test('verified G0 experiment migrates to G2 while preserving exact mathematical input',async()=>{
 const original=await sample();
 const old={project:'Quasi Atlas',version:'0.1',scientific:original.scientific};
 const doc=await migrateG0Experiment(old);
 assert.equal(await verifyNotebook(doc),true);
 assert.equal(doc.snapshots.length,1);
 assert.equal(doc.snapshots[0].scientific.scientificHash,original.scientific.scientificHash);
 assert.equal((await replaySnapshot(doc.snapshots[0])).status,'MATCH');
 assert.match(doc.snapshots[0].notes.counterexample,/视图/);
});
test('unsupported old JSON without validated evidence is never guessed into a notebook',async()=>{
 await assert.rejects(()=>migrateG0Experiment({version:'0.1',formula:'x'}),e=>e.code==='UNSUPPORTED_SCHEMA');
});
test('headless Node CLI can verify and recompute exported JSON in two isolated processes',async()=>{
 const {mkdtempSync,writeFileSync,rmSync}=await import('node:fs');
 const {tmpdir}=await import('node:os');
 const {join}=await import('node:path');
 const {spawnSync}=await import('node:child_process');
 const dir=mkdtempSync(join(tmpdir(),'quasi-replay-')),file=join(dir,'notebook.json');
 try{
  const doc=await createNotebook({snapshots:[await sample()]});
  writeFileSync(file,JSON.stringify(doc));
  for(let i=0;i<2;i++){
   const run=spawnSync(process.execPath,['scripts/replay-notebook.mjs',file],{encoding:'utf8',timeout:20000});
   assert.equal(run.status,0,run.stderr);
   assert.equal(JSON.parse(run.stdout).status,'MATCH');
  }
  const bad={...doc,title:'tampered notebook'};writeFileSync(file,JSON.stringify(bad));
  const wrong=spawnSync(process.execPath,['scripts/replay-notebook.mjs',file],{encoding:'utf8',timeout:20000});
  assert.equal(wrong.status,2);assert.match(wrong.stderr,/HASH_MISMATCH/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
