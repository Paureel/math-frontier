export const REFRESH_INTERVAL_MS: number;
import type {Frontier} from '../src/types';
export function expireFrontier(data:Frontier,now?:number):Frontier;
export function nextSourceCheck(data:Frontier,now?:number,scheduledAt?:string|null):number;
export function nextScheduledCheck(now?:number,live?:boolean):number;
export function nextEvidenceExpiry(data:Frontier):number;
