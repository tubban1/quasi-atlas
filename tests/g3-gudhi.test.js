import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {analyzeH0} from '../src/math/topology-h0.js';

const raw=await readFile(new URL('../fixtures/g3/h0-bfs-golden.json',import.meta.url));
const golden=JSON.parse(raw.toString('utf8'));
const gudhi=JSON.parse(await readFile(new URL('../fixtures/g3/h0-gudhi-golden.json',import.meta.url),'utf8'));
function sortBars(bars){
 return [...bars].sort((a,b)=>a[0]-b[0]||((a[1]??-Infinity)-(b[1]??-Infinity)));
}
function compareH0Bars(result,reference){
 const got=sortBars(result.bars.map(x=>[x.birth,x.death]));
 const expected=sortBars(reference);
 if(got.length!==expected.length)return {status:'DIFFERENT',reason:'interval-count',got:got.length,expected:expected.length};
 for(let i=0;i<got.length;i++)for(let j=0;j<2;j++){
  const a=got[i][j],b=expected[i][j];
  if(a===null&&b===null)continue;
  if(a===null||b===null||!Number.isFinite(a)||!Number.isFinite(b)||Math.abs(a-b)>1e-8)
   return {status:'DIFFERENT',reason:'barcode',index:i,got:got[i],expected:expected[i]};
 }
 return {status:'MATCH',intervals:got.length};
}
test('pinned GUDHI v3.11.0 cubical reference matches all 1048 H0 barcode pairs for 30 cases',()=>{
 assert.equal(gudhi.schema,'quasi-atlas.g3.gudhi-h0-golden/1.0');
 assert.equal(gudhi.gudhiVersion,'3.11.0');
 assert.equal(gudhi.numpyVersion,'2.4.6');
 assert.equal(gudhi.basedOnSha256,'sha256:'+createHash('sha256').update(raw).digest('hex'));
 assert.equal(golden.cases.length,30);assert.equal(gudhi.cases.length,30);
 let intervals=0,thresholds=0;
 for(let i=0;i<golden.cases.length;i++){
  const c=golden.cases[i],g=gudhi.cases[i];assert.equal(c.id,g.id);
  for(let d=0;d<2;d++){
   const s=c.samples[d],ref=g.directions[d];assert.equal(s.direction,ref.direction);
   const actual=analyzeH0(c.values,c.nx,c.ny,{direction:s.direction,thresholds:s.thresholds.map(x=>x.level),maxBars:200});
   const bars=compareH0Bars(actual,ref.intervals);
   assert.equal(bars.status,'MATCH',c.id+' '+s.direction+' '+JSON.stringify(bars));
   assert.deepEqual(actual.thresholds.map(x=>x.components),ref.thresholdCounts,c.id+' '+s.direction);
   intervals+=bars.intervals;thresholds+=ref.thresholdCounts.length;
  }
 }
 assert.equal(intervals,1048);assert.equal(thresholds,480);
});
test('a corrupted third-party barcode must be reported DIFFERENT, not silently accepted',()=>{
 const c=golden.cases[0],r=gudhi.cases[0].directions[0],s=c.samples[0];
 const actual=analyzeH0(c.values,c.nx,c.ny,{direction:s.direction,maxBars:200});
 const manipulated=structuredClone(r.intervals);
 const target=manipulated.find(x=>x[1]!==null);assert.ok(target);
 target[0]+=0.5;
 assert.equal(compareH0Bars(actual,manipulated).status,'DIFFERENT');
});
