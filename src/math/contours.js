// Marching squares with asymptotic centre disambiguation.
// Segments are stitched by shared integer grid-edge identities, not rounded floating points.
// "boundary" means viewport intersection only; this is NOT evidence of a globally unbounded curve.
const pairs = {0:[],1:[[3,0]],2:[[0,1]],3:[[3,1]],4:[[1,2]],6:[[0,2]],7:[[3,2]],8:[[2,3]],9:[[0,2]],11:[[1,2]],12:[[1,3]],13:[[0,1]],14:[[3,0]],15:[]};
function interpolate(level,a,b){let d=b-a;return Math.abs(d)<1e-12?.5:Math.max(0,Math.min(1,(level-a)/d));}
export function extractContours(values,nx,ny,level,dx=1,dy=1,x0=0,y0=0,{minPoints=2}={}) {
  const segments=[],nodes=new Map(),adj=new Map();
  const sample=(i,j)=>values[j*(nx+1)+i];
  function link(k1,p1,k2,p2){if(!nodes.has(k1))nodes.set(k1,p1);if(!nodes.has(k2))nodes.set(k2,p2);const idx=segments.length;segments.push([k1,k2]);if(!adj.has(k1))adj.set(k1,[]);if(!adj.has(k2))adj.set(k2,[]);adj.get(k1).push(idx);adj.get(k2).push(idx);}
  for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
    const v0=sample(i,j),v1=sample(i+1,j),v2=sample(i+1,j+1),v3=sample(i,j+1);
    if(![v0,v1,v2,v3].every(Number.isFinite))continue;
    const mask=(v0>level?1:0)|(v1>level?2:0)|(v2>level?4:0)|(v3>level?8:0);
    if(mask===0||mask===15)continue;
    let connections=pairs[mask];
    if(mask===5 ||mask===10) {
      const highCentre=(v0+v1+v2+v3)*.25>level;
      // Surround connected centres on the same side, resolving checkerboard ambiguity.
      connections=(mask===5)==highCentre?[[0,1],[2,3]]:[[3,0],[1,2]];
    }
    const edges=[
      [`h:${i}:${j}`,[x0+(i+interpolate(level,v0,v1))*dx,y0+j*dy]],
      [`v:${i+1}:${j}`,[x0+(i+1)*dx,y0+(j+interpolate(level,v1,v2))*dy]],
      [`h:${i}:${j+1}`,[x0+(i+interpolate(level,v3,v2))*dx,y0+(j+1)*dy]],
      [`v:${i}:${j}`,[x0+i*dx,y0+(j+interpolate(level,v0,v3))*dy]]
    ];
    for(const [ea,eb] of connections)link(edges[ea][0],edges[ea][1],edges[eb][0],edges[eb][1]);
  }
  const used=new Uint8Array(segments.length),paths=[];
  function follow(start){
    const ids=[start];let current=start,length=0,edgeCount=0,closed=false;
    while(true){
      const next=(adj.get(current)||[]).find(e=>!used[e]);if(next===undefined)break;
      used[next]=1;edgeCount++;
      const [a,b]=segments[next];const dest=a===current?b:a;
      const p=nodes.get(current),q=nodes.get(dest);length+=Math.hypot(p[0]-q[0],p[1]-q[1]);
      ids.push(dest);current=dest;
      if(dest===start){closed=true;break;}
      if(edgeCount>segments.length)break;
    }
    if(ids.length<minPoints)return;
    const pts=ids.map(k=>nodes.get(k));
    paths.push({points:pts,closed,length,edgeCount,touchesBoundary:!closed});
  }
  for(const [key,edges] of adj)if(edges.length===1&&edges.some(e=>!used[e]))follow(key);
  for(let i=0;i<segments.length;i++)if(!used[i])follow(segments[i][0]);
  const closed=paths.filter(p=>p.closed).length;
  return {paths,stats:{components:paths.length,closed,boundary:paths.length-closed,totalLength:paths.reduce((s,p)=>s+p.length,0),segments:segments.length},algorithm:'marching-squares-centre-decider-v1'};
}
export function buildSpectrum(values,nx,ny,min,max,dx,dy,x0,y0,count=29){
  const data=[];for(let k=0;k<count;k++){const level=min+(max-min)*k/(count-1);const r=extractContours(values,nx,ny,level,dx,dy,x0,y0);data.push({level,closed:r.stats.closed,boundary:r.stats.boundary,components:r.stats.components});}
  const candidates=[];for(let i=1;i<data.length;i++){const a=data[i-1],b=data[i],delta=Math.abs(a.closed-b.closed)+Math.abs(a.boundary-b.boundary);if(delta>0)candidates.push({level:(a.level+b.level)/2,delta,before:a.components,after:b.components});}
  const spacing=(max-min)/11;const events=[];for(const e of candidates.sort((a,b)=>b.delta-a.delta)){if(events.every(x=>Math.abs(x.level-e.level)>spacing)){events.push(e);if(events.length>=8)break;}}
  events.sort((a,b)=>a.level-b.level);
  return {data,events};
}
