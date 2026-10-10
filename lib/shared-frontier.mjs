import {validateFrontier} from './validation.mjs';
import {discoveryWarnings} from './discovery-policy.mjs';
import {expireFrontier} from './refresh-policy.mjs';
import {markSaved,collectFrontier} from './service.mjs';

export const PUBLIC_SNAPSHOT_KEY='research-snapshot';
const ownerManaged=(data,snapshot)=>({...data,discoveries:structuredClone(snapshot.discoveries),warnings:discoveryWarnings(data.warnings)});
function validRecord(record,now) {
  return record && Object.keys(record).every(k=>['version','checkedAt','frontier'].includes(k)) && record.version===1 &&
    Number.isFinite(Date.parse(record.checkedAt)) && Date.parse(record.checkedAt)<=now &&
    validateFrontier(record.frontier) && Date.parse(record.frontier.fetchedAt)<=Date.parse(record.checkedAt);
}

// This visitor path NEVER collects GitHub sources or writes a blob. A cold
// function reads the same public snapshot as every other visitor.
export async function readSharedFrontier({snapshot,store,now=Date.now}={}) {
  if(!validateFrontier(snapshot))throw Error('Unsupported bundled research snapshot.');
  try {
    const record=await store.get(PUBLIC_SNAPSHOT_KEY,{type:'json',consistency:'strong'});
    if(validRecord(record,now()) && Date.parse(record.frontier.fetchedAt)>=Date.parse(snapshot.fetchedAt))
      return expireFrontier(ownerManaged(record.frontier,snapshot),now());
  } catch { /* A saved public source record is sufficient for exploration. */ }
  return expireFrontier({...snapshot,live:false},now());
}

// Only the scheduled owner-side function can invoke collection. Atomic writes
// prevent a slower overlapping job from replacing a newer source assessment.
export async function refreshSharedFrontier({snapshot,store,collect=collectFrontier,now=Date.now}={}) {
  if(!validateFrontier(snapshot))throw Error('Unsupported bundled research snapshot.');
  const previous=await store.getWithMetadata(PUBLIC_SNAPSHOT_KEY,{type:'json',consistency:'strong'});
  const record=previous?.data, started=now();
  // Coalesce immediate duplicate owner invocations, not the next scheduled run.
  // A 12h TTL measured at job completion would skip the following cron tick.
  if(validRecord(record,started) && started<Date.parse(record.checkedAt)+60000)return {updated:false};
  let data=validRecord(record,started) && Date.parse(record.frontier.fetchedAt)>=Date.parse(snapshot.fetchedAt) ? record.frontier : snapshot;
  data=ownerManaged(data,snapshot);
  let next;
  try {
    next=await collect(data);
    if(!validateFrontier(next) || Date.parse(next.fetchedAt)>now())throw Error('Unsupported research update.');
  } catch { next=markSaved(data); }
  next=ownerManaged(next,snapshot);
  if(!validateFrontier(next))throw Error('Unsupported research update.');
  // Never perform an unconditional overwrite when an existing ETag is missing.
  if(previous && !previous.etag)throw Error('Public source cache cannot be updated safely.');
  const result=await store.setJSON(PUBLIC_SNAPSHOT_KEY,{version:1,checkedAt:new Date(now()).toISOString(),frontier:next},
    previous ? {onlyIfMatch:previous.etag} : {onlyIfNew:true});
  return {updated:result.modified,live:next.live};
}
