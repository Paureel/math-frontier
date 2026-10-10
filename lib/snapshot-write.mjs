import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';

// Both owner commands use this lock and compare against the file they read
// before their network work. Concurrent edits are preserved rather than merged.
export async function replaceSnapshot(path, before, data) {
  const lockPath = new URL(path.href + '.lock');
  let lock;
  try { lock = await fs.open(lockPath, 'wx', 0o600); }
  catch (error) {
    if (error.code === 'EEXIST') throw Error('The owner snapshot is being updated. Run the manual command again.');
    throw error;
  }
  const temporary = new URL(`./frontier-update-${randomUUID()}.tmp`, path);
  try {
    if (await fs.readFile(path, 'utf8') !== before) throw Error('The owner snapshot changed during the update; no update was saved. Run the manual command again.');
    await fs.writeFile(temporary, JSON.stringify(data, null, 2) + '\n', {flag:'wx', mode:0o600});
    if (await fs.readFile(path, 'utf8') !== before) throw Error('The owner snapshot changed during the update; no update was saved. Run the manual command again.');
    await fs.rename(temporary, path);
  } finally {
    await lock.close();
    await fs.rm(temporary, {force:true});
    await fs.rm(lockPath, {force:true});
  }
}
