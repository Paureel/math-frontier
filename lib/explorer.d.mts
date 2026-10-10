import type {Frontier, Problem, Project, Discovery} from '../src/types';
export function bestReviewedProject(problem:Problem,projects:Project[]):Project|null;
export function bestUnreviewedProject(problem:Problem,projects:Project[]):Project|null;
export function filterExplorer(data: Frontier, options?: {field?: string; query?: string; allFrontiers?: boolean}): {projects: Project[]; discoveries: Discovery[]; problems: Problem[]; visibleProblems: Problem[]};
export function resolveSelection(problems: Problem[], projects: Project[], selectedId: string, problemId: string): {selectedProject: Project | null; selectedProblem: Problem | undefined};
