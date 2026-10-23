import {replaySnapshot} from './notebook-core.js';
self.onmessage=async ({data})=>{
 const {requestId,snapshot}=data||{};
 try{const result=await replaySnapshot(snapshot);self.postMessage({requestId,result});}
 catch(err){self.postMessage({requestId,error:{code:err?.code||'REPLAY_ERROR',message:String(err?.message||err)}});}
};
