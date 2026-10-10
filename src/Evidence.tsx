import {useEffect,useState} from 'react';
import type {Project} from './types';

export default function Evidence({project}:{project:Project}) {
  const key=`${project.id}:${project.sourceHash}`,inline=project.claim?.evidence;
  const [loaded,setLoaded]=useState<{key:string;text:string}>({key:'',text:''});
  useEffect(()=>{
    if(inline || !project.claim)return;
    let cancelled=false;
    void import('virtual:frontier-excerpts').then(({default:excerpts})=>{
      if(!cancelled)setLoaded({key,text:excerpts[key] ?? 'An excerpt is unavailable for this source version. Open the complete pinned source below.'});
    }).catch(()=>{if(!cancelled)setLoaded({key,text:'The source excerpt could not be loaded. The pinned source and review details remain available below.'});});
    return()=>{cancelled=true;};
  },[key,inline,!!project.claim]);
  return <pre>{inline || (!project.claim ? 'No parsed evidence is available for the current source.' : loaded.key===key ? loaded.text : 'Loading source excerpt…')}</pre>;
}
