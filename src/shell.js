import {LIFE_LESSONS} from './life-content.js';

const MILESTONES=[
 {id:'G0',state:'done',badge:'基础已实现',title:'可信的数学地基',summary:'定义模型，保留数值边界，让每次计算有来源。',details:['12 组解析几何基准与数学测试','有限域模型、参数单位与 SHA-256 实验哈希','E0 教学 / E1 数值观察的明确区分'],foot:'完成的是工程基础，不代表数学证明。'},
 {id:'G1',state:'progress',badge:'体验版已上线 · 待教学实测',title:'从生活走进数学',summary:'从熟悉场景出发，先猜，再操作，最后理解模型的局限。',details:['6 个完整的生活互动入口','预测、解释、找反例、学习 JSON','仍需真实数据溯源、教师审核和用户理解评估'],foot:'当前全部生活素材采用合成教学模型。'},
 {id:'G2',state:'progress',badge:'G2 Beta · 三平台复算通过',title:'发现日志与复现实验',summary:'保存问题、预测与结果，比较快照，在本机重新计算并导出完整实验包。',details:['Notebook 1.0、不可变快照与 stale 提醒','参数、E1 观测及来源哈希，JSON/CSV/SVG 和文件导入','同一版本的 headless CLI / 工作线程复算与差异分类'],foot:'Mac / Windows / Linux 同引擎固定样例复算通过；独立数学算法对照、跨引擎版本迁移尚未通过科研验收。'},
 {id:'G3',state:'progress',badge:'G3.1 Beta · H0 可试用',title:'深入拓扑结构',summary:'从屏幕上的曲线进入离散 H0 连通区域的出生、合并与持久区间。',details:['H0 4 邻接顶点网格算法，30 组 × 16 阈值 = 480 项独立 BFS 参考检查','G3.2 下一步：H1 洞结构与跨分辨率持续图','GUDHI 3.11.0 H0 参考已通过；G3 仍需 H1、TTK 与退化事件审阅'],foot:'有限顶点图 H0 的 GUDHI 参考验证通过；H1、TTK 和完整科研级 Gate G3 尚未通过。'},
 {id:'G4',state:'planned',badge:'规划中',title:'可认证的数值实验',summary:'限定函数类别，严格区分已认证、无法判断与不满足条件。',details:['区间运算与数值误差包络','驻点存在/唯一/排除的机器可审证书','UNKNOWN / TIMEOUT 不准被误报为通过'],foot:'没有 E3 认证或 E4 数学证明能力。'},
 {id:'G5',state:'planned',badge:'规划中',title:'准周期研究专题',summary:'在具体数学假设下研究长程等值线与参数变化。',details:['准周期场频率矩阵与相位控制','论文复现与窗口扩张实验','参数扫描与版本化研究数据'],foot:'有限窗口边界穿越不证明无限域轨迹。'},
 {id:'G6',state:'planned',badge:'规划中',title:'开放合作与正式评审',summary:'让教师、学生与研究者在同一标准下交流发现。',details:['教学材料与研究审阅机制','无障碍、许可审计与发布门禁','社区研究任务与可复用课程'],foot:'发布必须依赖数学与教育方面的独立审核。'}
];
const EVIDENCE=[
 ['E0','教学示意','模型可帮助理解现象，不宣称来自现实测量。','available'],
 ['E1','计算观察','有限区域内的数值结果；目前真实支持。','available'],
 ['E2','多法检查','独立算法 / 条件明确的稳定性比对。','planned'],
 ['E3','认证数值结论','限定范围内通过可独立检查的证书。','planned'],
 ['E4','数学证明','有明确命题、前提及可审查的证明链。','planned']
];
const $=(q)=>document.querySelector(q);
const $$=(q)=>[...document.querySelectorAll(q)];
function illustration(id){
  const common='viewBox="0 0 450 210" class="topic-art" role="presentation" aria-hidden="true"';
  const inner={
    mountain:'<g fill="none" stroke-width="2"><path d="M30 165Q95 40 210 65T420 130" stroke="#3c837e" opacity=".4"/><path d="M45 165Q114 68 211 83T401 135" stroke="#68a69a"/><path d="M64 167Q127 95 217 101T381 140" stroke="#b0d7a3"/><path d="M93 169Q151 117 220 118T353 148" stroke="#e2e5b2"/><path d="M125 167Q171 140 226 136T322 154" stroke="#fffae2"/></g><path d="M0 183Q90 120 170 177T450 169V210H0Z" fill="#bedabb" opacity=".4"/>',
    puddles:'<path d="M0 160Q106 126 184 166T450 160V210H0Z" fill="#dbeccf" opacity=".5"/><path d="M50 126C25 85 104 50 151 86S205 148 136 157S63 148 50 126" fill="#7bc7ba" stroke="#e3fcf3" stroke-width="3"/><path d="M263 122C233 89 291 56 355 90S415 151 354 155S274 149 263 122" fill="#55afa8" stroke="#c1eee2" stroke-width="3"/><path d="M150 117Q217 146 292 119" fill="none" stroke="#fbf1b1" stroke-width="3" stroke-dasharray="5 9"/>',
    weather:'<g fill="none" stroke-width="20" stroke-linecap="round" opacity=".9"><path d="M-14 60Q97 5 184 55T460 28" stroke="#dcad92"/><path d="M-20 112Q111 41 211 100T464 78" stroke="#f1d8a0"/><path d="M-14 160Q113 93 226 156T464 137" stroke="#a3cfb3"/><path d="M-12 205Q112 136 245 198T460 191" stroke="#5ba4aa"/></g><g stroke="#fff" stroke-width="1.5" opacity=".65" fill="none"><path d="M-10 81Q110 18 198 77T460 55"/><path d="M-10 136Q123 75 214 124T460 109"/></g>',
    beats:'<path d="M0 106H450" stroke="#efffe6" opacity=".35"/><path d="M0 106 '+Array.from({length:200},(_,i)=>{const x=i*450/199,env=Math.cos(x*.021),y=106-61*env*Math.sin(x*.29);return 'L'+x.toFixed(1)+' '+y.toFixed(1)}).join(' ')+'" fill="none" stroke="#f6e2a6" stroke-width="3"/><path d="M0 172 '+Array.from({length:200},(_,i)=>{const x=i*450/199,y=171-18*Math.sin(x*.26);return 'L'+x.toFixed(1)+' '+y.toFixed(1)}).join(' ')+'" fill="none" stroke="#8ecebd" stroke-width="2.3"/>',
    moire:'<g fill="none" stroke="#c7ecca" stroke-width="1.7">'+Array.from({length:12},(_,i)=>'<ellipse cx="235" cy="110" rx="'+(15+i*15)+'" ry="'+(14+i*11)+'" transform="rotate(-18 235 110)"/>').join('')+'</g><g fill="none" stroke="#7dcbb7" stroke-width="1.4" opacity=".55">'+Array.from({length:8},(_,i)=>'<ellipse cx="235" cy="110" rx="'+(25+i*24)+'" ry="'+(22+i*14)+'" transform="rotate(25 235 110)"/>').join('')+'</g>',
    wifi:'<g fill="none" stroke="#b8deae" stroke-width="2.2"><circle cx="155" cy="102" r="23"/><circle cx="155" cy="102" r="54"/><circle cx="155" cy="102" r="90"/><circle cx="155" cy="102" r="128"/><circle cx="335" cy="128" r="20"/><circle cx="335" cy="128" r="48"/><circle cx="335" cy="128" r="85"/></g><g fill="#f9f0ba"><circle cx="155" cy="102" r="9"/><circle cx="335" cy="128" r="9"/></g>'
  };
  return '<svg '+common+'>'+inner[id]+'</svg>';
}
export function setupAppShell({initialSearch,life,activateResearch,showExperiment}){
  const lessonCards=LIFE_LESSONS.map((l,i)=>{
    const category=['MAPPING / TERRAIN','THRESHOLD / CONNECTIVITY','FIELD / CLIMATE','SIGNAL / RHYTHM','PATTERN / SAMPLING','FIELD / NETWORK'][i];
    const color=['sage','aqua','sunset','sound','mint','lagoon'][i];
    return '<button class="topic-card topic-'+color+'" type="button" data-launch="'+l.id+'" aria-label="进入 '+l.title+'">'+
      '<span class="topic-card-head"><span>'+category+'</span><span class="topic-index">'+l.number+' / 06</span></span>'+
      '<span class="topic-illustration">'+illustration(l.id)+'</span>'+
      '<span class="topic-card-bottom"><span><strong>'+l.title+'</strong><small>'+l.subtitle+'</small></span><span class="card-link" aria-hidden="true">↗</span></span>'+
     '</button>';
  }).join('');
  $('#homeTopicGrid').innerHTML=lessonCards;
  $('#roadmapTimeline').innerHTML=MILESTONES.map((g,i)=>'<details class="milestone milestone-'+g.state+'"'+(i===0?' open':'')+'>'+
   '<summary><span class="milestone-number">'+g.id+'</span><span class="milestone-content"><span class="milestone-tag">'+g.badge+'</span><strong>'+g.title+'</strong><span class="milestone-summary">'+g.summary+'</span></span><span class="milestone-expand" aria-hidden="true">＋</span></summary>'+
   '<div class="milestone-extra"><ul>'+g.details.map(s=>'<li>'+s+'</li>').join('')+'</ul><p>'+g.foot+'</p></div></details>').join('');
  $('#evidenceGrid').innerHTML=EVIDENCE.map(x=>'<div class="evidence-cell '+x[3]+'"><span>'+x[0]+'</span><strong>'+x[1]+'</strong><small>'+x[2]+'</small></div>').join('');
  const allowed=new Set(['home','studio','roadmap']);
  function navigate(screen,{scroll=true,historyMode='push'}={}){
    const next=allowed.has(screen)?screen:'home';
    const screens={home:$('#homeScreen'),studio:$('#studioScreen'),roadmap:$('#roadmapScreen')};
    const previous=document.body.dataset.page;
    Object.entries(screens).forEach(([k,e])=>{e.hidden=k!==next;});
    $$('[data-screen]').forEach(b=>{const active=b.dataset.screen===next;b.classList.toggle('active',active);if(b.classList.contains('nav-link')){if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}});
    document.body.dataset.page=next;
    const params=new URLSearchParams(location.search);
    if(next==='home'){params.delete('screen');params.delete('life');}
    else params.set('screen',next);
    const url=location.pathname+(params.size?'?'+params.toString():'');
    if(historyMode!=='none')history[historyMode==='push'&&previous!==next?'pushState':'replaceState'](null,'',url);
    if(scroll)window.scrollTo({top:0,behavior:'instant'});
    if(next==='studio'){requestAnimationFrame(()=>{window.dispatchEvent(new Event('resize'));});}
  }
  $$('[data-screen]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.screen)));
  $$('[data-launch]').forEach(b=>b.addEventListener('click',()=>{navigate('studio');life.show(b.dataset.launch);document.querySelector('.mode[data-mode="learn"]')?.click();}));
  $$('[data-launch-mode]').forEach(b=>b.addEventListener('click',()=>{
    const mode=b.dataset.launchMode;
    navigate('studio');
    if(mode==='research'){life.hide();showExperiment('quasi');}
    else if(!life.current)life.show('mountain');
    activateResearch(mode);
  }));
  const requested=initialSearch.get('screen');
  if(requested==='roadmap')navigate('roadmap',{scroll:false,historyMode:'none'});
  else if(requested==='studio'||initialSearch.has('life')||initialSearch.has('world'))navigate('studio',{scroll:false,historyMode:'none'});
  else navigate('home',{scroll:false,historyMode:'none'});
  window.addEventListener('popstate',()=>{const target=new URLSearchParams(location.search).get('screen')||'home';navigate(target,{scroll:false,historyMode:'none'});});
  return {navigate};
}
