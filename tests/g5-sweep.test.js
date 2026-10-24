import{test}from'node:test';import assert from'node:assert/strict';
import{readFileSync,writeFileSync,mkdtempSync,rmSync}from'node:fs';
import{tmpdir}from'node:os';import{join}from'node:path';import{spawnSync}from'node:child_process';
import{makeQuasiSweep,measureQuasi,quasiSample}from'../src/math/quasi-sweep.js';
test('G5 fixed parameter sweep is deterministic 36-case E1 with explicit matrix',()=>{
 const a=makeQuasiSweep(),b=makeQuasiSweep();
 assert.deepEqual(a,b);assert.equal(a.cases.length,36);
 assert.equal(a.model.frequencyMatrix.length,4);assert.equal(a.evidence,'E1');
 assert.ok(a.cases.every(x=>x.components===x.closed+x.boundary&&x.boundaryShare>=0&&x.boundaryShare<=1));
 assert.equal(quasiSample(0,0),4);
});
test('G5 sweep invalid frequency, oversized window and nonfinite threshold fail',()=>{
 assert.throws(()=>measureQuasi({radius:200}),/limits/);
 assert.throws(()=>measureQuasi({level:Infinity}),/limits/);
 assert.throws(()=>quasiSample(0,0,0,[[1,0]]),/frequency/);
});
test('G5 immutable manifest replay and tampered result rejected',()=>{
 const f='fixtures/g5/quasi-sweep.json';
 let p=spawnSync(process.execPath,['scripts/g5_sweep.mjs','verify',f],{encoding:'utf8',timeout:12000});
 assert.equal(p.status,0,p.stderr);
 const d=JSON.parse(readFileSync(f,'utf8'));d.cases[0].boundary+=1;
 const dir=mkdtempSync(join(tmpdir(),'qa-g5-'));const path=join(dir,'bad.json');
 try{writeFileSync(path,JSON.stringify(d));p=spawnSync(process.execPath,['scripts/g5_sweep.mjs','verify',path],{encoding:'utf8',timeout:12000});assert.equal(p.status,2);assert.match(p.stderr,/HASH_MISMATCH/);}
 finally{rmSync(dir,{recursive:true,force:true});}
});
