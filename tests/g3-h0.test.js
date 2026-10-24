import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {analyzeH0} from '../src/math/topology-h0.js';
import {floodCount,auditH0AgainstFlood} from '../src/math/h0-flood-reference.js';
const fixture=JSON.parse(await readFile(new URL('../fixtures/g3/h0-bfs-golden.json',import.meta.url),'utf8'));
test('30 fixed reference datasets: independent Python BFS and JS H0 agree on all 480 threshold counts',()=>{
 assert.equal(fixture.cases.length,30);
 let count=0;
 for(const c of fixture.cases){
  for(const group of c.samples){
   const levels=group.thresholds.map(x=>x.level);
   const result=analyzeH0(c.values,c.nx,c.ny,{direction:group.direction,thresholds:levels,maxBars:15});
   const diff=auditH0AgainstFlood(c.values,c.nx,c.ny,result);
   assert.equal(diff.status,'MATCH',c.id+' '+group.direction);
   for(let i=0;i<levels.length;i++){
    const actual=result.thresholds[i].components,gold=group.thresholds[i].expectedComponents;
    assert.equal(actual,gold,c.id+' '+group.direction+' '+levels[i]);
    assert.equal(floodCount(c.values,c.nx,c.ny,levels[i],group.direction).components,gold);
    count++;
   }
   assert.equal(result.evidence,'E1');assert.equal(result.certified,false);
   assert.equal(result.grid.vertices,(c.nx+1)*(c.ny+1));
  }
 }
 assert.equal(count,480);
});
test('two isolated islands merge in superlevel H0 at deterministic saddle threshold',()=>{
 // One row of three vertices where two high maxima become connected through valley.
 const r=analyzeH0([3,0,2,3,0,2],2,1,{direction:'superlevel',thresholds:[3,2,1,0]});
 assert.deepEqual(r.thresholds.map(x=>x.components),[1,2,2,1]);
 assert.equal(r.positiveFiniteBars,1);
 assert.equal(r.bars.find(x=>x.death!==null).persistence,2);
});
test('dual filtration handles tied plateaus and extrema at exact threshold',()=>{
 const grid=[1,1,1,1,1,1,1,1,1];
 for(const direction of ['superlevel','sublevel']){
  const r=analyzeH0(grid,2,2,{direction,thresholds:[0,1,2]});
  assert.deepEqual(r.thresholds.map(x=>x.components),direction==='superlevel'?[1,1,0]:[0,1,1]);
  assert.equal(r.positiveFiniteBars,0);
  assert.equal(r.bars.length,1);
 }
});
test('nonfinite, malformed, oversized, direction and thresholds are rejected',()=>{
 assert.throws(()=>analyzeH0([1,2,NaN,4],1,1),/Nonfinite/);
 assert.throws(()=>analyzeH0([1,2,3],1,1),/Wrong vertex/);
 assert.throws(()=>analyzeH0([1,2,3,4],1,1,{direction:'auto'}),/filtration/);
 assert.throws(()=>analyzeH0([1,2,3,4],1,1,{thresholds:[Infinity]}),/thresholds/);
 assert.throws(()=>analyzeH0([],499,400),/150000/);
});
test('independent BFS distinguishes an intentionally forged H0 component count',()=>{
 const values=[0,1,0,1,0,1,0,1,0];
 const result=analyzeH0(values,2,2,{thresholds:[.5]});
 result.thresholds[0].components+=1;
 const check=auditH0AgainstFlood(values,2,2,result);
 assert.equal(check.status,'DIFFERENT');
 assert.equal(check.checks[0].status,'DIFFERENT');
});
test('Python standard-library reference source verifies its 30 checked-in expected fixtures',()=>{
 const p=spawnSync('python3',['scripts/g3_reference.py','--verify'],{encoding:'utf8',timeout:10000});
 if(p.error?.code==='ENOENT'){ // Vercel's Node build may not bundle Python; fixed expected fixture remains mandatory above.
  assert.ok(fixture.cases.length>=30);return;
 }
 assert.equal(p.status,0,p.stderr);
 assert.match(p.stdout,/PYTHON_BFS_REFERENCE_PASS/);
});
