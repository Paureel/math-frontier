import {updateSourceSnapshot} from '../lib/source-sync.mjs';
const path=new URL('../public/frontier.json',import.meta.url);
const data=await updateSourceSnapshot(path);
console.log(`Saved ${data.projects.length} projects and ${data.problems.length} frontiers at ${data.fetchedAt}.`);
for(const warning of data.warnings)console.log(warning);
