import {evaluateField,getPreset} from './math/fields.js';
import {extractContours} from './math/contours.js';

// First-touch demo is computed from the real G0 archipelago field and contour
// algorithm. Counts are finite-window observations, not physical measurements.
export function setupFirstPlay({openStudio,openLesson}){
  const canvas=document.querySelector('#firstPlayCanvas');
  const slider=document.querySelector('#firstPlayLevel');
  const value=document.querySelector('#firstPlayLevelValue');
  const feedback=document.querySelector('#firstPlayFeedback');
  const next=document.querySelector('#firstPlayNext');
  const total=document.querySelector('#firstPlayIslands');
  if(!canvas||!slider||!feedback||!next)return;
  const nx=144,ny=112,x0=-19,y0=-16,spanX=38,spanY=32,preset=getPreset('archipelago');
  const dx=spanX/nx,dy=spanY/ny,values=new Float32Array((nx+1)*(ny+1));
  for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++)values[y*(nx+1)+x]=evaluateField(x0+x*dx,y0+y*dy,preset,0);
  const raster=document.createElement('canvas');raster.width=nx+1;raster.height=ny+1;
  const rasterCtx=raster.getContext('2d');
  const ctx=canvas.getContext('2d');
  let touched=false,firstCount=null,frame=0;
  const level=()=>Number(slider.value);
  function render(){
    frame=0;
    const l=level(),w=canvas.width,h=canvas.height;
    const img=rasterCtx.createImageData(nx+1,ny+1);
    for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++){
      const k=(y*(nx+1)+x),v=values[k],d=v-l;
      // Intentionally clear distinction between water and raised land.
      const land=Math.max(0,Math.min(1,(d+.12)/.35));
      const bright=Math.max(0,Math.min(1,Math.max(0,v)/3));
      const n=k*4;
      img.data[n]=Math.round(17+land*(95+54*bright));
      img.data[n+1]=Math.round(77+land*(119+34*bright));
      img.data[n+2]=Math.round(84+land*(67-11*bright));
      img.data[n+3]=255;
    }
    rasterCtx.putImageData(img,0,0);
    ctx.clearRect(0,0,w,h);
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(raster,0,0,w,h);
    const {paths,stats}=extractContours(values,nx,ny,l,dx,dy,x0,y0);
    for(const width of [4,1.8]){
      ctx.beginPath();ctx.lineWidth=width*(w/700);ctx.strokeStyle=width===4?'rgba(11,53,56,.37)':'rgba(251,250,218,.94)';
      for(const path of paths){if(path.points.length<2)continue;
        path.points.forEach(([px,py],i)=>{const a=(px-x0)/spanX*w,b=(py-y0)/spanY*h;
          if(i===0)ctx.moveTo(a,b);else ctx.lineTo(a,b);
        });
        if(path.closed)ctx.closePath();
      }
      ctx.stroke();
    }
    const count=stats.closed;
    total.textContent=String(count);
    value.textContent=l.toFixed(2);
    if(firstCount===null)firstCount=count;
    if(touched){
      const difference=count-firstCount;
      feedback.textContent=difference===0
        ? '地形已经改变了！继续移动水位，看哪些岛屿会分开或消失。'
        : '你看到了变化：闭合岛屿边界从 '+firstCount+' 条变成 '+count+' 条。';
    } else {
      feedback.textContent='绿色是高出水面的部分。试着拖一下，观察它的变化。';
    }
  }
  function drawSoon(){if(!frame)frame=requestAnimationFrame(render);}
  function resize(){
    const bounds=canvas.getBoundingClientRect();
    if(!bounds.width||!bounds.height)return;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const w=Math.round(bounds.width*dpr),h=Math.round(bounds.height*dpr);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    drawSoon();
  }
  slider.addEventListener('input',()=>{
    touched=true;next.hidden=false;
    document.body.dataset.firstDiscovery='yes';
    drawSoon();
  });
  const enter=document.querySelector('#firstPlayEnter');
  const skip=document.querySelector('#firstPlaySkip');
  const lesson=document.querySelector('#firstPlayLesson');
  const journey=document.querySelector('#journeyStrip');
  function launch(){
    if(journey)journey.hidden=false;
    openStudio();
    const guide=document.querySelector('#firstPlayGuide');
    if(guide){
      guide.hidden=false;
      guide.dataset.step='point';
      guide.querySelector('[data-guide-title]').textContent='点一下地图，看看那个位置的数值';
      guide.querySelector('[data-guide-text]').textContent='你可以自由拖动地图，也可以点一下任何位置。';
      guide.querySelector('[data-guide-next]').hidden=true;
    }
  }
  enter?.addEventListener('click',launch);
  skip?.addEventListener('click',launch);
  lesson?.addEventListener('click',()=>{openLesson('puddles');});
  // In-studio discovery is optional. Advanced tools stay available at all times.
  const guide=document.createElement('div');
  guide.id='firstPlayGuide';guide.className='first-play-guide';guide.hidden=true;
  guide.innerHTML='<span>下一步 · 自由探索</span><strong data-guide-title></strong><p data-guide-text></p><button data-guide-next type="button" hidden>继续：试一个生活数学问题 ↗</button><button data-guide-dismiss type="button" aria-label="关闭引导">×</button>';
  const observe=document.querySelector('#focusObserve .focus-pane-header');
  observe?.after(guide);
  guide.querySelector('[data-guide-dismiss]').addEventListener('click',()=>{guide.hidden=true;});
  guide.querySelector('[data-guide-next]').addEventListener('click',()=>{guide.hidden=true;openLesson('puddles');});
  document.querySelector('#worldCanvas')?.addEventListener('pointerup',()=>{
    if(guide.hidden||document.querySelector('#pin')?.hidden)return;
    guide.dataset.step='discovered';
    guide.querySelector('[data-guide-title]').textContent='你已经探索了一个点！';
    guide.querySelector('[data-guide-text]').textContent='数学不只是漂亮的图。现在可以用一个生活问题理解你看到的变化。';
    guide.querySelector('[data-guide-next]').hidden=false;
  });
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(canvas);
  window.addEventListener('resize',resize);
  resize();
  return {render};
}
