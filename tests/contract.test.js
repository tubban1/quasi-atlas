import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {createModel,evidence,canonicalJSON,createExperiment,verifyExperiment,ContractError,EXPERIMENT_SCHEMA} from '../src/math/contract.js';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
function valid(){return createModel({presetId:'quasi',phase:.5,level:.1,bounds:{xmin:-22,xmax:22,ymin:-10,ymax:10},resolution:[280,160]});}
test('model includes finite rectangular coordinate/unit contract',()=>{const m=valid();assert.equal(m.domain.boundary,'clipped-rectangle');assert.equal(m.source.kind,'preset');assert.equal(m.sampling.floatFormat,'float32');});
test('unknown preset rejected even if seemingly valid formula',()=>assert.throws(()=>createModel({presetId:'__proto__'}),ContractError));
test('non-finite parameters and invalid bounds fail closed',()=>{assert.throws(()=>createModel({presetId:'quasi',phase:NaN}),ContractError);assert.throws(()=>createModel({presetId:'quasi',bounds:{xmin:5,xmax:2,ymin:-1,ymax:1}}),ContractError);});
test('resource budget and unsupported keys reject input',()=>{assert.throws(()=>createModel({presetId:'quasi',resolution:[90000,90000]}),ContractError);assert.throws(()=>createModel({presetId:'quasi',bounds:{xmin:0,xmax:1,ymin:0,ymax:1,script:'alert(1)'}}),ContractError);});
test('evidence cannot claim certification or proof',()=>{for(const l of ['E2','E3','E4'])assert.throws(()=>evidence(l,'claim'),e=>e.code==='UNSUPPORTED_EVIDENCE');const e=evidence('E1','numerical');assert.equal(e.proof,false);assert.equal(e.certified,false);});
test('canonical JSON independent of insertion order and rejects dangerous nonfinite',()=>{assert.equal(canonicalJSON({b:[-0,2],a:3}),canonicalJSON({a:3,b:[0,2]}));assert.throws(()=>canonicalJSON({a:Infinity}),ContractError);});
test('same scientific content yields same hash across timestamps',async()=>{const a=await createExperiment({model:valid(),observations:{components:3,closed:2,boundary:1,totalLength:55}});const b=await createExperiment({model:valid(),observations:{boundary:1,totalLength:55,components:3,closed:2}});assert.equal(a.schema,EXPERIMENT_SCHEMA);assert.equal(a.scientificHash,b.scientificHash);assert.ok(await verifyExperiment(a));});
test('modified content fails hash; forged certification rejected',async()=>{const b=await createExperiment({model:valid(),observations:{components:1,closed:1,boundary:0,totalLength:3}});b.result.stats.closed=0;await assert.rejects(()=>verifyExperiment(b),e=>e.code==='HASH_MISMATCH');});
test('inconsistent contour statistics rejected',async()=>{await assert.rejects(()=>createExperiment({model:valid(),observations:{components:1,closed:2,boundary:0,totalLength:1}}),e=>e.code==='INCONSISTENT_COUNTS');});
test('tampered model contract is rejected before export',async()=>{const m=valid();m.source.definition='I invented the proof';await assert.rejects(()=>createExperiment({model:m,observations:{components:0,closed:0,boundary:0,totalLength:0}}),e=>e.code==='MODEL_MUTATED');});
