#!/usr/bin/env node
// Compact platform receipt for one exact checked-in G2 canary.
import {readFile,stat,writeFile} from 'node:fs/promises';
import {platform,arch} from 'node:os';
import {verifyNotebook,replaySnapshot} from '../src/notebook-core.js';
import {compareBuildProvenance} from '../src/repro-metadata.js';
import {getNodeBuildProvenance} from './node-provenance.mjs';
const path=process.argv[2]||'fixtures/g2/replay-canary.json';
if(process.argv.length>5||(process.argv.length>3&&(process.argv[3]!=='--out'||!process.argv[4]))){console.error('Usage: node scripts/canary-receipt.mjs [fixture] [--out receipt.json]');process.exit(2);}
try{
 const meta=await stat(path);if(meta.size>2_000_000)throw Error('oversized fixture');
 const doc=JSON.parse(await readFile(path,'utf8'));await verifyNotebook(doc);
 const local=await getNodeBuildProvenance();
 const compatible=compareBuildProvenance(doc.buildProvenance,local);
 if(compatible.status!=='COMPATIBLE')throw Error(compatible.status);
 const results=[];
 for(const s of doc.snapshots){
  const r=await replaySnapshot(s);if(r.status!=='MATCH')throw Error('DIFFERENT '+s.label);
  results.push({snapshotHash:s.snapshotHash,...r.actual});
 }
 const receipt={schema:'quasi-atlas.canary-receipt/1.0',runtime:platform()+'-'+arch(),nodeMajor:Number(process.versions.node.split('.')[0]),
  notebookHash:doc.notebookHash,mathSourceSha256:local.mathSourceSha256,lockSha256:local.lockSha256,
  buildCommit:local.gitCommit,results,status:'MATCH'};
 if(process.argv[3]==='--out')await writeFile(process.argv[4],JSON.stringify(receipt,null,2)+'\n',{mode:0o600});
 console.log('G2_CANARY_RECEIPT '+JSON.stringify(receipt));
}catch(err){console.error('G2_CANARY_FAILURE '+String(err?.message||err));process.exitCode=2;}
