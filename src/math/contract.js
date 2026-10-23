// G0/1: Model, finite-domain and evidence contract. Browser/Node compatible.
// Never parses/executess user-entered JS. Evidence upgrades beyond E1 are fail-closed.
import {getPreset,PRESETS} from './fields.js';
export const EXPERIMENT_SCHEMA='quasi-atlas.experiment/1.0';
export const MODEL_SCHEMA='quasi-atlas.model/1.0';
export const EVIDENCE_LEVELS=Object.freeze(['E0','E1','E2','E3','E4']);
export class ContractError extends Error { constructor(code,message){super(message);this.name='ContractError';this.code=code;} }
const bad=(code,message)=>{throw new ContractError(code,message)};
function number(v,label,min,max){
  if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)bad('INVALID_NUMBER',label+' must be finite and in ['+min+','+max+']');
  return Object.is(v,-0)?0:v;
}
function text(v,label,max=300){if(typeof v!=='string'||v.length>max||!v.length)bad('INVALID_TEXT',label+' invalid');return v;}
function noExtras(o,keys,name){
 if(!o||typeof o!=='object'||Array.isArray(o)||Object.getPrototypeOf(o)!==Object.prototype)bad('INVALID_OBJECT',name+' must be a plain object');
 const unknown=Object.keys(o).filter(k=>!keys.includes(k));if(unknown.length)bad('UNKNOWN_FIELD',name+': '+unknown.join(','));
}
export function createModel({presetId,phase=0,level=0,bounds={xmin:-22,xmax:22,ymin:-15,ymax:15},resolution=[280,180]}={}){
 if(!PRESETS.some(p=>p.id===presetId))bad('UNKNOWN_PRESET','Only audited preset IDs are supported in G0');
 const p=getPreset(presetId);
 noExtras(bounds,['xmin','xmax','ymin','ymax'],'bounds');
 const domain={xmin:number(bounds.xmin,'xmin',-1e5,1e5),xmax:number(bounds.xmax,'xmax',-1e5,1e5),ymin:number(bounds.ymin,'ymin',-1e5,1e5),ymax:number(bounds.ymax,'ymax',-1e5,1e5)};
 if(domain.xmin>=domain.xmax||domain.ymin>=domain.ymax)bad('INVALID_DOMAIN','min must be smaller than max');
 if(!Array.isArray(resolution)||resolution.length!==2)bad('INVALID_RESOLUTION','resolution must be [nx,ny]');
 const nx=number(resolution[0],'nx',16,2048),ny=number(resolution[1],'ny',16,2048);
 if(!Number.isInteger(nx)||!Number.isInteger(ny)||nx*ny>2_097_152)bad('RESOURCE_LIMIT','sampling budget exceeded');
 return {schema:MODEL_SCHEMA,id:presetId,source:{kind:'preset',id:presetId,definition:p.formula,implementation:'fields.js/0.2'},parameters:{phase:number(phase,'phase',-Math.PI,Math.PI),level:number(level,'level',p.min,p.max)},domain:{...domain,coordinateFrame:'cartesian',boundary:'clipped-rectangle',units:{x:'dimensionless',y:'dimensionless',f:p.id==='temperature'?'celsius-synthetic':p.id==='wifi'?'normalized-synthetic':'dimensionless'}},sampling:{nx,ny,floatFormat:'float32',interpolation:'bilinear'}};
}
export function evidence(level,claim,options={}){
 if(!EVIDENCE_LEVELS.includes(level))bad('INVALID_EVIDENCE','unknown evidence level');
 if(level==='E2'||level==='E3'||level==='E4')bad('UNSUPPORTED_EVIDENCE','G0 does not implement independent certification or proof');
 text(claim,'claim',2000);
 noExtras(options,['warnings'],'evidenceOptions');
 if(options.warnings!==undefined&&(!Array.isArray(options.warnings)||options.warnings.some(x=>typeof x!=='string'||x.length>500)))bad('INVALID_WARNINGS','warnings must be short strings');
 return {level,claim,scope:'finite-domain',status:level==='E1'?'numerical-observation':'illustrative',warnings:options.warnings??[],certified:false,proof:false};
}
function normalize(value,depth=0){
 if(depth>32)bad('DEPTH_LIMIT','too deeply nested');
 if(value===null||typeof value==='boolean'||typeof value==='string')return value;
 if(typeof value==='number'){if(!Number.isFinite(value))bad('NONFINITE','non finite number');return Object.is(value,-0)?0:value;}
 if(Array.isArray(value)){if(value.length>2_100_000)bad('SIZE_LIMIT','array too large');return value.map(x=>normalize(x,depth+1));}
 if(value&&Object.getPrototypeOf(value)===Object.prototype){const r={};for(const k of Object.keys(value).sort()){if(k==='__proto__'||k==='constructor'||k==='prototype')bad('UNSAFE_KEY','unsafe field');const x=value[k];if(x===undefined)bad('UNDEFINED','undefined field: '+k);r[k]=normalize(x,depth+1);}return r;}
 bad('UNSUPPORTED_TYPE','cannot canonicalize '+typeof value);
}
export function canonicalJSON(o){return JSON.stringify(normalize(o));}
export async function sha256(o){
 if(!globalThis.crypto?.subtle)bad('CRYPTO_UNAVAILABLE','Secure-context Web Crypto required');
 const bytes=new TextEncoder().encode(typeof o==='string'?o:canonicalJSON(o));
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 return [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
}
export async function createExperiment({model,observations,notes='',algorithm='marching-squares-bilinear-asymptotic-decider-v2'}){
 if(!model||model.schema!==MODEL_SCHEMA)bad('MODEL_REQUIRED','invalid model contract');
 // Validate model again to prevent clients from forging a bogus scientific model.
 const clean=createModel({presetId:model.id,phase:model.parameters?.phase,level:model.parameters?.level,bounds:{xmin:model.domain.xmin,xmax:model.domain.xmax,ymin:model.domain.ymin,ymax:model.domain.ymax},resolution:[model.sampling?.nx,model.sampling?.ny]});
 if(canonicalJSON(model)!==canonicalJSON(clean))bad('MODEL_MUTATED','model contract differs from validated preset');
 if(!observations||typeof observations!=='object'||Array.isArray(observations))bad('OBSERVATIONS_REQUIRED','stats required');
 const stats={components:number(observations.components,'components',0,1e7),closed:number(observations.closed,'closed',0,1e7),boundary:number(observations.boundary,'boundary',0,1e7),totalLength:number(observations.totalLength,'totalLength',0,1e15)};
 if(!Object.values(stats).slice(0,3).every(Number.isInteger)||stats.closed+stats.boundary!==stats.components)bad('INCONSISTENT_COUNTS','component accounting mismatch');
 text(notes||'no notes','notes',3000);
 text(algorithm,'algorithm',200);
 const observation=evidence('E1','当前有限采样区域的等值线计数与长度估计',{warnings:['有限窗口中的边界穿越不证明全局无界','当前采样网格和插值可能漏掉小尺度结构']});
 const scientific={schema:EXPERIMENT_SCHEMA,model:clean,result:{stats,algorithm,evidence:observation},notes,engineVersion:'g0.1'};
 const hash=await sha256(scientific);
 return {...scientific,scientificHash:'sha256:'+hash,createdAt:new Date().toISOString()};
}
export async function verifyExperiment(bundle){
 if(!bundle||bundle.schema!==EXPERIMENT_SCHEMA||typeof bundle.scientificHash!=='string')bad('BUNDLE_INVALID','missing experiment fields');
 const {scientificHash,createdAt,...scientific}=bundle;
 const expected='sha256:'+await sha256(scientific);
 if(scientificHash!==expected)bad('HASH_MISMATCH','experiment contents modified');
 if(scientific.result?.evidence?.level!=='E1'||scientific.result.evidence.certified!==false||scientific.result.evidence.proof!==false)bad('EVIDENCE_FORGERY','result cannot claim certification');
 return true;
}
