#!/usr/bin/env node
// G5 constrained headless replay: no cloud or user data; fail closed on tampering.
import {readFile,writeFile,mkdir}from'node:fs/promises';
import {createHash}from'node:crypto';import {dirname,resolve}from'node:path';
import {makeQuasiSweep,G5_SWEEP_SCHEMA}from'../src/math/quasi-sweep.js';
const stable=x=>JSON.stringify(x);
const sha=x=>'sha256:'+createHash('sha256').update(stable(x)).digest('hex');
const path=resolve(process.argv[3]||'fixtures/g5/quasi-sweep.json'),mode=process.argv[2]||'verify';
try{
 if(!['generate','verify'].includes(mode)||process.argv.length>4)throw Error('Usage: node scripts/g5_sweep.mjs generate|verify [file]');
 const calculated=makeQuasiSweep(),manifest={...calculated,contentHash:sha(calculated)};
 if(mode==='generate'){await mkdir(dirname(path),{recursive:true});await writeFile(path,JSON.stringify(manifest,null,2)+'\n');}
 else{
  const b=await readFile(path);if(b.length>700000)throw Error('File too large');
  const doc=JSON.parse(b.toString('utf8'));if(doc.schema!==G5_SWEEP_SCHEMA||doc.cases?.length!==36)throw Error('INVALID_SWEEP');
  const {contentHash,...unhashed}=doc;if(contentHash!==sha(unhashed))throw Error('HASH_MISMATCH');
  if(stable(doc)!==stable(manifest))throw Error('REPLAY_DIFFERENT');
 }
 console.log(JSON.stringify({status:mode==='generate'?'GENERATED':'MATCH',cases:manifest.cases.length,
  modelHash:manifest.contentHash,phaseCount:4,radiusCount:3,levelCount:3,certified:false}));
}catch(e){console.error(JSON.stringify({status:'INVALID',message:e.message}));process.exitCode=2;}
