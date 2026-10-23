#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import {stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {verifyNotebook,replaySnapshot,MAX_FILE_BYTES} from '../src/notebook-core.js';

const filename=process.argv[2];
if(!filename||process.argv.length>3){console.error('Usage: node scripts/replay-notebook.mjs <notebook.json>');process.exit(2);}
try{
 const path=resolve(filename);
 const info=await stat(path);if(!info.isFile()||info.size>MAX_FILE_BYTES)throw Object.assign(new Error('File exceeds supported bundle size'),{code:'RESOURCE_LIMIT'});
 const raw=await readFile(path,'utf8');
 if(Buffer.byteLength(raw,'utf8')>MAX_FILE_BYTES)throw Object.assign(new Error('File exceeds size limit'),{code:'RESOURCE_LIMIT'});
 const doc=JSON.parse(raw);
 await verifyNotebook(doc);
 const report={schema:'quasi-atlas.replay-report/1.0',input:filename,notebookHash:doc.notebookHash,engine:doc.engine,results:[],status:'MATCH',limitations:'Same preset engine only; finite-domain grid replay, NOT mathematical certification or independent verification.'};
 for(const s of doc.snapshots){
  const result=await replaySnapshot(s);
  report.results.push({label:s.label,snapshotHash:s.snapshotHash,status:result.status,delta:result.delta,expected:result.expected,actual:result.actual,tolerance:result.tolerance});
  if(result.status!=='MATCH')report.status='DIFFERENT';
 }
 console.log(JSON.stringify(report,null,2));process.exitCode=report.status==='MATCH'?0:1;
}catch(err){
 console.error(JSON.stringify({status:'INVALID',code:err?.code||'IMPORT_ERROR',message:String(err?.message||err)},null,2));
 process.exitCode=2;
}
