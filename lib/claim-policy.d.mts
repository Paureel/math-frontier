import type {Project,Problem,Frontier} from '../src/types';
export function claimLabel(project:Project|null):string;
export function hasReviewReceipt(project:Project|null):boolean;
export function reviewScope(project:Project|null):string|null;
export function canCompare(project:Project|null,problem:Problem):boolean;
export function asSavedFrontier(data:Frontier):Frontier;
