// Studio IA v3: a scene-first workspace with progressive disclosure.
// Reparents existing working DOM controls rather than duplicating event listeners.
// Each original ID is preserved for mathematical, G1 learning and G2 Notebook contracts.
export function setupStudioFocus(){
 const $=s=>document.querySelector(s),right=$('.studio-page .right-panel .rail-scroll'),left=$('.studio-page .left-panel');
 const layout=$('.studio-page .layout'),bar=$('.studio-bar');
 if(!right||!left||!layout||!bar)throw new Error('STUDIO_STRUCTURE_MISSING');
 const pane=(id,label,subtext)=>{const el=document.createElement('section');el.className='focus-pane';el.id=id;el.setAttribute('aria-label',label);
  const heading=document.createElement('header');heading.className='focus-pane-header';
  const tag=document.createElement('span');tag.className='section-kicker';tag.textContent=subtext;
  const title=document.createElement('h3');title.textContent=label;heading.append(tag,title);el.append(heading);return el;};
 const observe=pane('focusObserve','看看发生了什么','01 / OBSERVE');
 const learn=pane('focusLearn','自己动手理解','02 / LEARN');
 const research=pane('focusResearch','检验一个发现','03 / RESEARCH · E1');
 const header=right.querySelector('.section-overline');header?.remove();
 const persistent=right.querySelector('.right-title');persistent?.classList.add('focus-status');
 const life=right.querySelector('#lifeLab');
 const fallback=document.createElement('div');fallback.className='focus-learn-intro';fallback.id='focusLearnIntro';
 fallback.innerHTML='<span aria-hidden="true">✳</span><strong>从一个熟悉的生活问题开始</strong><p>选择主题，然后试着预测、改变条件、寻找反例。</p><button type="button" id="focusChooseLesson">选择生活数学主题 ↗</button>';
 learn.append(fallback,life);
 for(const selector of ['.big-stat','.stats-row','.comparison','.mode-insight','.scientific-note']){
  const item=right.querySelector(selector);if(item)observe.append(item);
 }
 const discovery=right.querySelector('.discovery-card');if(discovery)research.append(discovery);
 const h0=document.createElement('details');h0.id='h0Panel';h0.className='h0-research';
 h0.innerHTML='<summary>◉ 区域如何出现、合并？ · H0 实验</summary><div class="h0-research-body"><p>试着想象：水位升降时，岛屿怎样出现和合并？这里独立统计有限网格中的连通区域。</p><div class="h0-controls"><select id="h0Direction" aria-label="阈值集合方向"><option value="superlevel">高于水位的岛屿</option><option value="sublevel">低于水位的湖谷</option></select><button id="runH0" type="button">分析 H0 →</button></div><div id="h0Overview" class="h0-overview" aria-live="polite">点击分析，查看当前水位有多少个分离区域。</div><div id="h0Audit" class="h0-audit" aria-live="polite">两套算法将逐一核对 5 个阈值。</div><div id="h0Bars" class="h0-bars" role="list" aria-label="H0 持续区间"></div><p id="h0Limits">4 邻接顶点网格的有限区域 H0；H1、TTK/GUDHI 仍待验收。</p><span id="h0Freshness" class="h0-freshness" role="status"></span><button id="exportH0" type="button" disabled>↓ 导出 H0 研究记录 JSON</button></div>';
 research.append(h0);
 const collapsible=(title,selectors,open=false)=>{
  const details=document.createElement('details');details.className='focus-more';details.open=open;
  const summary=document.createElement('summary');summary.textContent=title;details.append(summary);
  for(const selector of selectors){for(const item of [...right.querySelectorAll(selector)])details.append(item);}
  return details;
 };
 research.append(collapsible('调整模型 / 相位 / 网格精度',['.param'],false));
 research.append(collapsible('保存曲线与数学数据',['.button-grid'],false));
 const formula=right.querySelector('.formula');if(formula)research.append(formula);
 const footer=right.querySelector('.footer-note');if(footer)research.append(footer);
 [...right.querySelectorAll('.section-heading')].forEach(x=>x.remove());
 right.append(observe,learn,research);
 // The existing lesson is hidden until one is chosen; keep teaching text in one dedicated pane.
 function syncLesson(){fallback.hidden=!life.hidden;}
 const drawer=document.createElement('dialog');drawer.className='world-drawer';drawer.id='worldDrawer';drawer.setAttribute('aria-labelledby','worldDrawerHeading');
 drawer.innerHTML='<div class="world-drawer-head"><div><span class="section-kicker">YOUR MATHEMATICAL WORLDS</span><h2 id="worldDrawerHeading">探索哪些世界？</h2><p>从生活切入，或者自由选择数学场景。</p></div><button type="button" class="world-drawer-close" id="closeWorldDrawer" aria-label="关闭选择主题">×</button></div>';
 drawer.append(left);layout.after(drawer);
 const open=()=>{drawer.showModal();$('#closeWorldDrawer').focus();};
 const close=()=>{if(drawer.open)drawer.close();};
 $('#closeWorldDrawer').addEventListener('click',close);
 drawer.addEventListener('click',e=>{if(e.target===drawer)close();});
 $('#focusChooseLesson').addEventListener('click',open);
 // Existing click handlers still run on moved elements; this layer only changes navigation affordances.
 drawer.addEventListener('click',e=>{
  if(e.target.closest('.life-tile')){close();$('.mode[data-mode="learn"]')?.click();syncLesson();}
  else if(e.target.closest('.preset')){close();$('.mode[data-mode="wander"]')?.click();}
  else if(e.target.closest('#tryChallenge')){close();$('.mode[data-mode="wander"]')?.click();}
 });
 const choose=document.createElement('button');choose.type='button';choose.className='studio-tool choose-world';choose.id='openWorldDrawer';
 choose.textContent='☷ 换主题';choose.setAttribute('aria-haspopup','dialog');choose.setAttribute('aria-controls','worldDrawer');
 bar.insertBefore(choose,bar.querySelector('.mode-switch'));
 choose.addEventListener('click',open);
 const modes={wander:observe,learn,research};
 const buttons=[...document.querySelectorAll('.studio-bar .mode[data-mode]')];
 const titles={wander:'观察',learn:'学习',research:'研究'};
 buttons.forEach(b=>{b.textContent=titles[b.dataset.mode]||b.textContent;
  b.addEventListener('click',()=>setPane(b.dataset.mode));
 });
 function setPane(mode){
  const target=modes[mode]||observe;
  for(const element of Object.values(modes))element.hidden=element!==target;
  right.scrollTop=0;syncLesson();
  bar.dataset.focusMode=mode;document.body.dataset.focusMode=mode;
  const aria=target.querySelector('h3');if(aria)right.setAttribute('aria-label',aria.textContent);
 }
 setPane($('.studio-bar .mode.active')?.dataset.mode||'wander');
 return {setPane,openWorldDrawer:open,closeWorldDrawer:close,syncLesson};
}
