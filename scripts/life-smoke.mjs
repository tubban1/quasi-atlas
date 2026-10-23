import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const url=process.env.QUASI_URL||'http://127.0.0.1:5188/';
let browser;try{browser=await chromium.launch({channel:'chrome',headless:true});}catch{browser=await chromium.launch({headless:true});}
const errs=[],log={url,topics:[],exports:[],mobile:'pending'};
try {
 const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
 page.on('pageerror',e=>errs.push(String(e)));
 page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.waitForSelector('.life-tile');
 for(const id of ['mountain','puddles','weather','beats','moire','wifi']){
   await page.locator('.life-tile[data-life="'+id+'"]').click();
   assert.equal(await page.locator('.life-tile[data-life="'+id+'"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#lifeLab').isVisible(),true);
   const first=await page.locator('#lifeChoices button').first();
   await first.click();
   assert.ok((await page.locator('#lifeFeedback').textContent()).length>4);
   const slider=page.locator('#lifeSlider');
   const newValue=await slider.evaluate(el=>Number(el.min)+.6*(Number(el.max)-Number(el.min)));
   await slider.evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));},newValue);
   assert.ok((await page.locator('#lifeSliderValue').textContent()).length>0);
   if(id==='beats'){
      assert.equal(await page.locator('#beatStage').isVisible(),true);
      assert.ok(await page.locator('#beatPlot path').count()>=4);
      assert.equal(await page.locator('#beatStage').getAttribute('aria-label')!==null,true);
   }else{
      assert.equal(await page.locator('#beatStage').isVisible(),false);
      await page.waitForFunction(()=>document.querySelector('#numericStatus')?.textContent==='计算完成',{timeout:20000});
   }
   const wait=page.waitForEvent('download',{timeout:10000});
   await page.locator('#lifeExport').click();
   const file=await wait;
   const data=JSON.parse(await readFile(await file.path(),'utf8'));
   assert.equal(data.schema,'quasi-atlas.learning/1.0');
   assert.equal(data.lesson.id,id);
   assert.equal(data.lesson.source,'synthetic-teaching-model');
   assert.match(data.scientificStatus,/E0/);
   assert.equal(data.lesson.kind,id==='beats'?'signal-1d':'scalar-field-2d');
   log.topics.push(id);log.exports.push(data.lesson.kind);
   if(id==='puddles'){
     await page.locator('#lifeResearch').click();
     assert.equal(await page.locator('.mode[data-mode="research"]').getAttribute('aria-selected'),'true');
   }
 }
 await page.screenshot({path:'/tmp/quasi-g1-desktop.png',fullPage:true});
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 mobile.on('pageerror',e=>errs.push('mobile:'+String(e)));
 await mobile.goto(url,{waitUntil:'domcontentloaded'});
 await mobile.locator('.life-tile[data-life="weather"]').click();
 assert.equal(await mobile.locator('#lifeLab').isVisible(),true);
 await mobile.screenshot({path:'/tmp/quasi-g1-mobile.png',fullPage:true});
 log.mobile='pass';
 assert.deepEqual(errs,[]);
 console.log(JSON.stringify({...log,pageErrors:errs},null,2));
}finally{await browser.close();}
