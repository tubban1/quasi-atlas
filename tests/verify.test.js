import {test} from 'node:test';
import assert from 'node:assert/strict';
import {verifyLevel,compareResolutions,locateCriticalPoints,VERIFICATION_VERSION} from '../src/math/verify.js';
import {getPreset} from '../src/math/fields.js';
const dummy=getPreset('saddle');
const bounds={x0:-4,y0:-4,x1:4,y1:4};
test('local minimum of a smooth quadratic is found by Newton refinement',()=>{
 const result=locateCriticalPoints({preset:dummy,phase:0,bounds,steps:24,evaluator:(x,y)=>x*x+y*y});
 assert.ok(result.points.some(p=>p.type==='minimum'&&Math.hypot(p.x,p.y)<1e-3),JSON.stringify(result.points));
});
test('saddle of a smooth quadratic is located and classified',()=>{
 const result=locateCriticalPoints({preset:dummy,phase:0,bounds,steps:24,evaluator:(x,y)=>x*x-y*y});
 assert.ok(result.points.some(p=>p.type==='saddle'&&Math.hypot(p.x,p.y)<1e-3),JSON.stringify(result.points));
});
test('quadratic local maximum is classified',()=>{
 const result=locateCriticalPoints({preset:dummy,phase:0,bounds,steps:24,evaluator:(x,y)=>-x*x-y*y});
 assert.ok(result.points.some(p=>p.type==='maximum'&&Math.hypot(p.x,p.y)<1e-3));
});
test('grid verification includes levels and metadata and does not claim proof',()=>{
 const result=verifyLevel({preset:dummy,phase:0,level:1,bounds,aspect:1,resolutions:[64,100,160],offset:.05,evaluator:(x,y)=>x*x+y*y});
 assert.equal(result.version,VERIFICATION_VERSION);
 assert.equal(result.checks.length,3);
 assert.equal(result.checks[1].rows.length,3);
 assert.ok(result.limits.some(x=>x.includes('not proof')));
 assert.equal(result.checks[1].rows[2].closed,1);
});
test('large length drift or topology change is not stable',()=>{
 assert.equal(compareResolutions([{closed:1,boundary:0,length:10},{closed:2,boundary:0,length:10}]).flag,'needs-refinement');
 assert.equal(compareResolutions([{closed:1,boundary:0,length:10},{closed:1,boundary:0,length:12}]).flag,'needs-refinement');
 assert.equal(compareResolutions([{closed:1,boundary:0,length:10},{closed:1,boundary:0,length:10.12}]).flag,'consistent');
});
