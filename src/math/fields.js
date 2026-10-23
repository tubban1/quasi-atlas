export const PRESETS = [
{ id:'temperature', code:'LIFE 03 / TEMPERATURE', icon:'☼', title:'模拟温度场', short:'等温线 · 合成教学数据', subtitle:'相同温度的地点，组成一条等温线。', question:'17°C 的等温线，会沿着什么样的路径经过城市？', hint:'调整温度阈值，比较多个暖区和冷区。', kind:'temperature', min:8,max:26, formula:'T(x,y)=17+6e^-(((x+5)²+(y-2)²)/65)-5e^-(((x-8)²+(y+4)²)/55)+3sin(0.13x)cos(0.17y), synthetic °C' },
{ id:'wifi', code:'LIFE 06 / SIGNAL FIELD', icon:'◈', title:'模拟信号覆盖', short:'信号强度 · 合成教学数据', subtitle:'示意信号场，不是无线电实测。', question:'改变最低信号强度门槛，薄弱区域会怎样变化？', hint:'观察等强度线与窗口边界的关系。', kind:'wifi', min:.15,max:2.5, formula:'I(x,y)=2.2e^-r₁²/130+1.75e^-r₂²/90+0.12cos(0.4x)cos(0.27y); normalized synthetic intensity' },
{ id:'quasi', code:'WORLD 01 / QUASIPERIODIC', icon:'◉', title:'不可重复的海岸', short:'准周期 · 四波干涉', subtitle:'相似的形状，一次也不完全重演。', question:'为什么这些“岛屿”看起来在重复，却始终无法完全拼成一张周期壁纸？', hint:'把探索尺度增大，观察局部相似结构如何在更大范围内偏移。', kind:'waves', waves:[[1,0,1,0],[0,1,1,0],[Math.SQRT2,Math.sqrt(3),1,0],[Math.sqrt(5),-Math.sqrt(7),1,0]], min:-3.4,max:3.4, formula:'f(x,y) = cos(x) + cos(y) + cos(√2x + √3y) + cos(√5x − √7y)' },
{ id:'moire', code:'WORLD 02 / MOIRÉ', icon:'◎', title:'两张重叠的宇宙', short:'摩尔纹 · 旋转晶格', subtitle:'当两个重复的世界稍微错开。', question:'只调整一个波的相位，为什么大范围的图案会移动得那么明显？', hint:'在相位控制条上缓慢移动，观察局部图案与整体纹理的不同反应。', kind:'waves', waves:[[1,0,1,0],[0,1,1,0],[.955,.296,1,0],[-.296,.955,1,0]], min:-3.4,max:3.4, formula:'f(x,y) = cos(x) + cos(y) + cos(x cos θ + y sin θ + φ) + cos(−x sin θ + y cos θ),  θ ≈ 17.2°' },
{ id:'lattice', code:'WORLD 03 / CRYSTAL', icon:'✧', title:'六角晶体花园', short:'晶格 · 对称与破缺', subtitle:'几何秩序中潜伏着变化。', question:'保持相同的高度，旋转相位后还有哪些对称性留了下来？', hint:'留意三组相隔 60° 的波，它们共同生成了六边形结构。', kind:'waves', waves:[[1,0,1,0],[.5,.8660254,1,0],[-.5,.8660254,1,0]], min:-2.5,max:2.5, formula:'f(x,y) = cos(x) + cos(x/2 + √3y/2) + cos(−x/2 + √3y/2)' },
{ id:'archipelago', code:'WORLD 04 / ARCHIPELAGO', icon:'❖', title:'高斯群岛', short:'径向基函数 · 合并', subtitle:'调高水位，岛屿开始分离。', question:'抬高等值线高度时，哪些岛屿先断开？可以预测临界高度吗？', hint:'尝试沿事件轴点击跳转，然后在不同采样精度下验证。',kind:'islands', min:-.9,max:2.9, formula:'f(x,y) = Σᵢ aᵢ exp(−((x−xᵢ)²+(y−yᵢ)²)/σᵢ²) − 0.25 + 0.12 sin(0.7x+φ)cos(0.9y)' },
{ id:'saddle', code:'WORLD 05 / SADDLE', icon:'⌘', title:'山口与分岔', short:'临界点 · 拓扑转变', subtitle:'只差一瞬间，连接便会反转。', question:'当高度恰好穿过 0 时，双曲线朝向为什么突然改变？', hint:'观察 x²−y² 的正负区域，并比较 0 的上下两侧。', kind:'saddle', min:-2.6,max:2.6, formula:'f(x,y) = 0.025(x² − y²) + 0.11 cos(0.8x + φ)' }
];
export function getPreset(id) { return PRESETS.find(p=>p.id===id) || PRESETS[0]; }
export function evaluateField(x,y,preset,phase=0) {
  if(preset.kind==='temperature')return 17+6*Math.exp(-((x+5)**2+(y-2)**2)/65)-5*Math.exp(-((x-8)**2+(y+4)**2)/55)+3*Math.sin(.13*x)*Math.cos(.17*y);
  if(preset.kind==='wifi')return 2.2*Math.exp(-((x+7)**2+(y-4)**2)/130)+1.75*Math.exp(-((x-8)**2+(y+6)**2)/90)+.12*Math.cos(.4*x)*Math.cos(.27*y)+.23;
  if(preset.kind==='waves') {let sum=0;for(let i=0;i<preset.waves.length;i++){const [kx,ky,a,p]=preset.waves[i];sum+=a*Math.cos(kx*x+ky*y+p+(i===2?phase:0));}return sum;}
  if(preset.kind==='saddle')return .025*(x*x-y*y)+.11*Math.cos(.8*x+phase);
  let val=-.25+.12*Math.sin(.7*x+phase)*Math.cos(.9*y);
  const peaks=[[-8,-7,1.95,6.0],[-2,5,2.45,8.8],[9,0,1.7,5.2],[4,-8,1.92,5.5],[-11,9,1.4,6.4],[13,11,1.7,4.2],[-1,-15,1.8,6.3]];
  for(const [px,py,a,r] of peaks){const dx=x-px,dy=y-py;val+=a*Math.exp(-(dx*dx+dy*dy)/(r*r));}return val;
}
