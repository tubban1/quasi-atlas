#!/usr/bin/env node
// Generate a fixed cross-environment research sample from audited mathematics.
// Regenerate intentionally only when numerical source/lockfile has changed.
import {mkdir,writeFile} from 'node:fs/promises';
import {getNodeBuildProvenance} from './node-provenance.mjs';
import {createModel,createExperiment} from '../src/math/contract.js';
import {recomputeModel,createSnapshot,createNotebook} from '../src/notebook-core.js';
const samples=[
 {id:'archipelago',level:.55,phase:.16,bounds:{xmin:-17,xmax:17,ymin:-12,ymax:12}},
 {id:'saddle',level:.04,phase:.2,bounds:{xmin:-13,xmax:13,ymin:-10,ymax:10}},
 {id:'quasi',level:.5,phase:.11,bounds:{xmin:-16,xmax:16,ymin:-11,ymax:11}}
];
const shots=[];
for(const spec of samples){
 const model=createModel({presetId:spec.id,phase:spec.phase,level:spec.level,bounds:spec.bounds,resolution:[88,66]});
 const actual=recomputeModel(model);
 const sci=await createExperiment({model,observations:actual.stats,algorithm:actual.algorithm,notes:'G2 cross-environment canary'});
 const view={id:spec.id,level:spec.level,phase:spec.phase,scale:(spec.bounds.xmax-spec.bounds.xmin)/2,
  panX:0,panY:0,resolution:280,mode:'research',view:'terrain',theme:0};
 shots.push(await createSnapshot({view,scientific:sci,label:'Cross-env '+spec.id,
  notes:{question:'Can a second runtime reproduce the same finite-grid contour statistics?',
   hypothesis:'Integer counts identical, length within declared tolerance.',
   observation:'Fixture computed by audited same-engine implementation.',
   counterexample:'A changed source file or dependencies must mark the environment incompatible.',
   conclusion:'Not independently validated mathematics.'}}));
}
const provenance=await getNodeBuildProvenance();
const notebook=await createNotebook({title:'G2 portable cross-runtime canary',snapshots:shots,buildProvenance:provenance});
await mkdir('fixtures/g2',{recursive:true});
await writeFile('fixtures/g2/replay-canary.json',JSON.stringify(notebook,null,2)+'\n');
console.log(JSON.stringify({schema:notebook.schema,notebookHash:notebook.notebookHash,mathSha:provenance.mathSourceSha256,lockSha:provenance.lockSha256,snapshots:shots.length}));
