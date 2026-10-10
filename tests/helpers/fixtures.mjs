import fs from 'node:fs';
import {PROJECTS} from '../../lib/catalogue.mjs';
import {ROOT, SELECTED_STATUS} from '../../lib/claim-policy.mjs';
export const snapshot = JSON.parse(fs.readFileSync(new URL('../fixtures/frontier-initial.json', import.meta.url), 'utf8'));
export const at = '2026-10-09T14:00:00.000Z';
export const maintainerReadme=fs.readFileSync(new URL('../fixtures/maintainer-readme.md',import.meta.url),'utf8');
export const commit = 'a'.repeat(40), head = 'c8b22bc5c10dba497ac25804e27d9647d818e2ff';
const selectionText=fs.readFileSync(new URL('../fixtures/maintainer-selection.json',import.meta.url),'utf8');
const reviewText=fs.readFileSync(new URL('../fixtures/maintainer-review.md',import.meta.url),'utf8');
const validationText=fs.readFileSync(new URL('../fixtures/maintainer-validation.json',import.meta.url),'utf8');
export const selection=JSON.parse(selectionText);
export const pr = {number:144, title:'Conditional kappa = 4.609169e-4', body:'', state:'closed', merged_at:at,
  html_url:`https://github.com/${ROOT}/pull/144`, base:{repo:{full_name:ROOT}}, head:{sha:head}};
export function validationFor(record = selection) {
  const data=JSON.parse(validationText);
  data[`pr${record.source_pr}`]={...data.pr144,pr:`https://github.com/${ROOT}/pull/${record.source_pr}`,head:record.reviewed_head,kappa:record.kappa};
  return data;
}
export function contextFor(record = selection) {
  return {repo:ROOT, commit, defaultBranch:'main', selectionText:JSON.stringify(record,null,2)+'\n',
    reviewText,validationText,pr};
}
export const project = id => PROJECTS.find(p => p.id === id);
export const contents = snapshot.problems.map(p => `**${p.id}. ${p.name}.** ${p.publishedSummary}\n</td>\n${p.papers.map(s => `&emsp;[${s.title}](preprints/example/${p.id}.pdf)`).join('\n')}`).join('\n');
export function harness({record = selection, mutate, contentsText = contents, prRecord = pr} = {}) {
  const calls = [];
  const fetcher = async (input, options) => {
    const url = new URL(input); calls.push({url:String(input), options});
    const override = await mutate?.(url, options);
    if (override !== undefined) return override;
    if (url.hostname === 'api.github.com') {
      if (url.pathname === '/search/repositories') return Response.json({items:[]});
      const match = url.pathname.match(/^\/repos\/([^/]+\/[^/]+)(.*)$/);
      const repo = match?.[1], tail = match?.[2];
      const p = PROJECTS.find(p => p.repo === repo);
      if (tail === '') return Response.json({private:false, fork:false, full_name:repo, default_branch:p?.branch ?? 'main',
        pushed_at:at, stargazers_count:10, forks_count:2, open_issues_count:3});
      if (tail?.startsWith('/commits/')) return options.headers.Accept==='application/vnd.github.sha'?new Response(commit):Response.json({sha:commit});
      if (tail === '/pulls/144') return Response.json(prRecord);
      throw Error('Unexpected API fixture: ' + url.pathname);
    }
    if (!url.pathname.includes(`/${commit}/`)) throw Error('Fixture source was not pinned');
    if (url.pathname.endsWith('/CONTENTS.md')) return new Response(contentsText);
    if (url.pathname.endsWith('/selected-result.json')) return record === null ? new Response('', {status:404}) : new Response(contextFor(record).selectionText);
    if (url.pathname.endsWith(selection.review)) return new Response(contextFor(record).reviewText);
    if (url.pathname.endsWith(selection.validation)) return new Response(contextFor(record).validationText);
    if (url.pathname.endsWith('/README.md')) {
      const repo = url.pathname.split('/').slice(1,3).join('/');
      if(repo===ROOT)return new Response(maintainerReadme);
      const p = snapshot.projects.find(p => p.repo === repo);
      const latest = p && new URL(`../fixtures/latest/${p.id}/README.md`,import.meta.url);
      if(latest&&fs.existsSync(latest))return new Response(fs.readFileSync(latest,'utf8'));
      return new Response(p?.claim?.evidence ?? 'Candidate kappa=0.127865. All CI checks pass.');
    }
    const repo = url.pathname.split('/').slice(1,3).join('/');
    const p = PROJECTS.find(p=>p.repo===repo);
    const path=url.pathname.split('/').slice(4).join('/');
    if(p) {
      const evidence=new URL(`../fixtures/latest/${p.id}/${path}`,import.meta.url);
      if(fs.existsSync(evidence))return new Response(fs.readFileSync(evidence,'utf8'));
    }
    return new Response('', {status:404});
  };
  return {fetcher, calls, token:null, now:()=>Date.parse(at)};
}
