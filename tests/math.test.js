import {test} from 'node:test';import assert from 'node:assert/strict';
import {PRESETS,evaluateField} from '../src/math/fields.js';import {extractContours,buildSpectrum} from '../src/math/contours.js';
function grid(nx,ny,f){const a=new Float32Array((nx+1)*(ny+1));for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)a[j*(nx+1)+i]=f(i,j);return a;}
test('all five domains evaluate to finite scalar fields',()=>{for(const p of PRESETS){for(const x of [-10,0,2.3,100])assert.ok(Number.isFinite(evaluateField(x,3.141,p,.5)),p.id);}});
test('linear level set crosses finite viewport; is not classified as globally open',()=>{
 const nx=20,ny=20,a=grid(nx,ny,(i)=>i-10.3);const r=extractContours(a,nx,ny,0);
 assert.equal(r.stats.components,1);assert.equal(r.stats.closed,0);assert.equal(r.stats.boundary,1);
 assert.ok(Math.abs(r.stats.totalLength-ny)<.001);
});
test('interior circular level set is closed',()=>{
 const nx=64,ny=64,a=grid(nx,ny,(i,j)=>(i-32)**2+(j-32)**2);const r=extractContours(a,nx,ny,81);
 assert.equal(r.stats.closed,1);assert.equal(r.stats.boundary,0);
 assert.ok(r.stats.totalLength>50&&r.stats.totalLength<61);
});
test('empty contours are valid',()=>{const v=grid(20,20,()=>1);assert.equal(extractContours(v,20,20,2).stats.components,0);});
test('saddle ambiguities resolve deterministically',()=>{
 const a=grid(20,20,(i,j)=>(i-10)*(j-10)+.003*i);
 const A=extractContours(a,20,20,0.1),B=extractContours(a,20,20,0.1);
 assert.deepEqual(A.stats,B.stats);assert.deepEqual(A.paths,B.paths);
});
test('topology spectrum is bounded and has a numeric audit trail',()=>{const a=grid(40,40,(i,j)=>(i-20)**2+(j-20)**2);const s=buildSpectrum(a,40,40,0,650,1,1,0,0,21);assert.equal(s.data.length,21);assert.ok(s.events.length>=1);});
