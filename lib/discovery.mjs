import fs from 'node:fs/promises';
import {replaceSnapshot} from './snapshot-write.mjs';
import {discover} from './model.mjs';
import {readPublic} from './service.mjs';
import {discoveryWarnings} from './discovery-policy.mjs';
import {validateFrontier} from './validation.mjs';

// Owner-only tooling. This module is never called by the public API, page
// refreshes, source sync, visibility handlers or timers.
export async function collectDiscovery(snapshot, options = {}) {
  if (!validateFrontier(snapshot)) throw Error('Unsupported owner snapshot.');
  const url = 'https://api.github.com/search/repositories?q=%22openai%2Fmath%22+in%3Areadme+fork%3Afalse&sort=updated&per_page=100';
  const search = JSON.parse(await readPublic(url, {...options, api: true}));
  if (!Array.isArray(search?.items) || search.incomplete_results === true) throw Error('Discovery search was incomplete or unavailable; saved candidates were preserved.');
  const discoveries = structuredClone(snapshot.discoveries);
  const seen = new Set(discoveries.map(d => d.repo.toLowerCase()));
  for (const candidate of discover(search.items.slice(0, 100))) {
    if (discoveries.length >= 100) break;
    if (!seen.has(candidate.repo.toLowerCase())) {
      seen.add(candidate.repo.toLowerCase());
      discoveries.push(candidate);
    }
  }
  // Preserve all source dates, curated projects, metrics and review receipts.
  const result = {...snapshot, discoveries, warnings: discoveryWarnings(snapshot.warnings)};
  if (!validateFrontier(result)) throw Error('Invalid discovery response; saved candidates were preserved.');
  return result;
}

export async function updateDiscoverySnapshot(path, options = {}) {
  const before = await fs.readFile(path, 'utf8');
  const data = await collectDiscovery(JSON.parse(before), options);
  await replaceSnapshot(path, before, data);
  return {data, added: data.discoveries.length - JSON.parse(before).discoveries.length};
}
