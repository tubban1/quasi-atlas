import {LIFE_LESSONS} from './life-content.js';
import {PRESETS} from './math/fields.js';

// Product-facing IA registry. Each new usable feature gets one discoverable entry here.
// Research-only prototypes link to their milestone instead of pretending to have a UI.
export const FEATURE_SECTIONS = [
  {id:'learn',title:'生活中的数学',subtitle:'先提出问题，再动手理解。',items:LIFE_LESSONS.map(lesson=>({
    id:'lesson-'+lesson.id,title:lesson.title,description:lesson.subtitle,
    status:'互动课程 · E0',kind:'lesson',value:lesson.id,
    keywords:lesson.id+' '+lesson.number+' lesson 学习 预测 反例'
  }))},
  {id:'worlds',title:'数学世界与探索',subtitle:'选择数学场景，实时观察等值线与结构变化。',items:[
    {id:'observe',title:'实时观察工作台',description:'调整高度、移动地图、查看结构事件与有限网格统计。',status:'可直接体验 · E1',kind:'mode',value:'wander',keywords:'画布 等值线 水位 结构事件 海平面'},
    ...PRESETS.map(world=>({id:'world-'+world.id,title:world.title,description:world.short||world.subtitle,status:'数学场景 · E1',kind:'world',value:world.id,keywords:world.id+' '+world.code+' 预设 数学世界'}))
  ]},
  {id:'experiments',title:'实验与检验',subtitle:'在同一个工作台中验证假设，清楚区分数值计算和数学证明。',items:[
    {id:'critical',title:'寻找临界点候选',description:'扫描局部极值与鞍点候选，结论仅属于启发式观察。',status:'可直接体验 · E1',kind:'experiment',value:'critical',keywords:'临界点 驻点 candidate critical'},
    {id:'grid',title:'三档网格精度验证',description:'比较不同采样精度，观察结果是否稳定。',status:'可直接体验 · E1',kind:'experiment',value:'grid',keywords:'精度 分辨率 数值稳定性'},
    {id:'h0',title:'H0 连通区域与持久区间',description:'分析水位升降时区域出现和合并，并导出有限网格报告。',status:'研究实验 · E1',kind:'experiment',value:'h0',keywords:'G3 拓扑 同调 persistence 连通 洞'},
    {id:'transfer',title:'六题数学理解自测',description:'检查概念是否能应用到其他情境；不存储身份或作答。',status:'本地练习 · G6',kind:'experiment',value:'transfer',keywords:'迁移 自测 考试 教育'}
  ]},
  {id:'records',title:'发现记录与输出',subtitle:'从一次观察到可以追溯、比较与复算的实验。',items:[
    {id:'notebook',title:'发现日志 · Notebook',description:'记录问题、假设、快照，比较实验，并导入导出与复算。',status:'可直接体验 · G2',kind:'notebook',keywords:'记录 日志 复算 JSON CSV 保存 快照 比较 replay'},
    {id:'export',title:'导出图片与科研数据',description:'从研究面板保存 PNG、SVG、E1 JSON 和可分享实验链接。',status:'工作台工具 · E1',kind:'experiment',value:'export',keywords:'PNG SVG JSON 分享 下载 数据'}
  ]},
  {id:'research',title:'科研阶段与成果',subtitle:'这里区分工程实现、可交互体验与仍待外部验证的研究工作。',items:[
    {id:'g3',title:'G3 · H1 洞数量验证',description:'有限网格代码及基准已有验证；完整 H1 持久配对尚未交付为交互工具。',status:'科研代码 · 未提供页面',kind:'milestone',value:'G3',keywords:'H1 GUDHI TTK 洞数'},
    {id:'g4',title:'G4 · 有理数严格验证原型',description:'限定二次函数的精确验证原型；尚非通用认证算法。',status:'受限工程原型',kind:'milestone',value:'G4',keywords:'驻点 有理数 证书 interval'},
    {id:'g5',title:'G5 · 准周期参数扫描',description:'36 组可重放的工程实验；当前没有独立前端分析界面。',status:'工程 Beta · 未提供页面',kind:'milestone',value:'G5',keywords:'准周期 sweep 相位 四频'},
    {id:'g6',title:'G6 · 外部评审与研究验收',description:'工程放行检查已建，专家评审和正式科研验收仍未完成。',status:'待评审',kind:'milestone',value:'G6',keywords:'gate 专家 评审 研究'},
    {id:'roadmap',title:'G0–G6 完整路线与证据等级',description:'查看项目已完成、正在验证和未来规划的明确界限。',status:'研发透明度',kind:'screen',value:'roadmap',keywords:'E0 E1 E2 E3 E4 科学证明'}
  ]}
];

export function setupFeatureCatalog({openFeature}){
 const root=document.querySelector('#catalogSections'),input=document.querySelector('#catalogSearch'),chips=document.querySelector('#catalogFilters');
 const count=document.querySelector('#catalogCount'),empty=document.querySelector('#catalogEmpty');
 if(!root||!input||!chips||!count||!empty)throw new Error('CATALOG_STRUCTURE_MISSING');
 let active='all';
 const clean=s=>String(s||'').toLocaleLowerCase().normalize('NFKC');
 const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 chips.innerHTML=[{id:'all',title:'全部功能'},...FEATURE_SECTIONS].map(group=>
  '<button type="button" data-filter="'+group.id+'" aria-pressed="'+(group.id==='all')+'">'+escape(group.title)+'</button>'
 ).join('');
 function render(){
  const term=clean(input.value.trim());let shown=0;
  root.innerHTML=FEATURE_SECTIONS.filter(group=>active==='all'||active===group.id).map(group=>{
   const matched=group.items.filter(item=>clean([item.title,item.description,item.status,item.keywords,group.title].join(' ')).includes(term));
   if(!matched.length)return '';
   shown+=matched.length;
   return '<section class="catalog-group" id="catalog-'+group.id+'" aria-label="'+escape(group.title)+'">'+
    '<div class="catalog-group-heading"><h2>'+escape(group.title)+'</h2><p>'+escape(group.subtitle)+'</p><span>'+matched.length+' 项</span></div>'+
    '<div class="catalog-grid">'+matched.map(item=>
     '<button type="button" class="catalog-card" data-feature="'+escape(item.id)+'">'+
     '<span class="catalog-card-meta">'+escape(item.status)+'</span>'+
     '<strong>'+escape(item.title)+'</strong><small>'+escape(item.description)+'</small>'+
     '<span class="catalog-card-action">'+(item.kind==='milestone'?'查看研究进展':'打开功能')+' ↗</span></button>'
    ).join('')+'</div></section>';
  }).join('');
  count.textContent='找到 '+shown+' 个功能入口';
  empty.hidden=shown!==0;
 }
 chips.addEventListener('click',e=>{
  const b=e.target.closest('[data-filter]');if(!b)return;
  active=b.dataset.filter;
  chips.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  render();
 });
 input.addEventListener('input',render);
 root.addEventListener('click',e=>{
  const b=e.target.closest('[data-feature]');if(!b)return;
  const item=FEATURE_SECTIONS.flatMap(s=>s.items).find(x=>x.id===b.dataset.feature);
  if(item)openFeature(item);
 });
 render();
 return {focusSearch(){input.focus();},showAll(){active='all';input.value='';chips.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.filter==='all')));render();}};
}
