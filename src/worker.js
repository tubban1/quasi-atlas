import {getPreset,evaluateField} from './math/fields.js';
import {extractContours,buildSpectrum} from './math/contours.js';
let gridKey='',cache=null;
self.onmessage=(ev)=>{
 const {seq,id,level,phase,scale,panX,panY,resolution,width,height,wantsSpectrum}=ev.data;
 try{
 const preset=getPreset(id), nx=resolution,ny=Math.max(120,Math.round(resolution*height/Math.max(1,width))), aspect=width/Math.max(1,height);
 const x0=panX-scale, y0=panY-scale/aspect,dx=2*scale/nx,dy=2*scale/aspect/ny;
 const key=JSON.stringify([id,phase,scale,panX,panY,nx,ny]);
 let changed=key!==gridKey;
 if(changed){
  const values=new Float32Array((nx+1)*(ny+1));
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)values[j*(nx+1)+i]=evaluateField(x0+i*dx,y0+j*dy,preset,phase);
  cache={values,nx,ny,x0,y0,dx,dy};gridKey=key;
 }
 const {values}=cache;
 const contour=extractContours(values,nx,ny,level,dx,dy,x0,y0);
 const spectrum=(changed||wantsSpectrum)?buildSpectrum(values,nx,ny,preset.min,preset.max,dx,dy,x0,y0,23):undefined;
 self.postMessage({seq,level,gridChanged:changed,grid:changed?values:undefined,coords:{nx,ny,x0,y0,dx,dy},contour,spectrum,renderKey:key});
 }catch(err){self.postMessage({seq,error:String(err?.stack||err)});}
};
