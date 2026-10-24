import {TRANSFER_ITEMS,scoreTransfer} from './transfer-evaluation.js';
// Unrecorded, accessible offline formative check. No names, network or persistence.
export function setupTransferUI(){
 const root=document.querySelector('#focusResearch');if(!root)return;
 const details=document.createElement('details');details.id='transferCheck';details.className='h0-research';
 const summary=document.createElement('summary');summary.textContent='✧ 学过的数学，能用在别处吗？ · 6 题自测';
 details.append(summary);
 const body=document.createElement('div');body.className='h0-research-body';
 const intro=document.createElement('p');intro.textContent='这是免费的迁移练习，不是考试或正式教学研究。答案只在本机计算，不会上传或存储。';body.append(intro);
 const choices=[];
 for(const [i,q] of TRANSFER_ITEMS.entries()){
  const group=document.createElement('fieldset');group.className='transfer-question';
  const legend=document.createElement('legend');legend.textContent=(i+1)+'. '+q.question;group.append(legend);
  for(const [j,label] of q.choices.entries()){
   const line=document.createElement('label');const radio=document.createElement('input');radio.type='radio';radio.name='transfer-'+i;radio.value=String(j);
   const span=document.createElement('span');span.textContent=label;line.append(radio,span);group.append(line);
  }
  choices.push(group);body.append(group);
 }
 const submit=document.createElement('button');submit.type='button';submit.className='transfer-submit';submit.textContent='检查我的理解';
 const output=document.createElement('p');output.id='transferResult';output.setAttribute('role','status');output.setAttribute('aria-live','polite');
 submit.addEventListener('click',()=>{
  const answers=choices.map((group)=>{const selected=group.querySelector('input:checked');return selected?Number(selected.value):null;});
  if(answers.some(x=>x===null)){output.textContent='请先完成全部六题；不需要注册。';return;}
  const result=scoreTransfer(answers);
  output.textContent='答对 '+result.score+'/6。'+(result.score===6?'理解很全面；可以继续提出新问题。':'可再次检查不熟悉的概念。')+' 这只是即时练习，不代表真实教育效果得到验证。';
  for(let i=0;i<choices.length;i++)choices[i].dataset.correct=String(result.perArea[i].correct);
 });
 body.append(submit,output);details.append(body);root.append(details);
}
