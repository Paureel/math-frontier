import fs from 'node:fs/promises';
import path from 'node:path';
import {getDeployStore} from '@netlify/blobs';
import {refreshSharedFrontier} from '../../lib/shared-frontier.mjs';
import {collectFrontier} from '../../lib/service.mjs';
import {boundedBlobFetch} from '../../lib/blob-fetch.mjs';

export default async function handler() {
  // Leave time for persisting a safe partial/saved result before the platform's
  // 30s scheduled-function deadline. No discovery and no production rebuild.
  const deadline=AbortSignal.timeout(24000);
  try {
    const snapshot=JSON.parse(await fs.readFile(path.resolve('public/frontier.json'),'utf8'));
    const store=getDeployStore('frontier-sources',{fetch:boundedBlobFetch({timeoutMs:2000,signal:AbortSignal.timeout(28000)})});
    await refreshSharedFrontier({snapshot,store,collect:previous=>collectFrontier(previous,{signal:deadline})});
  } catch { throw Error('The shared public research snapshot could not be refreshed.'); }
}
// Netlify enables this only for an explicitly published production deployment.
// A scheduled function cannot be called through a visitor URL.
export const config={schedule:'0 */12 * * *'};
