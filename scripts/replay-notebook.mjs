#!/usr/bin/env node
// Offline reproduction. Exit: 0=MATCH, 1=DIFFERENT, 2=INVALID, 3=ENVIRONMENT_MISMATCH.
import {readFile,stat,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {platform,arch} from 'node:os';
import {verifyNotebook,replaySnapshot,MAX_FILE_BYTES} from '../src/notebook-core.js';
import {NOTEBOOK_PINNED_SCHEMA,compareBuildProvenance} from '../src/repro-metadata.js';
import {getNodeBuildProvenance} from './node-provenance.mjs';

const file=process.argv[2],receiptIndex=process.argv.indexOf('--receipt');
if(!file||process.argv.length>5||(receiptIndex===-1&&process.argv.length!==3)||(receiptIndex!==-1&&(receiptIndex!==3||!process.argv[4]))){
 console.error('Usage: node scripts/replay-notebook.mjs <notebook.json> [--receipt <receipt.json>]');
 process.exit(2);
}
try{
 const filename=resolve(file),info=await stat(filename);
 if(!info.isFile()||info.size>MAX_FILE_BYTES)throw Object.assign(new Error('Bundle size limit exceeded'),{code:'RESOURCE_LIMIT'});
 const raw=await readFile(filename,'utf8');
 if(Buffer.byteLength(raw,'utf8')>MAX_FILE_BYTES)throw Object.assign(new Error('Bundle size limit exceeded'),{code:'RESOURCE_LIMIT'});
 const doc=JSON.parse(raw);await verifyNotebook(doc);
 const local=await getNodeBuildProvenance();
 const pinned=doc.schema===NOTEBOOK_PINNED_SCHEMA;
 const compatibility=pinned?compareBuildProvenance(doc.buildProvenance,local):
  {status:'LEGACY_UNPINNED',mathSourceMatch:null,dependencyLockMatch:null,gitCommitMatch:null,
  notice:'Legacy 1.0 has no mathematical source fingerprint. Recalculation can be shown but cannot establish its original build.'};
 const report={schema:'quasi-atlas.replay-report/1.1',
  notebookHash:doc.notebookHash,notebookSchema:doc.schema,engine:doc.engine,
  runtime:{platform:platform(),arch:arch(),node:process.versions.node},
  source:{saved:pinned?doc.buildProvenance:null,local,compatibility},
  results:[],status:'MATCH',limitations:'Same math engine; finite-domain grid only. Never implies independent verification or mathematical proof.'};
 if(compatibility.status==='MATH_SOURCE_MISMATCH'||compatibility.status==='LOCKFILE_MISMATCH'){
  report.status='ENVIRONMENT_MISMATCH';
 }else{
  for(const snapshot of doc.snapshots){
   const x=await replaySnapshot(snapshot);
   report.results.push({label:snapshot.label,snapshotHash:snapshot.snapshotHash,status:x.status,
    delta:x.delta,expected:x.expected,actual:x.actual,tolerance:x.tolerance});
   if(x.status!=='MATCH')report.status='DIFFERENT';
  }
 }
 if(receiptIndex!==-1)await writeFile(resolve(process.argv[4]),JSON.stringify(report,null,2)+'\n',{flag:'w',mode:0o600});
 console.log(JSON.stringify(report,null,2));
 process.exitCode=report.status==='MATCH'?0:report.status==='DIFFERENT'?1:3;
}catch(err){
 console.error(JSON.stringify({status:'INVALID',code:err?.code||'IMPORT_ERROR',message:String(err?.message||err)},null,2));
 process.exitCode=2;
}
