import {getPreset,evaluateField} from './math/fields.js';
import {extractContours,buildSpectrum} from './math/contours.js';
import {locateCriticalPoints,verifyLevel} from './math/verify.js';
let gridKey='',cache=null;
self.onmessage=(ev)=>{
 const d=ev.data,{seq,id,level,phase,scale,panX,panY,resolution,width,height,wantsSpectrum}=d;
 try{
  const preset=getPreset(id);
  const aspect=width/Math.max(1,height);
  const bounds={x0:panX-scale,x1:panX+scale,y0:panY-scale/aspect,y1:panY+scale/aspect};
  if(d.action==='critical'){
   const result=locateCriticalPoints({preset,phase,bounds,steps:44});
   self.postMessage({action:'critical',requestId:d.requestId,signature:d.signature,result});
   return;
  }
  if(d.action==='verify'){
   const offset=Math.max(.035,(preset.max-preset.min)*.012);
   const result=verifyLevel({preset,phase,level,bounds,aspect,resolutions:[120,220,340],offset});
   self.postMessage({action:'verify',requestId:d.requestId,signature:d.signature,result});
   return;
  }
  const nx=resolution,ny=Math.max(120,Math.round(resolution*height/Math.max(1,width)));
  const x0=bounds.x0,y0=bounds.y0,dx=(bounds.x1-bounds.x0)/nx,dy=(bounds.y1-bounds.y0)/ny;
  const key=JSON.stringify([id,phase,scale,panX,panY,nx,ny]);
  const changed=key!==gridKey;
  if(changed){
   const values=new Float32Array((nx+1)*(ny+1));
   for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)values[j*(nx+1)+i]=evaluateField(x0+i*dx,y0+j*dy,preset,phase);
   cache={values,nx,ny,x0,y0,dx,dy};gridKey=key;
  }
  const {values}=cache;
  const contour=extractContours(values,nx,ny,level,dx,dy,x0,y0);
  const spectrum=(changed||wantsSpectrum)?buildSpectrum(values,nx,ny,preset.min,preset.max,dx,dy,x0,y0,23):undefined;
  self.postMessage({seq,level,gridChanged:changed,grid:changed?values:undefined,coords:{nx,ny,x0,y0,dx,dy},contour,spectrum,renderKey:key});
 }catch(err){self.postMessage({action:d.action,requestId:d.requestId,seq,error:String(err?.stack||err)});}
};
