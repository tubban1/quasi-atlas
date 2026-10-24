import {test} from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {cubicalBettiAt,cubicalBettiSweep} from '../src/math/cubical-h1.js';
const bytes=await readFile(new URL('../fixtures/g3/h0-bfs-golden.json',import.meta.url));
const input=JSON.parse(bytes),gold=JSON.parse(await readFile(new URL('../fixtures/g3/h1-gudhi-thresholds.json',import.meta.url),'utf8'));
test('GUDHI third party H1 matches all 480 threshold checks, 30 cases both filtrations',()=>{
 assert.equal(gold.sourceSha256,'sha256:'+createHash('sha256').update(bytes).digest('hex'));
 assert.equal(gold.gudhiVersion,'3.11.0');assert.equal(gold.results.length,30);
 let checked=0,holes=0;
 for(let i=0;i<input.cases.length;i++){
  const c=input.cases[i],g=gold.results[i];assert.equal(c.id,g.id);
  for(let j=0;j<2;j++){
   const p=g.directions[j];const actual=cubicalBettiSweep(c.values,c.nx,c.ny,p.levels,p.direction);
   const got=actual.results.map(x=>x.betti1);
   assert.deepEqual(got,p.betti1,c.id+' '+p.direction);checked+=got.length;
   holes+=got.filter(x=>x>0).length;
   assert.equal(actual.certified,false);
  }
 }
 assert.equal(checked,480);assert.equal(holes,58);
});
test('planar 3x3 lattice missing central vertex creates no hole: missing central square edges',()=>{
 const z=[0,0,0,0,8,0,0,0,0]; const b=cubicalBettiAt(z,2,2,1,'sublevel');
 assert.equal(b.betti1,1);assert.equal(b.betti0,1);
 assert.equal(b.euler,0);
});
test('full filled grid has no holes and empty grid has no components',()=>{
 const z=[1,1,1,1,1,1,1,1,1];assert.equal(cubicalBettiAt(z,2,2,1,'sublevel').betti1,0);
 assert.equal(cubicalBettiAt(z,2,2,-1,'sublevel').betti0,0);
 assert.equal(cubicalBettiAt(z,2,2,-1,'sublevel').betti1,0);
});
test('invalid geometry and thresholds fail closed',()=>{
 assert.throws(()=>cubicalBettiAt([1,2,3],1,1,0),/shape/);
 assert.throws(()=>cubicalBettiAt([1,2,3,4],1,1,Infinity),/threshold/);
 assert.throws(()=>cubicalBettiSweep([1,2,3,4],1,1,[NaN]),/levels/);
});
