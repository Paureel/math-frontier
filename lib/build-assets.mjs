import fs from 'node:fs/promises';
import katex from 'katex';
import {EDITORIAL} from './catalogue.mjs';
import {packFrontier} from './transport.mjs';

const snapshotPath = new URL('../public/frontier.json',import.meta.url);
const names = ['frontier-bootstrap','frontier-excerpts','frontier-formulas'];
export function researchAssets() {
  return {
    name:'trusted-research-assets',
    resolveId(id) { if(names.some(name=>id===`virtual:${name}`))return `\0${id}`; },
    async load(id) {
      if(!names.some(name=>id===`\0virtual:${name}`))return;
      this.addWatchFile(snapshotPath.pathname);
      if(id==='\0virtual:frontier-formulas') {
        const formulas=Object.fromEntries(EDITORIAL.map(p=>[p.metric.formula,katex.renderToString(p.metric.formula,
          {throwOnError:true,trust:false,output:'htmlAndMathml',strict:'ignore',maxExpand:1000})]));
        return `export default ${JSON.stringify(formulas)};`;
      }
      const data=JSON.parse(await fs.readFile(snapshotPath,'utf8'));
      const packed=packFrontier(data); // Fail the build on unsupported source data.
      const value=id==='\0virtual:frontier-bootstrap' ? packed :
        Object.fromEntries(data.projects.filter(p=>p.claim?.authority==='unreviewed').map(p=>[`${p.id}:${p.sourceHash}`,p.claim.evidence]));
      return `export default ${JSON.stringify(value)};`;
    },
    handleHotUpdate({file,server}) {
      if(file===snapshotPath.pathname) {
        for(const name of names) {
          const module=server.moduleGraph.getModuleById(`\0virtual:${name}`);
          if(module)server.moduleGraph.invalidateModule(module);
        }
        server.ws.send({type:'full-reload'});
      }
    }
  };
}
