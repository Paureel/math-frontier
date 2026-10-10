import {createHash} from 'node:crypto';
import {EDITORIAL,PROJECTS} from './catalogue.mjs';
import {BASELINE_HASHES} from './baseline-hashes.mjs';
import {PROJECT_INTERPRETATIONS,interpretationFor} from './project-interpretations.mjs';
import {FORMALIZATION_SOURCES} from './release-scope.mjs';
import {ROOT,SELECTION_PATH,isSha,blob,equalRational,numericFraction,reviewedPRMatches,inspectedSelection,supportedReceipt,receiptForSelection} from './claim-policy.mjs';
export const hash=s=>createHash('sha256').update(s).digest('hex');
export function parseFamilies(contents){
 const matches=[...contents.matchAll(/\*\*(\d{3})\. ([\s\S]*?)\*\*([\s\S]*?)(?=\*\*\d{3}\. |$)/g)];
 return matches.map(m=>{const text=m[3];const end=text.indexOf('</td>');const summary=text.slice(0,end<0?text.length:end);return {id:m[1],title:m[2].replace(/\.$/,''),summary:summary.trim(),papers:[...text.matchAll(/&emsp;\[([\s\S]*?)\]\((preprints\/[^)]+\.pdf)\)/g)].map(p=>({title:cleanText(p[1]),url:'https://github.com/openai/math/blob/main/'+p[2]})),leanUrl:summary.includes('(lean/docs/')?`https://github.com/openai/math/blob/main/lean/docs/${m[1]}.md`:null};});
}
export function cleanText(s){return s.replace(/<[^>]*>/g,'').replace(/\$`?|`\$/g,'').replace(/&gt;|\\gt/g,'>').replace(/&lt;|\\lt/g,'<').replace(/\s+/g,' ').trim();}
export function makeProblems(contents,previous=[],commit='main'){const families=parseFamilies(contents);return EDITORIAL.map(p=>{const family=families.find(f=>f.id===p.id);const old=previous.find(x=>x.id===p.id);const reviewHash=BASELINE_HASHES[p.id];const baselineFresh=!!family&&hash(family.summary)===reviewHash;return {...p,metric:baselineFresh?p.metric:{...p.metric,value:null,display:'Source unconfirmed'},baselineReviewHash:reviewHash,baselineFresh,source:blob('openai/math',commit,'CONTENTS.md'),papers:family?.papers.map(s=>({...s,url:s.url.replace('/blob/main/',`/blob/${commit}/`)}))??old?.papers??[],leanUrl:FORMALIZATION_SOURCES[p.id],publishedSummary:family?.summary??old?.publishedSummary??''};});}
export const fraction=numericFraction;
const supers=s=>String(s).replace(/[0-9+-]/g,c=>({'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻','+':'⁺'}[c]));
const sci=n=>{if(n>=.001&&n<1)return String(n);const rounded=n.toExponential(5),[m,e]=rounded.split('e');return `${Number(rounded)!==n?'≈ ':''}${Number(m)} × 10${supers(Number(e))}`;};
export function parseClaim(project,text,selection,observedAt,context={}){
 const base={scope:project.scope,source:blob(project.repo,context.commit??project.branch,'README.md'),observedAt,authority:'unreviewed',independentlyVerified:false};
 const claim=(value,display,kind,evidence)=>({...base,value,display,kind,evidence});
 switch(project.parser){
 case 'supporting':{
  const inspected=interpretationFor(PROJECT_INTERPRETATIONS[project.id],hash(text));
  if(!inspected||!['refinement','method-limit'].includes(inspected.kind)||inspected.value!==null)return null;
  return {...claim(null,inspected.display,inspected.kind,text.slice(0,12000)),scope:inspected.scope};
 }
 case 'selection':{
  if(project.id!=='crocswap'||project.repo!==ROOT||typeof context.selectionText!=='string'||!inspectedSelection(selection,hash(context.selectionText))||!isSha(context.commit)||context.repo!==ROOT) return null;
  try{if(JSON.stringify(JSON.parse(context.selectionText))!==JSON.stringify(selection))return null;}catch{return null;}
  const value=fraction(selection.kappa);
  // The known upstream validation schema must bind the exact PR, head and bound.
  // An unknown future schema needs editorial review; a PASS badge alone is insufficient.
  let validation;
  try{validation=JSON.parse(context.validationText);}catch{return null;}
  const known=receiptForSelection(selection,hash(context.selectionText));
  const check=validation?.[`pr${known.sourcePR}`];
  if(typeof context.reviewText!=='string'||!context.reviewText.trim())return null;
  if(known.schema==='published-composition') {
    if(validation.source_pr186_head!==known.reviewedHead||!equalRational(validation.kappa,selection.kappa)||
       validation.scope!==known.scope||validation.status!=='PASS local integration checks and all 56 fresh Linux jobs')return null;
  } else if(known.schema==='published-gen4-composition') {
    if(validation.status!=='COMPLETE_CONDITIONAL_FINITE_AUDIT'||
       validation.source_prs?.[known.sourcePR]!==known.reviewedHead||selection.audited_source_head!==known.reviewedHead||
       !equalRational(validation.kappa,selection.kappa)||validation.scope!==known.scope||
       validation.original_package_unchanged!==true||validation.linux?.head!==known.reviewedHead||
       validation.reused_complex_scalar?.fresh_execution!==false)return null;
  } else if(!check||check.pr!==`https://github.com/${ROOT}/pull/${known.sourcePR}`||check.head!==known.reviewedHead||
    !equalRational(check.kappa,selection.kappa)||!/^Scoped conditional construction audit passes\b/.test(check.disposition??'')) return null;
  // Bind actual construction, proof, inventory and audit reports for each
  // registered schema. No new receipt or PASS label can approve changed inputs.
  if(known.artifacts&&!Object.entries(known.artifacts).every(([path,digest])=>
    typeof context.artifactTexts?.[path]==='string'&&hash(context.artifactTexts[path])===digest))return null;
  const receipt={sourcePR:known.sourcePR,reviewedHead:known.reviewedHead,kappa:selection.kappa,scope:selection.scope,
    selectionHash:hash(context.selectionText??JSON.stringify(selection)),reviewPath:selection.review,validationPath:selection.validation,
    reviewHash:hash(context.reviewText),validationHash:hash(context.validationText),...(known.artifacts?{artifacts:known.artifacts}:{})};
  if(!supportedReceipt(receipt))return null;
  return {...claim(value,String(value),'conditional',JSON.stringify(selection,null,2)),
    source:blob(ROOT,context.commit,SELECTION_PATH),authority:'maintainer-reviewed',
    // Remote scope cannot erase the local, reviewed caveat about the full theorem.
    scope:`${base.scope} Maintainer scope: ${selection.scope}`,
    review:{...receipt,
      reviewUrl:blob(ROOT,context.commit,selection.review),validationUrl:blob(ROOT,context.commit,selection.validation),
      prUrl:`https://github.com/${ROOT}/pull/${known.sourcePR}`,
      currentPR:context.pr?reviewedPRMatches(context.pr,selection)?'matched':'changed':'unavailable'}};
 }
 case 'dft-batched':{const m=text.match(/\\theta\s*=\s*1\s*-\s*\\frac\{(\d+)\}\{(\d+)\}/);if(!m)return null;const v=fraction(m[1]+'/'+m[2]);return v&&v<1?claim(v,`δ < ${v}`,'conditional',text.slice(0,Math.min(text.indexOf('## What changes'),2400))):null;}
 case 'dft-pure':{
  const selected=text.split('<!-- current-result:start -->')[1]?.split('<!-- current-result:end -->')[0];
  const current=selected?.match(/\\delta\s*=\s*(0\.\d+)\s*\./);
  const historical=text.match(/\\delta\s*=\s*([\d.]+)\s*\\times\s*10\^\{(-?\d+)\}/);
  const v=current?Number(current[1]):historical?Number(historical[1])*10**Number(historical[2]):null;
  return v>0&&v<1?claim(v,sci(v),'proposed',text.slice(0,1900)):null;
 }
 case 'dft-lean':{const m=text.match(/improvedExponent\s*:\s*ℝ\s*:=\s*1\s*-\s*(\d+)\s*\/\s*10\s*\^\s*(\d+)/);if(!m)return null;const v=Number(m[1])/10**Number(m[2]);return v>0&&v<1?claim(v,sci(v),'proposed',text.slice(0,3100)):null;}
 case 'zero':{const m=text.match(/Re\(s\)\s*>\s*(\d+)\/(\d+)\s*=\s*([\d.]+)/);if(!m||!equalRational(m[1]+'/'+m[2],m[3]))return null;const v=fraction(m[1]+'/'+m[2]);return v&&v<1?claim(v,String(v),'extension',text.slice(0,1600)):null;}
 case 'zero-cubic':{const m=text.slice(0,700).match(/=\s*(0\.\d+)\\ldots/);const v=m?Number(m[1]):null;return v&&v<1?claim(v,'≈ '+v.toFixed(10),'conditional',text.slice(0,2200)):null;}
 case 'heilbronn':{const m=text.match(/\\boxed\{\\eta=\\frac\{1\}\{(\d+)\\cdot(\d+)\^\{(\d+)\}\+(\d+)\}/);if(!m)return null;const v=1/(Number(m[1])*Number(m[2])**Number(m[3])+Number(m[4]));return Number.isFinite(v)&&v>0&&v<1?claim(v,sci(v),'conditional',text.slice(0,1600)):null;}
 case 'matrix':return /ω\s*≤\s*9\/4/.test(text)&&/every field/i.test(text)?claim(2.25,'2.25 · every field','extension',text.slice(0,1450)):null;
 case 'matroid-prophet':{
  const current=text.split('The current written proof gives')[1]?.split('## Contribution')[0];
  const m=current?.match(/\\mathbb E\[\\mathrm\{reward\}\]\\ge 2\^\{-(\d+)\}\\,\\mathbb E\[\\mathrm\{OPT\}\]/);
  const exponent=m?Number(m[1]):null;
  return Number.isSafeInteger(exponent)&&exponent>0&&exponent<=1000?claim(2**-exponent,`> 2${supers(-exponent)}`,'proposed',current.slice(0,3200)):null;
 }
 case 'verification':return /end-to-end multiplication theorem is not proved/i.test(text)?claim(null,'End-to-end proof open','verification',text.slice(0,1700)):null;
 case 'exploration':return /four machines/i.test(text)?claim(null,'4-machine exploration','exploration',text.slice(0,2200)):null;
 case 'integer-draft':{const t=text.slice(0,1200);const exact=t.match(/\\kappa\s*=\s*\\frac\{(\d+)\}\{10\^(\d{1,3})\}\s*=\s*([\d.]+)/);const decimal=t.match(/(?:kappa|κ)\s*=\s*([\d.]+(?:e[+-]?\d+)?)/i);const value=exact?`${exact[1]}e-${exact[2]}`:decimal?.[1];const v=value?fraction(value):null;if(exact&&!equalRational(value,exact[3]))return null;return v&&v>0&&v<1?claim(v,sci(v),'conditional',t):null;}
 case 'van-der-waerden':{
  const section=text.split('## Main proposed refinement')[1]?.split('## Original work and attribution')[0]?.replace(/\*\*/g,'');
  if(!section)return null;
  // Take only the explicit main conditional coefficient, never the original
  // baseline, a parameter-table entry, a multiplier, or an unattained supremum.
  const m=section.match(/Our conditional parameter-transfer argument admits\s+\$c\s*=\s*(\d+\/[1-9]\d*)\$/i);
  const value=m?fraction(m[1]):null;
  if(value===null||value<=0||value>=1)return null;
  const lead=section.split('###')[0];
  const limit=lead.match(/every fixed\s+\$c\\lt\s*(\d+\/[1-9]\d*)\$/i)??section.match(/same sufficient region admits every fixed positive\s+\$c\s*<\s*(\d+\/[1-9]\d*)\$/i);
  if(limit&&(fraction(limit[1])===null||value>=fraction(limit[1])))return null;
  const result=claim(value,m[1],'conditional',text.slice(0,Math.min(text.indexOf('## Original work and attribution')<0?4200:text.indexOf('## Original work and attribution'),4200)));
  return limit?{...result,scope:`${result.scope} The source also states c < ${limit[1]} within its retained estimates; that endpoint is not asserted.`}:result;
 }
 default:return null;
 }
}
export function seededProject(p,readme,metadata,at,selection,context={}){
 const branch=context.defaultBranch??p.branch,sourceHash=hash(readme),known=interpretationFor(PROJECT_INTERPRETATIONS[p.id],sourceHash);
 const candidate=parseClaim(p,readme,selection,at,context);
 const claim=p.parser==='selection'?candidate:known&&isSha(context.commit)&&candidate&&
   ['value','display','kind'].every(key=>candidate[key]===known[key])?{...candidate,scope:known.scope}:null;
 const {parser,scope,...editorial}=p;
 return {...editorial,branch,url:`https://github.com/${p.repo}`,readmeUrl:blob(p.repo,context.commit??branch,'README.md'),updatedAt:metadata?.pushed_at??null,stars:metadata?.stargazers_count??null,forks:metadata?.forks_count??null,openIssues:metadata?.open_issues_count??null,sourceHash,checkedAt:at,claimFresh:true,activityFresh:context.activityFresh??false,provenance:isSha(context.commit)?{repo:p.repo,defaultBranch:branch,commit:context.commit,readmeHash:sourceHash}:null,claim};
}
export const KEYWORDS={
 '109':/integer[-_ ]mult|integer multiplication|below[-_ ]nlogn/i,'130':/fourier|exact[-_ ]dft|walsh[-_ ]hadamard/i,
 '107':/matrix[-_ ]multiplication|omega[-_ ]nine[-_ ]quarters/i,'003':/quasi[-_ ]riemann|quasi[-_ ]rh|qrh|zero[-_ ]free|RH-Zero-Free/i,
 '191':/heilbronn/i,'124':/scheduling[-_ ]proof|three[-_ ]machine/i,'138':/subset[-_ ]sum/i,
 '111':/matroid[-_ ]prophet|prophet[-_ ]inequalit/i,'137':/time[-_ ]to[-_ ]space|time.*space.*simulat/i,
 '104':/mean[-_ ]payoff|stochastic.*parity.*game/i,'120':/maximum[-_ ](?:cardinality[-_ ])?matching/i,
 '121':/edit[-_ ]distance/i,'122':/deletion[-_ ]trace|trace[-_ ]reconstruction/i,
 '159':/progression[-_ ]free|arithmetic[-_ ]progression/i,'183':/halving[-_ ]line/i,'167':/unit[-_ ]distance/i,
 '108':/permanent.*lower[-_ ]bound|border[-_ ]determinantal/i,'160':/van[-_ ]+der[-_ ]+waerden/i,
 '161':/sidorenko/i,'182':/polynomial[-_ ]free[-_ ]difference|intersective[-_ ]polynomial/i,
 '174':/thin[-_ ]spanning[-_ ]tree|thin[-_ ]tree/i,'265':/area[-_ ]law|quantum[-_ ]state[-_ ]approximation/i,
 '277':/entangled[-_ ]game|entangled.*repetition/i
};
export function discover(items){return items.filter(x=>x&&x.private===false&&x.fork===false&&/^[\w.-]+\/[\w.-]+$/.test(x.full_name??'')&&!PROJECTS.some(p=>p.repo.toLowerCase()===x.full_name.toLowerCase())).flatMap(x=>{const ids=Object.entries(KEYWORDS).filter(([,rx])=>rx.test(`${x.full_name} ${x.description??''}`)).map(([id])=>id);return ids.length?[{repo:x.full_name,url:`https://github.com/${x.full_name}`,description:typeof x.description==='string'?x.description.slice(0,1200):'',updatedAt:Number.isFinite(Date.parse(x.pushed_at))?x.pushed_at:null,problemIds:ids,reason:'Matched repository name or description in public GitHub search. Its claims have not been reviewed for this catalogue.'}]:[];});}
