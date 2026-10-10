import {updateDiscoverySnapshot} from '../lib/discovery.mjs';

try {
  const {data, added} = await updateDiscoverySnapshot(new URL('../public/frontier.json', import.meta.url));
  console.log(`Owner-triggered discovery saved ${added} new candidates (${data.discoveries.length} total). Existing candidates were kept. All candidates remain unreviewed.`);
} catch {
  console.error('Manual discovery did not save an update. Check public GitHub access and the local snapshot, then retry.');
  process.exitCode = 1;
}
