import{test}from'node:test';import assert from'node:assert/strict';
import{spawnSync}from'node:child_process';import{readFileSync}from'node:fs';
test('research-ready claim remains BLOCKED without external independent reviews',()=>{
 const p=spawnSync(process.execPath,['scripts/research-release-gate.mjs','--enforce-research-ready'],{encoding:'utf8',timeout:12000});
 assert.equal(p.status,3,p.stderr);const result=JSON.parse(p.stdout);
 assert.equal(result.status,'BLOCKED');
 for(const id of ['G3_NOT_CLEARED','G4_NOT_CLEARED','G5_NOT_CLEARED','G6_NOT_CLEARED','MATHEMATICS_UNVERIFIED'])
  assert.ok(result.blockers.includes(id));
});
test('research release gate reports blockers without breaking engineering beta deploy',()=>{
 const p=spawnSync(process.execPath,['scripts/research-release-gate.mjs'],{encoding:'utf8',timeout:12000});
 assert.equal(p.status,0,p.stderr);assert.equal(JSON.parse(p.stdout).status,'BLOCKED');
});
test('research gate does not treat empty approval or unverified links as evidence',()=>{
 const status=JSON.parse(readFileSync('docs/research-release-status.json','utf8'));
 for(const x of Object.values(status.externalApprovals))assert.equal(x,null);
 assert.equal(status.releaseTier,'engineering-beta');
 assert.equal(status.publicLaunchApproved,false);
});
