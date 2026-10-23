/**
 * Life Lens G1 — six authored, explicitly synthetic math experiences.
 * All UI copy is educational; no external real-world data is claimed.
 * predictionIndex is a reproducible knowledge-check answer, not a research claim.
 */
export const LIFE_LESSONS = Object.freeze([
  {id:'mountain',icon:'⛰',number:'01',title:'山路为什么绕弯？',subtitle:'地形图 · 等高线',model:'archipelago',level:.55,phase:0,
   question:'山坡上两条等高线靠得很近，通常意味着什么？',
   choices:['海拔变化更快，坡可能更陡','这里一定有一条河','山顶一定在两线中间'],answer:0,
   experiment:'调节「同一高度」的阈值，观察模拟山地被不同高度切出的轮廓。',
   control:'等高线参考高度',min:-.2,max:2.1,step:.05,value:.55,units:'模型单位',controlType:'level',
   insight:'地图上的等高线连接了海拔相同的点。相同高度间距下，线越密，地形往往越陡。',
   counterexample:'等高线不告诉你哪里有路，也不证明“沿等高线走是最快上山路线”。',
   modelNote:'合成高斯山体，并非真实地形数据。数值单位并不是瑞士实际海拔。',
   formula:'h(x,y) = 高斯山峰叠加 + 柔和起伏；等高线为 h(x,y)=c',
   researchPrompt:'把网格调粗，狭窄的山谷会不会消失？做一次三档采样检验。'},
  {id:'puddles',icon:'◉',number:'02',title:'雨后水坑为什么连在一起？',subtitle:'阈值 · 连通性',model:'archipelago',level:.25,phase:0,
   question:'把地形中模拟水位缓慢抬高，原本分开的低洼积水区域可能怎样变化？',
   choices:['永远保持分开','可能经过一条低鞍部后连通','每个水坑都变成圆形'],answer:1,
   experiment:'用同一张合成高度地图探究 h(x,y)≤c 的积水区域。图中白线是边界，填色仍是高度而不是积水面积。',
   control:'示意水位',min:-.25,max:2,step:.05,value:.25,units:'模型单位',controlType:'level',
   insight:'数学上，水覆盖的示意区域可以写成 { (x,y) | h(x,y)≤c }。当 c 增大，原本不相连的集合可能经过山口连成一片。',
   counterexample:'现实的水会流动，还受排水、堤坝、渗透和时间影响。“低于水位”并不一定真的有积水。',
   modelNote:'合成阈值模型；不是水动力学预报或城市内涝预测。',
   formula:'S(c) = {(x,y)∈D | h(x,y)≤c}；连接事件需研究 S(c)，不只是白色等值线数量',
   researchPrompt:'找到看似刚连通的位置，并检查它在精细网格中是否仍存在。'},
  {id:'weather',icon:'☼',number:'03',title:'天气地图上的彩色带是什么？',subtitle:'温度场 · 等温线',model:'temperature',level:17,phase:0,
   question:'一条标着 17°C 的等温线表示什么？',
   choices:['整条线上的模拟温度都约为17°C','线里面一定没有风','线两边的天气永远不同'],answer:0,
   experiment:'这是模拟城市温度场。移动温度阈值，观察“相同温度的地点”如何构成边界。',
   control:'模拟温度阈值',min:8,max:26,step:.5,value:17,units:'°C（合成）',controlType:'level',
   insight:'温度是每个位置的数值 T(x,y)，等温线 T(x,y)=c 是温度相同的点的连接。',
   counterexample:'即使只有几个测站，也能插值出漂亮的色块；图面看起来细腻，不代表测量同样精确。',
   modelNote:'完全合成的天气教学数据，不含真实观测，不能用于预报。',
   formula:'T(x,y)=17 + 局部暖区 − 局部冷区 + 低频起伏（单位为示意 °C）',
   researchPrompt:'改变采样精度并观察：你能区分地图的颜色分辨率与测站精度吗？'},
  {id:'beats',icon:'♫',number:'04',title:'为什么两段声音忽大忽小？',subtitle:'拍频 · 时间与频率',model:null,level:0,phase:0,
   question:'两种接近的音频同时播放，频率差更小，通常会怎样影响拍频？',
   choices:['起伏会更慢','起伏会更快','必然没有起伏'],answer:0,
   experiment:'下面是两个 1D 时间波形及其叠加。改变频率差，注意包络起伏的周期。',
   control:'频率差 Δf',min:.4,max:4,step:.1,value:1.4,units:'Hz',controlType:'beat',
   insight:'两个相近正弦波相加，振幅会周期性增强和抵消。若频率差为 Δf，拍频为 |Δf|。',
   counterexample:'二维地图中的摩尔纹不是“声音的另一张地图”。真实房间里听到的音量还会随空间反射改变。',
   modelNote:'纯数学的 1D 合成波形；不播放音频，不涉及真实麦克风数据。',
   formula:'cos(2πf₁t)+cos(2πf₂t)=2cos(π(f₁−f₂)t)cos(π(f₁+f₂)t)',
   researchPrompt:'把频率差设为一半。包络起伏的时间间距会变为多少？'},
  {id:'moire',icon:'◎',number:'05',title:'拍屏幕为什么出现波纹？',subtitle:'摩尔纹 · 采样与周期',model:'moire',level:.2,phase:0,
   question:'两层几乎平行的周期纹理旋转一点点，通常会出现什么？',
   choices:['必然变成纯黑','所有周期性都消失','可能出现比原纹理更宽大的拍纹'],answer:2,
   experiment:'改变两组纹理的相对相位，观察大尺度颜色节律如何移动。',
   control:'网格相位差',min:-3,max:3,step:.1,value:0,units:'弧度',controlType:'phase',
   insight:'叠加相近的周期结构会产生大尺度花纹，这是一种空间干涉与取样现象。',
   counterexample:'手机照片的摩尔纹还受传感器取样、去马赛克、显示子像素影响。图案不一定真的在物体表面。',
   modelNote:'周期晶格的合成数学模型，不是实际摄像头成像仿真。',
   formula:'f(x,y)=Σcos(kᵢ·(x,y)+φᵢ)，改变 φ 会移动干涉图案',
   researchPrompt:'在不同缩放和精度下观察：哪些纹理是数学波产生的，哪些可能只是像素混叠？'},
  {id:'wifi',icon:'◈',number:'06',title:'为什么房间里有 Wi‑Fi 盲区？',subtitle:'信号场 · 阈值',model:'wifi',level:1.15,phase:0,
   question:'真实家中 Wi‑Fi 信号强弱，是否只由离路由器远近决定？',
   choices:['是的，距离是唯一原因','不是，还受墙体、反射和干扰影响','所有角落完全相同'],answer:1,
   experiment:'这是两处假想信号源的合成强度分布。移动阈值，看看哪些区域可能落到“弱覆盖”一侧。',
   control:'示意强度阈值',min:.15,max:2.5,step:.05,value:1.15,units:'归一化强度',controlType:'level',
   insight:'无线信号可以用位置的场强 I(x,y) 描述；阈值轮廓能帮助识别“强/弱区域”的数学边界。',
   counterexample:'真实信号不能只靠画两个亮点推算。墙体材料、多路径反射、频率、干扰、设备天线都会改变结果。',
   modelNote:'教学模拟，不是 Wi‑Fi 测速、定位或真实覆盖测量。',
   formula:'I(x,y)=合成衰减源 A(x,y)+B(x,y)+弱起伏项；不等同于真实无线电传播方程',
   researchPrompt:'把阈值调高：弱覆盖的范围会变大吗？改变视窗是否改变你的结论？'}
]);
export function getLifeLesson(id){return LIFE_LESSONS.find(x=>x.id===id)||null;}
export function scorePrediction(lessonId,choice){const l=getLifeLesson(lessonId);if(!l||!Number.isInteger(choice)||choice<0||choice>=l.choices.length)return null;return choice===l.answer;}
export function beatSamples(delta=1.4,f=9,duration=3.6,count=540){
 if(!Number.isFinite(delta)||delta<0||delta>8||!Number.isFinite(f)||f<=0||count<2||count>2000)throw new Error('invalid beat parameters');
 return Array.from({length:count},(_,i)=>{const t=duration*i/(count-1);const a=Math.cos(2*Math.PI*f*t),b=Math.cos(2*Math.PI*(f+delta)*t);return {t,a,b,sum:a+b};});
}
export function lifeReport({lessonId,prediction=null,value,reflection=''}) {
 const lesson=getLifeLesson(lessonId);if(!lesson)throw new Error('Unknown lesson');
 if(!Number.isFinite(value)||value<lesson.min||value>lesson.max)throw new Error('Invalid control value');
 if(reflection.length>2500)throw new Error('Reflection too long');
 return {schema:'quasi-atlas.learning/1.0',version:'G1',lesson:{id:lesson.id,title:lesson.title,kind:lesson.model?'scalar-field-2d':'signal-1d',source:'synthetic-teaching-model',model:lesson.model},value,units:lesson.units,prediction,predictionCorrect:prediction===null?null:scorePrediction(lessonId,prediction),explanation:lesson.insight,modelLimits:lesson.counterexample,modelNote:lesson.modelNote,reflection,scientificStatus:'E0 educational illustration; not observational field measurements or a proof'};
}
