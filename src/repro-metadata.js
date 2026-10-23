// Portable mathematical implementation provenance. Hashes are integrity hints,
// not code signing, author identity, independent algorithm verification or a proof.
import {ContractError} from './math/contract.js';
export const NOTEBOOK_PINNED_SCHEMA='quasi-atlas.notebook/1.1';
export const PROVENANCE_SCHEMA='quasi-atlas.build-provenance/1.0';
const reject=(msg)=>{throw new ContractError('INVALID_PROVENANCE',msg);};
export function cleanBuildProvenance(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||Object.getPrototypeOf(p)!==Object.prototype)reject('build provenance must be object');
 const keys=['schema','gitCommit','lockSha256','mathSourceSha256','packageVersion','engine'];
 if(Object.keys(p).some(k=>!keys.includes(k))||keys.some(k=>!(k in p)))reject('unexpected/missing build provenance field');
 if(p.schema!==PROVENANCE_SCHEMA||typeof p.packageVersion!=='string'||!/^[0-9]+\.[0-9]+\.[0-9]+(?:-[a-z0-9.-]+)?$/i.test(p.packageVersion)||
 typeof p.engine!=='string'||p.engine!=='g2-replay/1.0'||typeof p.gitCommit!=='string'||!(/^[a-f0-9]{40}$/.test(p.gitCommit)||p.gitCommit==='unavailable')||
 !(/^sha256:[a-f0-9]{64}$/.test(p.lockSha256))||!(/^sha256:[a-f0-9]{64}$/.test(p.mathSourceSha256)))reject('unrecognized build provenance values');
 return Object.fromEntries(keys.map(k=>[k,p[k]]));
}
export function compareBuildProvenance(saved,actual){
 const old=cleanBuildProvenance(saved),now=cleanBuildProvenance(actual);
 return {
  mathSourceMatch:old.mathSourceSha256===now.mathSourceSha256,
  dependencyLockMatch:old.lockSha256===now.lockSha256,
  gitCommitMatch:old.gitCommit===now.gitCommit,
  packageVersionMatch:old.packageVersion===now.packageVersion,
  status:old.mathSourceSha256!==now.mathSourceSha256?'MATH_SOURCE_MISMATCH':
    old.lockSha256!==now.lockSha256?'LOCKFILE_MISMATCH':'COMPATIBLE',
  notice:'Commit/version differences are recorded; only verified mathematical source and lockfile matches permit pinned replay.'
 };
}
export const browserBuildProvenance=typeof __QUASI_BUILD_PROVENANCE__==='undefined'?null:__QUASI_BUILD_PROVENANCE__;
