// Node-only canonical build inputs. Included by Vite config and headless replay CLI.
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,join} from 'node:path';
import {PROVENANCE_SCHEMA} from '../src/repro-metadata.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const mathSources=['src/math/fields.js','src/math/contours.js','src/math/contract.js','src/notebook-core.js'];
function sha(bytes){return 'sha256:'+createHash('sha256').update(bytes).digest('hex');}
export async function getNodeBuildProvenance(){
 const h=createHash('sha256');
 for(const path of mathSources){h.update(path,'utf8');h.update('\0');h.update(await readFile(join(root,path)));h.update('\0');}
 const pkg=JSON.parse(await readFile(join(root,'package.json'),'utf8'));
 let commit=process.env.VERCEL_GIT_COMMIT_SHA||process.env.GITHUB_SHA||'';
 if(!/^[a-f0-9]{40}$/i.test(commit)){try{commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',timeout:2500}).trim();}catch{commit='unavailable';}}
 if(!/^[a-f0-9]{40}$/i.test(commit))commit='unavailable';
 return {schema:PROVENANCE_SCHEMA,gitCommit:commit.toLowerCase(),
  lockSha256:sha(await readFile(join(root,'package-lock.json'))),
  mathSourceSha256:'sha256:'+h.digest('hex'),packageVersion:pkg.version,engine:'g2-replay/1.0'};
}
