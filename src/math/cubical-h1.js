// G3.2 finite planar cubical (vertex lower/upper star) Betti numbers at thresholds.
// Counts H1 via Euler V-E+F and independent H0 BFS; boundary is NON-periodic.
// Counts are not persistence pairings, interval proof, or continuous topology.
import {validateGrid} from './topology-h0.js';
import {floodCount} from './h0-flood-reference.js';
export const H1_ALGORITHM='planar-cubical-euler-betti/1.0';
export function cubicalBettiAt(values,nx,ny,level,direction='sublevel') {
 const n=validateGrid(values,nx,ny);
 if(!Number.isFinite(level)||!['sublevel','superlevel'].includes(direction))throw new RangeError('Invalid cubical threshold');
 const stride=nx+1,inside=new Uint8Array(n);let v=0,e=0,f=0;
 for(let i=0;i<n;i++){const yes=direction==='sublevel'?values[i]<=level:values[i]>=level;inside[i]=yes?1:0;if(yes)v++;}
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
  const idx=j*stride+i;if(!inside[idx])continue;
  if(i<nx&&inside[idx+1])e++;
  if(j<ny&&inside[idx+stride])e++;
  if(i<nx&&j<ny&&inside[idx+1]&&inside[idx+stride]&&inside[idx+stride+1])f++;
 }
 const betti0=floodCount(values,nx,ny,level,direction).components;
 const euler=v-e+f,betti1=betti0-euler;
 if(!Number.isInteger(betti1)||betti1<0)throw new Error('Planar cubical H1 Euler invariant failed');
 return {level,direction,betti0,betti1,euler,cells:{vertices:v,edges:e,faces:f}};
}
export function cubicalBettiSweep(values,nx,ny,levels,direction='sublevel'){
 if(!Array.isArray(levels)||levels.length>32||levels.some(x=>typeof x!=='number'||!Number.isFinite(x)))throw new RangeError('Invalid levels');
 return {schema:'quasi-atlas.cubical-betti/1.0',algorithm:H1_ALGORITHM,complex:'vertex-star-planar-square-cells',boundary:'open-clipped-rectangle',
  results:levels.map(v=>cubicalBettiAt(values,nx,ny,v,direction)),evidence:'E1',certified:false,
  warning:'Finite sampled complex; Euler H1 counts, not certified continuous-domain holes or per-class H1 persistence pairs.'};
}
