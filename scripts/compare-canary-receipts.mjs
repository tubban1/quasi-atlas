#!/usr/bin/env node
// Compare signed-by-context (not cryptographically signed) receipts from two actual runtimes.
import {readFile} from 'node:fs/promises';
if(process.argv.length!==4){console.error('Usage: node scripts/compare-canary-receipts.mjs mac.json linux-or-windows.json');process.exit(2);}
try{
 const [a,b]=await Promise.all(process.argv.slice(2).map(async f=>JSON.parse(await readFile(f,'utf8'))));
 const bad=(why)=>{throw Error(why);};
 for(const x of [a,b]){
  if(x.schema!=='quasi-atlas.canary-receipt/1.0'||x.status!=='MATCH'||!Array.isArray(x.results)||!x.results.length||!/^sha256:[a-f0-9]{64}$/.test(x.mathSourceSha256)||!/^sha256:[a-f0-9]{64}$/.test(x.lockSha256)||!Number.isInteger(x.nodeMajor))bad('Invalid canary receipt');
 }
 if(a.runtime===b.runtime)bad('Distinct OS-architecture runtime required; two local Mac processes do not count');
 if(a.nodeMajor<22||b.nodeMajor<22)bad('Node 22+ required for this comparison');
 for(const key of ['notebookHash','mathSourceSha256','lockSha256'])if(a[key]!==b[key])bad('Incompatible '+key);
 if(a.results.length!==b.results.length)bad('Canary count differs');
 const maxLengthDeltas=[];
 for(let i=0;i<a.results.length;i++){
  const x=a.results[i],y=b.results[i];
  for(const key of ['snapshotHash','components','closed','boundary'])if(x[key]!==y[key])bad('Different '+key+' on sample '+i);
  const delta=Math.abs(x.totalLength-y.totalLength),allowed=1e-5+1e-5*Math.max(Math.abs(x.totalLength),Math.abs(y.totalLength));
  if(!Number.isFinite(delta)||delta>allowed)bad('Length mismatch on sample '+i);
  maxLengthDeltas.push(delta);
 }
 console.log(JSON.stringify({schema:'quasi-atlas.cross-runtime-acceptance/1.0',status:'MATCH',runtimes:[a.runtime,b.runtime],
  notebookHash:a.notebookHash,mathSourceSha256:a.mathSourceSha256,lockSha256:a.lockSha256,
  snapshots:a.results.length,lengthDeltas:maxLengthDeltas,
  limitations:'Actual runtime receipts, not cryptographically authenticated or independent mathematical verification.'},null,2));
}catch(err){console.error(JSON.stringify({status:'CROSS_RUNTIME_UNVERIFIED',reason:String(err?.message||err)}));process.exitCode=2;}
