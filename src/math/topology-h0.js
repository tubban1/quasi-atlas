// G3.1: 0-dimensional persistent homology of the 4-connected vertex grid graph.
// Finite open rectangle (NO periodic wrap), lower/upper-star graph filtration.
// H0 only: this is NOT H1, contour tree, exact continuous topology or certified proof.
// This algorithm never calls the existing Marching Squares or contour reconstruction.
const LIMIT=150_000;
export const H0_ALGORITHM='vertex-grid-h0-elder-rule/1.0';
export function validateGrid(values,nx,ny) {
 if(!Number.isInteger(nx)||!Number.isInteger(ny)||nx<1||ny<1||(nx+1)*(ny+1)>LIMIT)
  throw new RangeError('H0 grid must contain 4..150000 vertices');
 const n=(nx+1)*(ny+1);
 if(!values||typeof values.length!=='number'||values.length!==n)throw new RangeError('Wrong vertex grid shape');
 for(let i=0;i<n;i++)if(typeof values[i]!=='number'||!Number.isFinite(values[i]))throw new RangeError('Nonfinite H0 input at '+i);
 return n;
}
export function analyzeH0(values,nx,ny,{direction='superlevel',thresholds=[],maxBars=36}={}) {
 const n=validateGrid(values,nx,ny);
 if(!['sublevel','superlevel'].includes(direction))throw new RangeError('Invalid H0 filtration direction');
 if(!Array.isArray(thresholds)||thresholds.length>32||thresholds.some(x=>typeof x!=='number'||!Number.isFinite(x)))
  throw new RangeError('Invalid finite H0 thresholds');
 if(!Number.isInteger(maxBars)||maxBars<1||maxBars>200)throw new RangeError('Invalid barcode limit');
 const isSub=direction==='sublevel',parent=new Int32Array(n).fill(-1),sizes=new Int32Array(n).fill(1);
 const births=new Float64Array(n),origin=new Int32Array(n);
 const order=Array.from({length:n},(_,i)=>i).sort((a,b)=>isSub?values[a]-values[b]||a-b:values[b]-values[a]||a-b);
 const find=start=>{let i=start;while(parent[i]!==i)i=parent[i];while(parent[start]!==start){let p=parent[start];parent[start]=i;start=p;}return i;};
 const finite=[],all=[];let zeroBars=0,components=0;
 const elder=(a,b)=>{
  if(births[a]===births[b])return origin[a]<origin[b]?a:b;
  return isSub?(births[a]<births[b]?a:b):(births[a]>births[b]?a:b);
 };
 const link=(ia,ib,level)=>{
  let a=find(ia),b=find(ib);
  if(a===b)return;
  const keep=elder(a,b),discard=keep===a?b:a;
  const persistence=isSub?level-births[discard]:births[discard]-level;
  if(persistence>0)finite.push({birth:births[discard],death:level,persistence,originIndex:origin[discard],mergeIndex:ia});
  else zeroBars++;
  parent[discard]=keep;sizes[keep]+=sizes[discard];components--;
 };
 let offset=0;
 while(offset<n){
  const val=values[order[offset]];let end=offset+1;
  while(end<n&&values[order[end]]===val)end++;
  for(let k=offset;k<end;k++){
   const i=order[k];parent[i]=i;births[i]=val;origin[i]=i;components++;
  }
  // Batch plateau activation before linking: endpoint inclusivity is consistent.
  for(let k=offset;k<end;k++){
   const i=order[k],x=i%(nx+1),y=Math.floor(i/(nx+1));
   if(x>0&&parent[i-1]>=0)link(i,i-1,val);
   if(x<nx&&parent[i+1]>=0)link(i,i+1,val);
   if(y>0&&parent[i-(nx+1)]>=0)link(i,i-(nx+1),val);
   if(y<ny&&parent[i+(nx+1)]>=0)link(i,i+(nx+1),val);
  }
  offset=end;
 }
 for(let i=0;i<n;i++)if(parent[i]===i)all.push({birth:births[i],death:null,persistence:null,originIndex:origin[i]});
 if(all.length!==1)throw new Error('Rectangular grid H0 must have one essential component');
 const positive=finite.filter(x=>Number.isFinite(x.persistence));
 const intervals=[...positive,...all];
 const counts=thresholds.map(level=>({level,components:intervals.reduce((sum,bar)=>{
  const born=isSub?bar.birth<=level:bar.birth>=level;
  const alive=bar.death===null||(isSub?level<bar.death:level>bar.death);
  return sum+(born&&alive?1:0);
 },0)}));
 const sorted=[...positive].sort((a,b)=>b.persistence-a.persistence||a.originIndex-b.originIndex);
 return {schema:'quasi-atlas.h0/1.0',algorithm:H0_ALGORITHM,filtration:direction,
  complex:'4-neighbour-vertex-grid-graph',domain:'finite-clipped-open-rectangle',
  grid:{nx,ny,vertices:n},bars:[...all,...sorted.slice(0,maxBars)],positiveFiniteBars:positive.length,
  zeroLengthBars:zeroBars,truncatedBars:Math.max(0,positive.length-maxBars),
  thresholds:counts,evidence:'E1',certified:false,
  warning:'Discrete graph H0, not continuous domain topology, H1 or independent external verification.'};
}
