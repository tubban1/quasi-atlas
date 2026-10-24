#!/usr/bin/env node
// Separate beta shipping from high-stakes "research-ready" certification.
// This is intentionally a hard fail until external approvals are recorded AND reviewed.
import{readFileSync}from'node:fs';
const s=JSON.parse(readFileSync(new URL('../fixtures/g6/research-release-status.json',import.meta.url),'utf8'));
export function evaluateReadiness(s){
 const blockers=[];
 if(s.schema!=='quasi-atlas.research-release-gates/1.0')blockers.push('INVALID_GATE_SCHEMA');
 for(const name of ['G3','G4','G5','G6']){
  const g=s.gates?.[name];
  if(!g||g.scientific!=='PASS'||g.open?.length||g.engineering!=='COMPLETE')blockers.push(name+'_NOT_CLEARED');
 }
 for(const name of ['educator1','educator2','mathematics']){
  const v=s.externalApprovals?.[name];
  if(!v||v.status!=='APPROVED'||typeof v.evidenceRef!=='string'||!/^https:\/\//.test(v.evidenceRef)||typeof v.approvedAt!=='string')blockers.push(name.toUpperCase()+'_UNVERIFIED');
 }
 if(s.researchReady!==true||s.publicLaunchApproved!==true)blockers.push('RESEARCH_OR_PUBLIC_APPROVAL_FALSE');
 return {status:blockers.length?'BLOCKED':'READY_FOR_MANUAL_REVIEW',blockers};
}
const out=evaluateReadiness(s);console.log(JSON.stringify(out,null,2));
if(process.argv.includes('--enforce-research-ready')&&out.blockers.length)process.exitCode=3;
