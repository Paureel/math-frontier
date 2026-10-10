import fs from 'node:fs/promises';
import {collectFrontier} from './service.mjs';
import {validateFrontier} from './validation.mjs';
import {replaceSnapshot} from './snapshot-write.mjs';
import {asSavedFrontier} from './claim-policy.mjs';

export async function updateSourceSnapshot(path, {collect = collectFrontier, ...options} = {}) {
  const before = await fs.readFile(path, 'utf8');
  const previous = JSON.parse(before);
  if (!validateFrontier(previous)) throw Error('Unsupported owner snapshot.');
  const data = await collect(previous, options);
  if (!data.live) throw Error('Refresh failed; the bundled snapshot was preserved.');
  if (!validateFrontier(data)) throw Error('Invalid refresh; the bundled snapshot was preserved.');
  const saved = {...asSavedFrontier(data), discoveries:previous.discoveries};
  await replaceSnapshot(path, before, saved);
  return saved;
}
