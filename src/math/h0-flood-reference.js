// Independent G3 finite-threshold component enumerator: BFS, no persistent
// union-find or marching squares. Reports numerical discrepancies, never hides them.
import {validateGrid} from './topology-h0.js';
export const FLOOD_REFERENCE='grid-bfs-components/1.0';
export function floodCount(values,nx,ny,level,direction='superlevel'){
 const n=validateGrid(values,nx,ny);
 if(typeof level!=='number'||!Number.isFinite(level)||!['sublevel','superlevel'].includes(direction))
  throw new RangeError('Invalid threshold or filtration');
 const seen=new Uint8Array(n),queue=new Int32Array(n),stride=nx+1;
 const included=i=>direction==='sublevel'?values[i]<=level:values[i]>=level;
 let count=0,activeVertices=0;
 for(let i=0;i<n;i++)if(included(i))activeVertices++;
 for(let start=0;start<n;start++){
  if(seen[start]||!included(start))continue;count++;
  let front=0,end=1;seen[start]=1;queue[0]=start;
  while(front<end){
   const idx=queue[front++],x=idx%stride,y=(idx-x)/stride;
   const neighbors=[x?idx-1:-1,x<nx?idx+1:-1,y?idx-stride:-1,y<ny?idx+stride:-1];
   for(const next of neighbors)if(next>=0&&!seen[next]&&included(next)){
    seen[next]=1;queue[end++]=next;
   }
  }
 }
 return {components:count,activeVertices};
}
export function auditH0AgainstFlood(values,nx,ny,h0){
 if(h0.grid.nx!==nx||h0.grid.ny!==ny)throw new Error('H0 audit grid dimension mismatch');
 const checks=h0.thresholds.map(({level,components})=>{
  const independent=floodCount(values,nx,ny,level,h0.filtration).components;
  return {level,persistent:components,flood:independent,status:components===independent?'MATCH':'DIFFERENT'};
 });
 return {schema:'quasi-atlas.h0-cross-check/1.0',reference:FLOOD_REFERENCE,primary:h0.algorithm,
  status:checks.every(c=>c.status==='MATCH')?'MATCH':'DIFFERENT',checks,
  boundary:'finite-clipped-open-rectangle',evidence:'E1',externalLibraryVerified:false,
  warning:'Two different graph algorithms on the same finite vertex grid; no external GUDHI/TTK or continuous-domain proof.'};
}
