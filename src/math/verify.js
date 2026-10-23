import {extractContours} from './contours.js';
import {evaluateField} from './fields.js';

export const VERIFICATION_VERSION='grid-stability-0.2';
export const CRITICAL_VERSION='fd-critical-0.2';

export function sampleField(preset,phase,bounds,nx,ny, evaluator=evaluateField){
 const {x0,y0,x1,y1}=bounds,dx=(x1-x0)/nx,dy=(y1-y0)/ny;
 const values=new Float32Array((nx+1)*(ny+1));
 for(let j=0;j<=ny;j++) for(let i=0;i<=nx;i++)values[j*(nx+1)+i]=evaluator(x0+i*dx,y0+j*dy,preset,phase);
 return {values,nx,ny,dx,dy,x0,y0};
}
function statsAt(grid,level){return extractContours(grid.values,grid.nx,grid.ny,level,grid.dx,grid.dy,grid.x0,grid.y0).stats;}
function relativeDifference(a,b){return Math.abs(a-b)/Math.max(1,Math.abs(a),Math.abs(b));}
export function compareResolutions(rows){
 const a=rows.at(-2),b=rows.at(-1),sameTopology=a.closed===b.closed&&a.boundary===b.boundary;
 const lengthDrift=relativeDifference(a.length,b.length);
 // A heuristic stability flag for measured counts/lengths on two sampled grids.
 return {sameCounts:sameTopology,lengthDrift,flag:sameTopology&&lengthDrift<0.045?'consistent':'needs-refinement'};
}
export function verifyLevel({preset,phase,level,bounds,aspect=1,resolutions=[128,224,352],offset=0.06,evaluator=evaluateField}) {
 if(bounds.x0>=bounds.x1||bounds.y0>=bounds.y1)throw new Error('invalid bounds');
 const levels=[level-offset,level,level+offset];
 const results=[]; 
 for(const n of resolutions){
   const nx=n,ny=Math.max(64,Math.round(n/aspect));
   const grid=sampleField(preset,phase,bounds,nx,ny,evaluator);
   results.push({resolution:[nx,ny],step:[grid.dx,grid.dy],levels:levels.map(c=>{
     const s=statsAt(grid,c);
     return {level:c,components:s.components,closed:s.closed,boundary:s.boundary,length:s.totalLength};
   })});
 }
 const checks=levels.map((c,i)=>{
   const row=results.map(res=>({resolution:res.resolution, ...res.levels[i]}));
   return {level:c,rows:row,comparison:compareResolutions(row)};
 });
 const consistent=checks.every(v=>v.comparison.flag==='consistent');
 return {version:VERIFICATION_VERSION,limits:['Finite rectangular domain only','3-grid heuristic, not proof of topology or convergence','Near critical or degenerate values counts can be unstable'],
   preset:preset.id,phase,level,offset,bounds,aspect,resolutions,checks,
   verdict:consistent?'consistent-on-sampled-grids':'needs-refinement',testedAt:new Date().toISOString()};
}
function diff(fn,x,y,h){
 const f=fn(x,y),px=fn(x+h,y),mx=fn(x-h,y),py=fn(x,y+h),my=fn(x,y-h);
 return {gx:(px-mx)/(2*h),gy:(py-my)/(2*h),xx:(px-2*f+mx)/(h*h),yy:(py-2*f+my)/(h*h),
   xy:(fn(x+h,y+h)-fn(x+h,y-h)-fn(x-h,y+h)+fn(x-h,y-h))/(4*h*h),f};
}
export function locateCriticalPoints({preset,phase,bounds,steps=32,maxPoints=80,evaluator=evaluateField}){
 const fn=(x,y)=>evaluator(x,y,preset,phase);
 const sx=(bounds.x1-bounds.x0)/steps,sy=(bounds.y1-bounds.y0)/steps,h=Math.max(0.0005,Math.min(sx,sy)*0.15);
 const rows=steps+1, grads=new Array(rows*rows),idx=(i,j)=>j*rows+i;
 for(let j=0;j<=steps;j++)for(let i=0;i<=steps;i++)grads[idx(i,j)]=diff(fn,bounds.x0+i*sx,bounds.y0+j*sy,h);
 const points=[];
 for(let j=0;j<steps;j++)for(let i=0;i<steps;i++){
  const ds=[grads[idx(i,j)],grads[idx(i+1,j)],grads[idx(i,j+1)],grads[idx(i+1,j+1)]];
  if(!(Math.min(...ds.map(d=>d.gx))<=0&&Math.max(...ds.map(d=>d.gx))>=0&&Math.min(...ds.map(d=>d.gy))<=0&&Math.max(...ds.map(d=>d.gy))>=0))continue;
  let x=bounds.x0+(i+0.5)*sx,y=bounds.y0+(j+0.5)*sy,valid=true;
  for(let k=0;k<18;k++){
   const d=diff(fn,x,y,h),det=d.xx*d.yy-d.xy*d.xy;
   if(!Number.isFinite(det)||Math.abs(det)<1e-9){valid=false;break;}
   const ux=(d.yy*d.gx-d.xy*d.gy)/det,uy=(-d.xy*d.gx+d.xx*d.gy)/det;
   x-=Math.max(-sx,Math.min(sx,ux));y-=Math.max(-sy,Math.min(sy,uy));
   if(x<bounds.x0+sx*0.1||x>bounds.x1-sx*0.1||y<bounds.y0+sy*0.1||y>bounds.y1-sy*0.1){valid=false;break;}
   if(Math.hypot(ux,uy)<h*.01)break;
  }
  if(!valid)continue;
  const d=diff(fn,x,y,h),det=d.xx*d.yy-d.xy*d.xy;
  if(Math.hypot(d.gx,d.gy)>1e-4 || Math.abs(det)<1e-5)continue;
  const type=det<0?'saddle':d.xx>0?'minimum':'maximum';
  if(points.some(p=>Math.hypot(p.x-x,p.y-y)<Math.min(sx,sy)*0.55))continue;
  points.push({x,y,value:d.f,type,gradientNorm:Math.hypot(d.gx,d.gy),hessianDet:det,method:CRITICAL_VERSION});
 }
 points.sort((a,b)=>a.value-b.value);
 return {version:CRITICAL_VERSION,points:points.slice(0,maxPoints),truncated:points.length>maxPoints,examinedCells:steps*steps,notice:'Finite difference Newton candidates only; needs independent mathematical verification.'};
}
