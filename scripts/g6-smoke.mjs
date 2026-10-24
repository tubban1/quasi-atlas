import{chromium}from'playwright';import assert from'node:assert/strict';
const url=process.env.QUASI_URL||'http://127.0.0.1:5188/';
let browser;try{browser=await chromium.launch({channel:'chrome',headless:true})}catch{browser=await chromium.launch({headless:true})}
try{
 const p=await browser.newPage({viewport:{width:1250,height:860}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url,{waitUntil:'domcontentloaded'});
 await p.locator('.topic-card[data-launch="mountain"]').click();
 await p.locator('.mode[data-mode="research"]').click();
 assert.equal(await p.locator('#transferCheck').getAttribute('open'),null);
 await p.locator('#transferCheck summary').click();
 assert.equal(await p.locator('.transfer-question').count(),6);
 await p.locator('.transfer-submit').click();
 assert.match(await p.locator('#transferResult').textContent(),/完成全部六题/);
 for(const [i,answer] of [1,1,1,1,0,0].entries()){
  await p.locator('.transfer-question').nth(i).locator('input[type="radio"]').nth(answer).check();
 }
 await p.locator('.transfer-submit').click();
 assert.match(await p.locator('#transferResult').textContent(),/答对 6\/6/);
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({site:url,transferQuestions:6,localScore:'6/6',errors},null,2));
}finally{await browser.close()}
