import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {webcrypto} from 'node:crypto';
import {createNotebook,verifyNotebook,replaySnapshot} from '../src/notebook-core.js';
import {getNodeBuildProvenance} from '../scripts/node-provenance.mjs';
import {NOTEBOOK_PINNED_SCHEMA,compareBuildProvenance,cleanBuildProvenance} from '../src/repro-metadata.js';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const fixture='fixtures/g2/replay-canary.json';
test('canonical pinned canary is valid and local source matches math/lock fingerprints',async()=>{
 const x=JSON.parse(await readFile(fixture,'utf8')),now=await getNodeBuildProvenance();
 assert.equal(x.schema,NOTEBOOK_PINNED_SCHEMA);
 assert.equal(await verifyNotebook(x),true);
 assert.equal(x.snapshots.length,3);
 const report=compareBuildProvenance(x.buildProvenance,now);
 assert.equal(report.status,'COMPATIBLE');
 for(const snap of x.snapshots)assert.equal((await replaySnapshot(snap)).status,'MATCH');
});
test('same source/lock across different commits is compatible but revision difference recorded',async()=>{
 const a=await getNodeBuildProvenance(),b={...a,gitCommit:'f'.repeat(40)};
 const c=compareBuildProvenance(a,b);
 assert.equal(c.status,'COMPATIBLE');
 if(a.gitCommit!=='f'.repeat(40))assert.equal(c.gitCommitMatch,false);
});
test('math source and lockfile mismatch are reported distinctly',async()=>{
 const a=await getNodeBuildProvenance();
 assert.equal(compareBuildProvenance(a,{...a,mathSourceSha256:'sha256:'+'0'.repeat(64)}).status,'MATH_SOURCE_MISMATCH');
 assert.equal(compareBuildProvenance(a,{...a,lockSha256:'sha256:'+'0'.repeat(64)}).status,'LOCKFILE_MISMATCH');
 assert.throws(()=>cleanBuildProvenance({...a,token:'password'}),e=>e.code==='INVALID_PROVENANCE');
});
test('a source fingerprint is protected by notebookHash, and a valid foreign fingerprint blocks CLI replay',async()=>{
 const source=JSON.parse(await readFile(fixture,'utf8'));
 source.buildProvenance.mathSourceSha256='sha256:'+'0'.repeat(64);
 await assert.rejects(()=>verifyNotebook(source),e=>e.code==='HASH_MISMATCH');
 const newer=await createNotebook({title:source.title,notes:source.notes,snapshots:source.snapshots,buildProvenance:source.buildProvenance});
 const {mkdtempSync,writeFileSync,rmSync}=await import('node:fs'),{tmpdir}=await import('node:os'),{join}=await import('node:path');
 const dir=mkdtempSync(join(tmpdir(),'quasi-mismatch-')),file=join(dir,'notebook.json');
 try{
  writeFileSync(file,JSON.stringify(newer));
  const p=spawnSync(process.execPath,['scripts/replay-notebook.mjs',file],{encoding:'utf8',timeout:15000});
  assert.equal(p.status,3,p.stderr);
  const result=JSON.parse(p.stdout);
  assert.equal(result.status,'ENVIRONMENT_MISMATCH');
  assert.equal(result.results.length,0);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('two receipts from the same OS/architecture cannot satisfy cross-runtime gate',async()=>{
 const {mkdtempSync,writeFileSync,rmSync}=await import('node:fs'),{tmpdir}=await import('node:os'),{join}=await import('node:path');
 const dir=mkdtempSync(join(tmpdir(),'quasi-samehost-')),a=join(dir,'a.json'),b=join(dir,'b.json');
 try{
  for(const file of [a,b]){
   const p=spawnSync(process.execPath,['scripts/replay-notebook.mjs',fixture,'--receipt',file],{encoding:'utf8',timeout:15000});
   assert.equal(p.status,0,p.stderr);
  }
  const p=spawnSync(process.execPath,['scripts/compare-replay-receipts.mjs',a,b],{encoding:'utf8',timeout:15000});
  assert.equal(p.status,2);
  assert.match(p.stderr,/same machine|different OS/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
