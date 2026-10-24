// G5.1 auditable constrained quasiperiodic parameter sweep.
// Same field formula with explicit 4x2 frequency matrix; finite-grid observations only.
import {extractContours} from './contours.js';
export const QUASI_MATRIX=[[1,0],[0,1],[Math.SQRT2,Math.sqrt(3)],[Math.sqrt(5),-Math.sqrt(7)]];
export const G5_SWEEP_SCHEMA='quasi-atlas.quasi-sweep/0.1';
export function quasiSample(x,y,phase=0,matrix=QUASI_MATRIX){
 if(!Array.isArray(matrix)||matrix.length!==4||matrix.some(row=>!Array.isArray(row)||row.length!==2||row.some(x=>!Number.isFinite(x))))throw new RangeError('Invalid frequency matrix');
 if(!Number.isFinite(phase))throw new RangeError('Invalid phase');
 return matrix.reduce((s,row,i)=>s+Math.cos(row[0]*x+row[1]*y+(i===2?phase:0)),0);
}
export function measureQuasi({phase=0,level=0,radius=12,nx=64}={}){
 if(!Number.isFinite(phase)||!Number.isFinite(level)||!Number.isFinite(radius)||radius<2||radius>100||
 !Number.isInteger(nx)||nx<16||nx>256||Math.abs(level)>4)throw new RangeError('Sweep limits exceeded');
 const ny=nx,values=new Float32Array((nx+1)*(ny+1)),x0=-radius,y0=-radius,dx=2*radius/nx,dy=2*radius/ny;
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)values[j*(nx+1)+i]=quasiSample(x0+i*dx,y0+j*dy,phase);
 const {stats,algorithm}=extractContours(values,nx,ny,level,dx,dy,x0,y0);
 return {phase,level,radius,nx,ny,algorithm,...stats,boundaryShare:stats.components===0?0:stats.boundary/stats.components,
  evidence:'E1',caveat:'Boundary contact only concerns finite sampled square; not globally noncompact orbits.'};
}
export function makeQuasiSweep(){
 const cases=[];
 for(const phase of [0,0.17,0.34,0.51])for(const radius of [8,16,32])for(const level of [-0.5,0,0.5])
  cases.push(measureQuasi({phase,radius,level,nx:64}));
 return {schema:G5_SWEEP_SCHEMA,model:{formula:'sum_i cos(k_i dot (x,y) + phi_i)',
  frequencyMatrix:QUASI_MATRIX,phaseAppliedToTerm:2,floatFormat:'float32',
  domain:'[-R,R]^2 non-periodic, radius R listed per case',grid:[64,64]},
  cases,evidence:'E1',claim:'Finite-window numerical exploration, not a published theorem replication.',
  limitations:['Finite window boundary contact does not prove unbounded trajectories.','No published result hypotheses have been independently reviewed or claimed reproduced.']};
}
