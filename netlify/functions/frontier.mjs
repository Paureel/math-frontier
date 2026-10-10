import fs from 'node:fs/promises';
import path from 'node:path';
import {getDeployStore} from '@netlify/blobs';
import {readSharedFrontier} from '../../lib/shared-frontier.mjs';
import {cachedFrontierResponse} from '../../lib/cached-response.mjs';
import {boundedBlobFetch} from '../../lib/blob-fetch.mjs';

let bundle;
export default async function handler(request) {
  return cachedFrontierResponse(request,async()=>{
    bundle ??= fs.readFile(path.resolve('public/frontier.json'),'utf8').then(JSON.parse).catch(error=>{bundle=null;throw error;});
    const snapshot=await bundle;
    // Fetching a cached public snapshot needs no GitHub token or visitor data.
    let store;
    try { store=getDeployStore('frontier-sources',{fetch:boundedBlobFetch({signal:AbortSignal.timeout(5000)})}); }
    catch { store={get:async()=>null}; }
    return readSharedFrontier({snapshot,store});
  });
}
export const config={path:'/api/frontier'};
