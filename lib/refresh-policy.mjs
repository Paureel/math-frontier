// One cadence for browser polling and upstream source collection, including
// failed automatic checks. Opening or revisiting a tab cannot bypass this TTL.
export const REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000;

import {asSavedFrontier,claimLabel} from './claim-policy.mjs';
export function expireFrontier(data, now = Date.now()) {
  const current=date=>{const checked=Date.parse(date);return checked<=now&&now<checked+REFRESH_INTERVAL_MS;};
  if(data.live && current(data.fetchedAt)) {
    let changed=false;
    const projects=data.projects.map(p=>{
      const sourceExpired=!current(p.checkedAt),claimExpired=p.claimFresh&&p.claim&&!current(p.claim.observedAt);
      if(!sourceExpired&&!claimExpired || p.stale&&!p.claimFresh&&!p.activityFresh)return p;
      changed=true;
      const next={...p,stale:true,claimFresh:false,activityFresh:sourceExpired?false:p.activityFresh};
      return {...next,status:claimLabel(next)};
    });
    const problems=data.problems.map(p=>{
      if(!p.baselineFresh||current(data.catalogue.checkedAt))return p;
      changed=true;return {...p,baselineFresh:false,metric:{...p.metric,value:null,display:'Source unconfirmed'}};
    });
    const live=current(data.catalogue.checkedAt)||projects.some(p=>p.claimFresh||p.activityFresh);
    return changed || live!==data.live ? {...data,projects,problems,live} : data;
  }
  if(!data.live && data.projects.every(p=>p.stale&&!p.claimFresh&&!p.activityFresh) &&
      data.problems.every(p=>p.baselineFresh===false&&p.metric.value===null&&p.metric.display==='Source unconfirmed'))return data;
  return {...asSavedFrontier(data),problems:data.problems.map(p=>({...p,baselineFresh:false,
    metric:{...p.metric,value:null,display:'Source unconfirmed'}}))};
}

export function nextSourceCheck(data, now = Date.now(), scheduledAt) {
  const expires=data.live?nextEvidenceExpiry(data):Date.parse(data.fetchedAt)+REFRESH_INTERVAL_MS;
  const scheduled=Date.parse(scheduledAt);
  // Only scheduling metadata affects this hint; it cannot restore evidence or
  // extend a live record past its source expiry. Cached handover hints can be
  // a few minutes old, in which case one short retry gets the new snapshot.
  if(Number.isFinite(scheduled) && scheduled<=now+REFRESH_INTERVAL_MS+5*60000 && scheduled>=now-5*60000) {
    const next=scheduled>now?scheduled:now+5*60000;
    return data.live ? Math.min(next,expires) : next;
  }
  // A scheduled job may still be finishing when the previous record expires.
  // Retry that brief handover once after the fallback CDN entry has expired,
  // instead of leaving an open tab on the fallback for another twelve hours.
  if(!data.live && now>=expires && now<expires+5*60000)return now+5*60000;
  return data.live ? Math.max(now,Math.min(now+REFRESH_INTERVAL_MS,expires)) : now+REFRESH_INTERVAL_MS;
}

export function nextEvidenceExpiry(data) {
  const dates=[data.fetchedAt];
  if(data.problems.some(p=>p.baselineFresh))dates.push(data.catalogue.checkedAt);
  for(const p of data.projects) {
    if(p.claimFresh||p.activityFresh)dates.push(p.checkedAt);
    if(p.claimFresh&&p.claim)dates.push(p.claim.observedAt);
  }
  return Math.min(...dates.map(date=>Date.parse(date)).filter(Number.isFinite))+REFRESH_INTERVAL_MS;
}

export function nextScheduledCheck(now=Date.now(),live=false) {
  const tick=Math.floor(now/REFRESH_INTERVAL_MS)*REFRESH_INTERVAL_MS;
  return !live && now<tick+5*60000 ? tick+5*60000 : tick+REFRESH_INTERVAL_MS+60000;
}
