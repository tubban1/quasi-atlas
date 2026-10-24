import {test}from'node:test';import assert from'node:assert/strict';
import {makeRadialCertificate}from '../src/math/radial-certificate.js';
import {verifyRadialCertificate,cmp}from '../src/math/radial-verifier.js';
test('restricted G4 exact rational radial checker emits checked/unknown/excluded faithfully',()=>{
 const base={a:'1/3',b:'-2/5',xmin:'0',xmax:'2',ymin:'-1',ymax:'1'};
 assert.equal(verifyRadialCertificate(makeRadialCertificate(base)).status,'CHECKED_INTERIOR');
 assert.equal(verifyRadialCertificate(makeRadialCertificate({...base,xmin:'1/3'})).status,'UNKNOWN_BOUNDARY');
 assert.equal(verifyRadialCertificate(makeRadialCertificate({...base,xmin:'1',xmax:'2'})).status,'EXCLUDED_INTERIOR');
 assert.equal(cmp('1/3','2/6'),0);
});
test('tampered model, false status, oversized rational and forged E3 fail closed',()=>{
 const c=makeRadialCertificate({a:'1',b:'0',xmin:'0',xmax:'2',ymin:'-1',ymax:'1'});
 for(const modify of [
 x=>x.claim.status='EXCLUDED_INTERIOR',
 x=>x.claim.certified=true,
 x=>x.evidence='E3',
 x=>x.model.a='NaN',
 x=>x.model.injected='1',
 x=>x.bounds.xmax='0',
 x=>x.claim.proof=true,
 x=>x.model.b='99999999999999'
 ]){
  const t=structuredClone(c);modify(t);assert.throws(()=>verifyRadialCertificate(t));
 }
});
test('critical point for positive radial quadratic remains unique in entire plane but certificate scope only open rectangle',()=>{
 const cert=makeRadialCertificate({a:'-3/7',b:'4/9',xmin:'-1',xmax:'1',ymin:'0',ymax:'1'});
 const r=verifyRadialCertificate(JSON.parse(JSON.stringify(cert)));
 assert.deepEqual(r.uniqueGlobalCriticalPoint,['-3/7','4/9']);
 assert.equal(r.externalMathReview,false);
 assert.equal(r.certified,false);
});
