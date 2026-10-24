// Scientific gate must fail closed if a deployment accidentally omits tests.
import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const required=['contract.test.js','golden.test.js','life.test.js','math.test.js','verify.test.js','notebook.test.js','repro.test.js','g3-h0.test.js','g3-gudhi.test.js','g3-h1.test.js','g4-radial.test.js','g5-sweep.test.js','g6-transfer.test.js','g6-release.test.js'];
let found=[];
try{found=readdirSync(join(root,'tests')).filter(f=>f.endsWith('.test.js'));}catch(e){console.error('FATAL: Tests directory not bundled for build');process.exit(2);}
const missing=required.filter(x=>!found.includes(x));
if(missing.length){console.error('FATAL: Mandatory tests missing:',missing.join(', '));process.exit(2);}
const args=['--test','--test-reporter=tap',...found.map(f=>join(root,'tests',f))];
const p=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:16*1024*1024,timeout:90000});
process.stdout.write(p.stdout||'');process.stderr.write(p.stderr||'');
if(p.error||p.status!==0){console.error('FATAL: mathematical or educational test failed');process.exit(1);}
const n=Number((p.stdout||'').match(/^# tests ([0-9]+)$/m)?.[1]||0);
const passed=Number((p.stdout||'').match(/^# pass ([0-9]+)$/m)?.[1]||0);
const failed=Number((p.stdout||'').match(/^# fail ([0-9]+)$/m)?.[1]||-1);
if(n<91||passed!==n||failed!==0){console.error('FATAL: insufficient or missing tests', {n,passed,failed});process.exit(2);}
console.log('SCIENTIFIC_GATE_PASS '+passed+'/'+n+' across '+found.length+' files');
const canary=spawnSync(process.execPath,['scripts/canary-receipt.mjs'],{cwd:root,encoding:'utf8',timeout:20000});
if(canary.status!==0||!canary.stdout.includes('G2_CANARY_RECEIPT ')){console.error('CANARY_GATE_FAILED',canary.stderr||canary.stdout);process.exit(3);}
process.stdout.write(canary.stdout);
