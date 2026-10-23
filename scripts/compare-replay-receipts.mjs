#!/usr/bin/env node
// Compare replay receipts from distinct OS/runtime environments; fail closed.
import {readFile} from 'node:fs/promises';
const args=process.argv.slice(2);
if(args.length!==2){console.error('Usage: node scripts/compare-replay-receipts.mjs <mac.json> <windows-or-linux.json>');process.exit(2);}
const invalid=msg=>{throw new Error(msg)};
try{
 const [a,b]=await Promise.all(args.map(async f=>JSON.parse(await readFile(f,'utf8'))));
 for(const [i,r] of [a,b].entries()){
  if(r.schema!=='quasi-atlas.replay-report/1.1'||r.status!=='MATCH'||!r.source?.local?.mathSourceSha256||
   !r.runtime?.platform||!r.runtime?.arch||!Array.isArray(r.results)||!r.results.length||
   r.results.some(x=>x.status!=='MATCH'))invalid('Invalid or failed receipt '+(i+1));
  if(r.source.compatibility.status!=='COMPATIBLE')invalid('Replay not provenance-compatible: '+r.source.compatibility.status);
 }
 const envA=a.runtime.platform+'-'+a.runtime.arch,envB=b.runtime.platform+'-'+b.runtime.arch;
 if(envA===envB)invalid('Two different OS/architecture execution environments are required; same machine/process is insufficient');
 if(a.notebookHash!==b.notebookHash)invalid('Different input notebook hashes');
 if(a.source.local.mathSourceSha256!==b.source.local.mathSourceSha256||
    a.source.local.lockSha256!==b.source.local.lockSha256)invalid('Different runtime source/lock fingerprints');
 if(a.results.length!==b.results.length)invalid('Different number of snapshots');
 for(let i=0;i<a.results.length;i++){
  const x=a.results[i],y=b.results[i];
  if(x.snapshotHash!==y.snapshotHash)invalid('Different snapshot '+i);
  for(const key of ['components','closed','boundary']){
   if(x.actual[key]!==y.actual[key])invalid('Different topology '+key+' at '+i);
  }
  const allowed=Math.max(x.tolerance.lengthAbsolute+y.tolerance.lengthAbsolute,
   x.tolerance.lengthRelative*Math.max(Math.abs(x.actual.totalLength),Math.abs(y.actual.totalLength)));
  if(Math.abs(x.actual.totalLength-y.actual.totalLength)>allowed)invalid('Cross-runtime length difference '+i);
 }
 console.log(JSON.stringify({status:'CROSS_RUNTIME_MATCH',notebookHash:a.notebookHash,sourceSha256:a.source.local.mathSourceSha256,
  environments:[envA,envB],snapshots:a.results.length,note:'Two distinct execution environments; not mathematical certification.'},null,2));
}catch(err){console.error(JSON.stringify({status:'CROSS_RUNTIME_NOT_VERIFIED',error:String(err?.message||err)}));process.exitCode=2;}
