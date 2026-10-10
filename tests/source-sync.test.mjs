import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {updateSourceSnapshot} from '../lib/source-sync.mjs';
import {replaceSnapshot} from '../lib/snapshot-write.mjs';
import {collectFrontier} from '../lib/service.mjs';
import {validateFrontier} from '../lib/validation.mjs';
import {snapshot,harness} from './helpers/fixtures.mjs';

async function withSnapshot(run) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(),'frontier-sync-'));
  const file = pathToFileURL(path.join(directory,'frontier.json'));
  const before = JSON.stringify(snapshot,null,2)+'\n';
  try { await fs.writeFile(file,before); await run(file,before,directory); }
  finally { await fs.rm(directory,{recursive:true,force:true}); }
}

test('source sync writes validated records and preserves manual discovery', async () => {
  await withSnapshot(async (file,before,directory) => {
    const saved = await updateSourceSnapshot(file,harness());
    assert.equal(validateFrontier(saved),true);
    assert.equal(saved.live,false);
    assert.ok(saved.projects.every(p=>p.stale&&!p.claimFresh&&!p.activityFresh));
    assert.deepEqual(saved.discoveries,snapshot.discoveries);
    assert.deepEqual(JSON.parse(await fs.readFile(file,'utf8')),saved);
    assert.deepEqual(await fs.readdir(directory),['frontier.json']);
  });
});

test('a source sync cannot overwrite an owner edit made during collection', async () => {
  await withSnapshot(async (file,before,directory) => {
    const owner = structuredClone(snapshot);
    owner.discoveries[0].description = 'An owner edit made while source refresh was pending';
    const changed = JSON.stringify(owner,null,2)+'\n';
    await assert.rejects(updateSourceSnapshot(file,{collect:async previous => {
      await fs.writeFile(file,changed);
      return collectFrontier(previous,harness());
    }}),/snapshot changed/);
    assert.equal(await fs.readFile(file,'utf8'),changed);
    assert.deepEqual(await fs.readdir(directory),['frontier.json']);
  });
});

test('failed and invalid source syncs preserve the snapshot without temporary artifacts', async () => {
  await withSnapshot(async (file,before,directory) => {
    for (const collect of [async()=>({...snapshot,live:false}),async()=>({...snapshot,live:true,verifiedBest:.9})]) {
      await assert.rejects(updateSourceSnapshot(file,{collect}),/preserved/);
      assert.equal(await fs.readFile(file,'utf8'),before);
      assert.deepEqual(await fs.readdir(directory),['frontier.json']);
    }
  });
});

test('simultaneous owner writes cannot both replace a snapshot read at the same version', async () => {
  await withSnapshot(async (file,before,directory) => {
    const first = {...snapshot,warnings:[...snapshot.warnings,'First owner update']};
    const second = {...snapshot,warnings:[...snapshot.warnings,'Second owner update']};
    const results = await Promise.allSettled([replaceSnapshot(file,before,first),replaceSnapshot(file,before,second)]);
    assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
    assert.equal(results.filter(result=>result.status==='rejected').length,1);
    const saved = JSON.parse(await fs.readFile(file,'utf8'));
    assert.ok(saved.warnings.includes('First owner update') !== saved.warnings.includes('Second owner update'));
    assert.deepEqual(await fs.readdir(directory),['frontier.json']);
  });
});
