import{test}from'node:test';import assert from'node:assert/strict';
import{TRANSFER_ITEMS,scoreTransfer}from'../src/education/transfer-evaluation.js';
test('G6 six open-access transfer items score locally without identifiers',()=>{
 assert.equal(TRANSFER_ITEMS.length,6);
 const good=scoreTransfer(TRANSFER_ITEMS.map(x=>x.correct));
 assert.equal(good.score,6);assert.equal(good.percent,100);
 assert.equal(good.respondentIdentity,null);assert.equal(good.privacy,'local-only');
 assert.equal(good.credentialed,false);
});
test('G6 scoring rejects malformed answers and PII-shaped objects',()=>{
 assert.throws(()=>scoreTransfer([1,2]),/six/);
 assert.throws(()=>scoreTransfer(Array(6).fill({email:'x@y.ch'})),/six/);
 assert.throws(()=>scoreTransfer(Array(6).fill(Infinity)),/six/);
});
test('G6 evidence of session success cannot be used as teacher/study approval',()=>{
 const result=scoreTransfer([0,0,0,0,1,1]);
 assert.equal(result.total,6);assert.equal(result.privacy,'local-only');
 assert.ok(!('externalReviewerApproval' in result));
});
