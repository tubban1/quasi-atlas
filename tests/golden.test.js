import {test} from 'node:test';
import assert from 'node:assert/strict';
import {extractContours} from '../src/math/contours.js';
import {locateCriticalPoints} from '../src/math/verify.js';
// Golden fixtures: known analytic topology inside a stated finite rectangular domain.
// A coarse plot or out-of-domain inference never counts as truth for these fixtures.
function grid(fn,bounds,n=128){
 const [a,c,b,d]=bounds,dx=(b-a)/n,dy=(d-c)/n;
 const values=new Float32Array((n+1)*(n+1));
 for(let j=0;j<=n;j++)for(let i=0;i<=n;i++)values[j*(n+1)+i]=fn(a+i*dx,c+j*dy);
 return {values,n,dx,dy,x0:a,y0:c};
}
function measure(x){
 const {values,n,dx,dy,x0,y0}=grid(x.fn,x.bounds,x.n||128);
 return extractContours(values,n,n,x.level,dx,dy,x0,y0).stats;
}
const G=[
 {id:'B01-line-x',fn:(x,y)=>x-.317,level:0,bounds:[-5,-5,5,5],closed:0,boundary:1},
 {id:'B02-line-y',fn:(x,y)=>y+.217,level:0,bounds:[-5,-5,5,5],closed:0,boundary:1},
 {id:'B03-circle',fn:(x,y)=>x*x+y*y,level:7.1,bounds:[-5,-5,5,5],closed:1,boundary:0},
 {id:'B04-circle-empty',fn:(x,y)=>x*x+y*y,level:-.11,bounds:[-5,-5,5,5],closed:0,boundary:0},
 {id:'B05-ellipse',fn:(x,y)=>x*x/4+y*y,level:5.1,bounds:[-7,-7,7,7],closed:1,boundary:0},
 {id:'B06-negative-hill',fn:(x,y)=>-x*x-y*y,level:-6.11,bounds:[-5,-5,5,5],closed:1,boundary:0},
 {id:'B07-saddle-positive',fn:(x,y)=>x*x-y*y,level:1.7,bounds:[-5,-5,5,5],closed:0,boundary:2},
 {id:'B08-saddle-negative',fn:(x,y)=>x*x-y*y,level:-1.7,bounds:[-5,-5,5,5],closed:0,boundary:2},
 {id:'B09-two-peaks',fn:(x,y)=>Math.exp(-((x+3.5)**2+y*y)/3)+Math.exp(-((x-3.5)**2+y*y)/3),level:.5,bounds:[-8,-7,8,7],closed:2,boundary:0},
 {id:'B10-two-peaks-merge',fn:(x,y)=>Math.exp(-((x+3.5)**2+y*y)/3)+Math.exp(-((x-3.5)**2+y*y)/3),level:.005,bounds:[-8,-7,8,7],closed:1,boundary:0},
 {id:'B11-sinusoid-stripes',fn:(x,y)=>Math.sin(x),level:.2,bounds:[-4,-4,4,4],closed:0,boundary:3},
 {id:'B12-tilted-plane',fn:(x,y)=>x+.7*y+.173,level:0,bounds:[-5,-5,5,5],closed:0,boundary:1}
];
for(const spec of G)test('golden '+spec.id,()=>{
 const stats=measure(spec);
 assert.equal(stats.closed,spec.closed,'closed component count');
 assert.equal(stats.boundary,spec.boundary,'viewport boundary component count');
 assert.equal(stats.components,spec.closed+spec.boundary);
});
const p={id:'golden'};
for(const [id,fn,typ] of [
 ['min', (x,y)=>(x-.4)**2+(y+.25)**2,'minimum'],
 ['max', (x,y)=>-((x-.4)**2)-((y+.25)**2),'maximum'],
 ['saddle',(x,y)=>(x-.4)**2-(y+.25)**2,'saddle']
]){
 test('critical-'+id,()=>{
  const r=locateCriticalPoints({preset:p,phase:0,bounds:{x0:-3,y0:-3,x1:3,y1:3},steps:36,evaluator:fn});
  assert.ok(r.points.some(q=>q.type===typ&&Math.hypot(q.x-.4,q.y+.25)<1e-3),'analytic '+typ+' should be located');
 });
}
test('B13 degenerate constant field is not a valid 1D level-set guarantee',()=>{
 const same=(x,y)=>1, g=grid(same,[-5,-5,5,5]);
 const r=extractContours(g.values,g.n,g.n,1,g.dx,g.dy,g.x0,g.y0);
 // Contour extraction produces no polyline because the true equality set fills an area.
 // This MUST NOT be described as the mathematical level set being empty.
 assert.equal(r.stats.components,0);
 assert.equal(g.values.every(v=>v===1),true);
});
