// G6 prototype: offline educational transfer check, zero PII, no telemetry.
// Items are original, unrelated wordings; user responses remain local unless exported voluntarily.
export const TRANSFER_SCHEMA='quasi-atlas.transfer-evaluation/0.1';
export const TRANSFER_ITEMS=Object.freeze([
 {id:'same-height',area:'level-set',question:'地图上的两处地点温度相同，它们必须紧挨着吗？',
  choices:['是，同数值的点必须连续','否，同数值可能落在不同位置','只要两点温度相同，就是数学证明'],correct:1},
 {id:'viewport',area:'scope',question:'一条数学曲线离开屏幕边缘，能断定它会延伸到无穷远吗？',
  choices:['能','不能，只知道离开这个有限窗口','能，只要网格够密'],correct:1},
 {id:'repeatability',area:'evidence',question:'Mac 和 Windows 算出相同数字，这证明了算法一定正确吗？',
  choices:['是','否，它只证明受测条件下的复现一致性','它能代替同行评审'],correct:1},
 {id:'simulation',area:'provenance',question:'一个 Wi-Fi 覆盖演示没有接入真实测量设备，展示的数据是什么？',
  choices:['真实信号测量','合成模型的数值','实时地图服务'],correct:1},
 {id:'holes',area:'topology',question:'一块环状高地区域只有一个连通块，但中间有空洞。它的 H0 和 H1 分别是什么？',
  choices:['1 和 1','2 和 0','0 和 1'],correct:0},
 {id:'paper',area:'research',question:'把一篇论文的结论用于不同函数前，最重要的是什么？',
  choices:['先确认原定理的适用假设','只看图片相似','只要计算机运行就能推广'],correct:0}
]);
export function scoreTransfer(responses){
 if(!Array.isArray(responses)||responses.length!==TRANSFER_ITEMS.length||responses.some(x=>!Number.isInteger(x)||x<0||x>2))
  throw new RangeError('Exactly six multiple-choice indices required');
 const perArea=TRANSFER_ITEMS.map((q,i)=>({id:q.id,area:q.area,correct:responses[i]===q.correct}));
 const count=perArea.filter(x=>x.correct).length;
 return {schema:TRANSFER_SCHEMA,score:count,total:TRANSFER_ITEMS.length,percent:Math.round(100*count/TRANSFER_ITEMS.length),
  perArea,privacy:'local-only',credentialed:false,respondentIdentity:null,
  warning:'One simulated grading session cannot establish educational effectiveness; no participants were tested.'};
}
