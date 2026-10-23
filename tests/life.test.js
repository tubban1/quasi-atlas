import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LIFE_LESSONS,getLifeLesson,scorePrediction,beatSamples,lifeReport} from '../src/life-content.js';
import {getPreset,evaluateField} from '../src/math/fields.js';
import {createModel} from '../src/math/contract.js';
test('G1 includes six distinct, clearly synthetic, age-accessible everyday questions',()=>{
 assert.equal(LIFE_LESSONS.length,6);
 assert.equal(new Set(LIFE_LESSONS.map(x=>x.id)).size,6);
 for(const l of LIFE_LESSONS){
  assert.ok(l.question&&l.insight&&l.counterexample&&l.modelNote&&l.researchPrompt);
  assert.equal(l.choices.length,3);
  assert.ok(l.modelNote.includes('合成')||l.modelNote.includes('教学')||l.modelNote.includes('模拟'));
  assert.ok(l.value>=l.min&&l.value<=l.max);
  assert.equal(scorePrediction(l.id,l.answer),true);
  assert.equal(scorePrediction(l.id,(l.answer+1)%3),false);
 }
});
test('education journey rejects invalid prediction indices',()=>{assert.equal(scorePrediction('wifi',999),null);assert.equal(scorePrediction('unknown',0),null);});
test('weather model has explicit synthetic Celsius units and finite field',()=>{
 const p=getPreset('temperature'),m=createModel({presetId:p.id,level:17});
 assert.equal(m.domain.units.f,'celsius-synthetic');
 for(const [x,y] of [[0,0],[5,6],[-12,8]])assert.ok(Number.isFinite(evaluateField(x,y,p)));
});
test('wifi is explicitly normalized synthetic field, not measured radio dBm',()=>{
 const p=getPreset('wifi'),m=createModel({presetId:p.id,level:1.15});
 assert.equal(m.domain.units.f,'normalized-synthetic');
 assert.equal(p.kind,'wifi');assert.ok(Number.isFinite(evaluateField(4,-5,p)));
});
test('beat signal implements sum and has expected beating frequency',()=>{
 const seq=beatSamples(2,9,4,700);
 for(const s of seq)assert.ok(Math.abs(s.sum-(s.a+s.b))<1e-10);
 const t=1/2;assert.ok(Math.abs(Math.cos(2*Math.PI*9*t)+Math.cos(2*Math.PI*11*t))>1.999);
 assert.throws(()=>beatSamples(-3));
});
test('1D beat lesson cannot silently masquerade as the 2D research field',()=>{
 const x=lifeReport({lessonId:'beats',value:1.4,prediction:0});
 assert.equal(x.lesson.kind,'signal-1d');assert.equal(x.lesson.model,null);
 assert.match(x.scientificStatus,/E0/);
});
test('all everyday learning reports disclose limits and evidence, no actual measurement',()=>{
 for(const l of LIFE_LESSONS){
  const x=lifeReport({lessonId:l.id,value:l.value,prediction:l.answer});
  assert.equal(x.predictionCorrect,true);
  assert.equal(x.lesson.source,'synthetic-teaching-model');
  assert.match(x.scientificStatus,/not observational/);
  assert.ok(x.modelLimits.length>15);
 }
});
