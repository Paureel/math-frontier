import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {discardLegacyPreferences} from '../lib/privacy.mjs';
import ts from 'typescript';

test('legacy cleanup removes only this app’s preference key without reading or saving visitor data', () => {
  const stored=new Map([['frontier-following-v1','private old preferences'],['another-app','keep']]);
  const removed=[];
  const unexpected=()=>assert.fail('Cleanup must not read, write, or clear storage');
  const browser={localStorage:{getItem:unexpected,setItem:unexpected,clear:unexpected,
    removeItem:key=>{removed.push(key);stored.delete(key);}}};
  discardLegacyPreferences(browser);
  discardLegacyPreferences(browser);
  assert.deepEqual(removed,['frontier-following-v1','frontier-following-v1']);
  assert.deepEqual([...stored],[['another-app','keep']]);
});

test('missing or denied browser storage cannot break explorer startup', () => {
  assert.doesNotThrow(()=>discardLegacyPreferences({}));
  assert.doesNotThrow(()=>discardLegacyPreferences({get localStorage(){throw Error('Access denied');}}));
  assert.doesNotThrow(()=>discardLegacyPreferences({localStorage:{removeItem(){throw Error('Access denied');}}}));
});

// Guard the browser entry point and its local dependencies, including lazy imports.
async function clientFiles(file=new URL('../src/main.tsx',import.meta.url),seen=new Map()) {
  if(seen.has(file.href))return seen;
  const source=await readFile(file,'utf8');seen.set(file.href,source);
  if(!/\.(tsx?|mjs)$/.test(file.pathname))return seen;
  const syntax=ts.createSourceFile(file.pathname,source,ts.ScriptTarget.Latest,true);
  const imports=[];
  function visit(node){
    if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))imports.push(node.moduleSpecifier.text);
    if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(node.arguments[0]))imports.push(node.arguments[0].text);
    ts.forEachChild(node,visit);
  }
  visit(syntax);
  for(const specifier of imports.filter(s=>s.startsWith('.'))){
    const target=new URL(specifier,file);
    if(!/\.[a-z]+$/i.test(target.pathname)){
      const entries=await readdir(new URL('.',target));
      const base=target.pathname.split('/').pop();
      const resolved=entries.find(name=>[`${base}.tsx`,`${base}.ts`,`${base}.mjs`].includes(name));
      assert.ok(resolved,`Unresolved client dependency: ${specifier}`);target.pathname+=resolved.slice(base.length);
    }
    await clientFiles(target,seen);
  }
  return seen;
}

test('browser modules have no preference persistence, cookies, telemetry, or external font loading', async () => {
  const files=await clientFiles();
  assert.ok([...files.keys()].some(file=>file.endsWith('/App.tsx')));
  for(const [file,source] of files){
    if(file.endsWith('/lib/privacy.mjs'))continue; // Deletion-only migration is tested above.
    assert.doesNotMatch(source,/\b(localStorage|sessionStorage|indexedDB|sendBeacon)\b|document\s*\.\s*cookie/,file);
    if(file.endsWith('.css'))assert.doesNotMatch(source,/@import\s+(?:url\()?['"]?https?:|url\(\s*['"]?https?:/,file);
  }
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.doesNotMatch(html,/(?:src|href)\s*=\s*['"]https?:/i);
});

test('client research requests omit credentials and cannot transmit exploration choices', async () => {
  const files=await clientFiles();let requests=0;
  for(const [file,source] of files){
    if(!/\.(tsx?|mjs)$/.test(file))continue;
    const syntax=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
    function visit(node){
      if(ts.isCallExpression(node)&&node.expression.getText(syntax)==='fetch'){
        requests++;
        assert.ok(ts.isStringLiteral(node.arguments[0]));
        assert.equal(node.arguments[0].text,'/api/frontier');
        const options=node.arguments[1];assert.ok(options&&ts.isObjectLiteralExpression(options));
        const properties=new Map(options.properties.map(p=>[p.name?.getText(syntax),p]));
        const credentials=properties.get('credentials')?.initializer;
        assert.ok(credentials&&ts.isStringLiteral(credentials));assert.equal(credentials.text,'omit');
        assert.ok(!properties.has('body')&&!properties.has('headers')&&!properties.has('method'));
        assert.ok(options.properties.every(p=>ts.isPropertyAssignment(p)));
      }
      ts.forEachChild(node,visit);
    }
    visit(syntax);
  }
  assert.ok(requests>0,'Expected a public research request');
});
