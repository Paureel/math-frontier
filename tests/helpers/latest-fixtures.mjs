import fs from 'node:fs';
import {PROJECTS} from '../../lib/catalogue.mjs';

export const latestText = (id,path) => fs.readFileSync(new URL(`../fixtures/latest/${id}/${path}`,import.meta.url),'utf8');
export const latestPin = id => JSON.parse(latestText(id,'pin.json'));
export const latestSelection = JSON.parse(latestText('crocswap','certificates/selected-result.json'));
export const latestPR = JSON.parse(latestText('crocswap','pr279-reviewed-identity.json'));
export const currentPR = JSON.parse(latestText('crocswap','pr279-current.json'));
export function latestHarness({mutate,now=()=>Date.parse('2026-10-10T14:30:00Z')}={}) {
  const calls=[];
  const fetcher=async(input,options)=>{
    const url=new URL(input);calls.push({url:String(input),options});
    const override=await mutate?.(url,options);
    if(override!==undefined)return override;
    if(url.hostname==='api.github.com') {
      const match=url.pathname.match(/^\/repos\/([^/]+\/[^/]+)(.*)$/);
      const repo=match?.[1],tail=match?.[2];
      const id=repo==='openai/math'?'openai':PROJECTS.find(p=>p.repo===repo)?.id;
      if(tail==='')return new Response(latestText(id,'metadata.json'));
      if(tail?.startsWith('/commits/'))return options.headers.Accept==='application/vnd.github.sha'?new Response(latestPin(id).commit):Response.json({sha:latestPin(id).commit});
      if(repo==='CrocSwap/integer-mult-bounds'&&tail==='/pulls/279')return Response.json(currentPR);
      throw Error('Unexpected public request: '+url.pathname);
    }
    const parts=url.pathname.split('/'),repo=parts.slice(1,3).join('/');
    const id=repo==='openai/math'?'openai':PROJECTS.find(p=>p.repo===repo)?.id;
    if(parts[3]!==latestPin(id).commit)throw Error('Fixture source must be immutable');
    try{return new Response(latestText(id,parts.slice(4).join('/')));}
    catch{return new Response('',{status:404});}
  };
  return {calls,fetcher,token:null,now};
}
