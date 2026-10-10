import {test, beforeEach, afterEach, after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {Window} from 'happy-dom';
import {researchAssets} from '../lib/build-assets.mjs';

// DOM interaction checks do not launch a browser, access GitHub, or persist data.
const window = new Window({url: 'http://127.0.0.1:5178/'});
for (const name of ['window', 'document', 'HTMLElement', 'SVGElement', 'HTMLDialogElement', 'DOMMatrixReadOnly']) {
  globalThis[name] = name === 'window' ? window : window[name];
}
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
globalThis.fetch = async () => {throw new Error('Offline test snapshot');};
const assets = researchAssets();
const directory = await mkdtemp(join(tmpdir(), 'frontier-dom-tests-'));
const bundled = await build({
  stdin: {contents: "export {default as App} from './src/App.tsx'; export {h,render} from 'preact'; export {act} from 'preact/test-utils'; export {revealHeading} from './src/interactions';", resolveDir: new URL('..', import.meta.url).pathname},
  bundle: true, write: false, format: 'esm', platform: 'browser', jsx: 'automatic', jsxImportSource: 'preact', loader: {'.css': 'empty'},
  alias: {react: 'preact/compat', 'react-dom': 'preact/compat'},
  plugins: [{name: 'research-fixtures', setup(builder) {
    builder.onResolve({filter: /^virtual:/}, args => ({path: args.path, namespace: 'research'}));
    builder.onLoad({filter: /.*/, namespace: 'research'}, async args => ({contents: await assets.load.call({addWatchFile() {}}, `\0${args.path}`), loader: 'js'}));
  }}],
});
const modulePath = join(directory, 'app.mjs');
await writeFile(modulePath, bundled.outputFiles[0].text);
const {App, h, render, act, revealHeading} = await import(pathToFileURL(modulePath).href);
let root;
let scrolls;
const media = window.matchMedia.bind(window);
const frame = () => act(async () => {await new Promise(resolve => window.requestAnimationFrame(resolve));});
const query = selector => root.querySelector(selector);
const button = label => query(`[aria-label="${label}"]`);
const click = element => act(() => element.dispatchEvent(new window.MouseEvent('click', {bubbles: true})));
const key = (element, value) => act(() => element.dispatchEvent(new window.KeyboardEvent('keydown', {key: value, bubbles: true, cancelable: true})));
const pointer = (element, type, options = {}) => act(() => element.dispatchEvent(new window.PointerEvent(type, {bubbles: true, isPrimary: true, pointerId: 1, button: 0, ...options})));
const bounds = (left, top, width, height) => ({left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() {}});

beforeEach(async () => {
  window.matchMedia = media;
  window.happyDOM.setWindowSize({width: 1280, height: 900});
  scrolls = [];
  window.scrollBy = options => scrolls.push(options);
  root = window.document.createElement('div');
  window.document.body.append(root);
  await act(async () => {render(h(App), root); await Promise.resolve();});
});
afterEach(async () => {
  await act(() => render(null, root));
  root.remove();
  assert.equal(window.document.body.classList.contains('modal-open'), false);
});
after(async () => {
  await window.happyDOM.close();
  await rm(directory, {recursive: true, force: true});
});

test('switching views preserves the map camera and card-list scroll position', async () => {
  const layer = query('.atlas-camera');
  await click(button('Zoom in')); await click(button('Zoom in'));
  assert.match(layer.style.transform, /^matrix\(1\.5,/);
  await click(button('Cards view'));
  assert.equal(query('.atlas-canvas').closest('.exploration-view').hidden, true);
  query('.atlas-cards').scrollTop = 320;
  await click(button('Map view'));
  assert.equal(query('.atlas-camera'), layer);
  assert.match(layer.style.transform, /^matrix\(1\.5,/);
  await click(button('Cards view'));
  assert.equal(query('.atlas-cards').scrollTop, 320);
});

test('node results appear on activation, and closing returns keyboard focus to that node', async () => {
  assert.equal(query('#map-node-results'), null);
  const node = query('[data-problem-id="109"]');
  node.focus(); await key(node, 'Enter'); await frame();
  assert.equal(node.getAttribute('aria-expanded'), 'true');
  assert.equal(window.document.activeElement, query('#node-results-title'));
  assert.match(query('#map-node-results').textContent, /Best reviewed/);
  assert.match(query('#map-node-results').textContent, /Best unverified/);
  await click(button('Close selected frontier results'));
  assert.equal(query('#map-node-results'), null);
  assert.equal(window.document.activeElement, node);
});

test('rapid project selection replaces disclosures and resets details without leaking the previous excerpt', async () => {
  const excerpt = query('.detail-panel .evidence-block > button');
  await click(excerpt);
  assert.equal(excerpt.getAttribute('aria-expanded'), 'true');
  const cards = [...root.querySelectorAll('.project-section .card-main')];
  await act(() => {
    query('.detail-panel').scrollTop = 400;
    cards[1].dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
    cards[2].dispatchEvent(new window.MouseEvent('click', {bubbles: true}));
  });
  assert.equal(query('.detail-panel h2').textContent, cards[2].querySelector('h3').textContent);
  assert.equal(query('.detail-panel').scrollTop, 0);
  assert.equal(query('.detail-panel .evidence-block > button').getAttribute('aria-expanded'), 'false');
  assert.equal(query('.detail-panel .evidence-excerpt'), null);
});

test('search can be cleared with Escape or the clear button without losing input focus', async () => {
  const input = button('Search problems and projects');
  input.focus();
  await act(() => {input.value = 'zzzzzz'; input.dispatchEvent(new window.Event('input', {bubbles: true}));});
  assert.ok(query('.empty-state')); assert.equal(scrolls.length, 0);
  await key(input, 'Escape');
  assert.equal(input.value, ''); assert.equal(window.document.activeElement, input);
  assert.equal(query('.empty-state'), null);
  await act(() => {input.value = 'integer'; input.dispatchEvent(new window.Event('input', {bubbles: true}));});
  await click(button('Clear search'));
  assert.equal(input.value, ''); assert.equal(window.document.activeElement, input);
});

test('mobile details lock background scroll, focus the close control, and restore the opener', async () => {
  await act(() => window.happyDOM.setWindowSize({width: 390, height: 844}));
  await click(button('Cards view'));
  const card = query('.atlas-cards .card-main');
  card.focus(); await click(card);
  assert.equal(query('.detail-dialog').open, true);
  assert.equal(window.document.body.classList.contains('modal-open'), true);
  assert.equal(window.document.activeElement, button('Close project details'));
  await click(button('Close project details'));
  assert.equal(query('.detail-dialog').open, false);
  assert.equal(window.document.activeElement, card);
});

test('dialog padding and drags out of the content do not accidentally dismiss a dialog', async () => {
  const opener = button('About the data'); opener.focus(); await click(opener);
  const dialog = query('.source-dialog');
  dialog.getBoundingClientRect = () => bounds(100, 100, 600, 600);
  await pointer(dialog, 'pointerdown', {clientX: 120, clientY: 120});
  await act(() => dialog.dispatchEvent(new window.MouseEvent('click', {bubbles: true, clientX: 120, clientY: 120})));
  assert.equal(dialog.open, true);
  await pointer(dialog, 'pointerdown', {clientX: 120, clientY: 120});
  await act(() => dialog.dispatchEvent(new window.MouseEvent('click', {bubbles: true, clientX: 20, clientY: 20})));
  assert.equal(dialog.open, true);
  await pointer(dialog, 'pointerdown', {clientX: 20, clientY: 20});
  await act(() => dialog.dispatchEvent(new window.MouseEvent('click', {bubbles: true, clientX: 20, clientY: 20})));
  assert.equal(dialog.open, false);
  assert.equal(window.document.activeElement, opener);
});

test('Escape and resizing out of mobile mode close dialogs and release scroll locking', async () => {
  await click(button('About the data'));
  await act(() => query('.source-dialog').dispatchEvent(new window.Event('cancel', {cancelable: true})));
  assert.equal(query('.source-dialog').open, false);
  assert.equal(window.document.body.classList.contains('modal-open'), false);
  await act(() => window.happyDOM.setWindowSize({width: 390, height: 844}));
  await click(button('Cards view')); await click(query('.atlas-cards .card-main'));
  assert.equal(query('.detail-dialog').open, true);
  await act(() => window.happyDOM.setWindowSize({width: 1280, height: 900}));
  assert.equal(query('.detail-dialog').open, false);
  assert.equal(window.document.body.classList.contains('modal-open'), false);
  assert.ok(query('.detail-panel h2'));
});

test('detail reveals respect reduced motion and hidden views cannot scroll the page', () => {
  const element = query('.detail-panel');
  element.getBoundingClientRect = () => bounds(0, 1200, 400, 700);
  revealHeading(element); assert.deepEqual(scrolls.pop(), {top: 1176, behavior: 'smooth'});
  window.matchMedia = value => value.includes('prefers-reduced-motion') ? {matches: true} : media(value);
  revealHeading(element); assert.deepEqual(scrolls.pop(), {top: 1176, behavior: 'auto'});
  element.hidden = true; revealHeading(element); assert.equal(scrolls.length, 0);
});

test('map dragging ignores secondary pointers and releases the final position before a frame', async () => {
  const svg = query('.atlas-stage > svg');
  svg.getBoundingClientRect = () => bounds(0, 0, 600, 400);
  await pointer(svg, 'pointerdown', {button: 2, clientX: 100, clientY: 100});
  assert.equal(svg.hasPointerCapture(1), false);
  await pointer(svg, 'pointerdown', {isPrimary: false, clientX: 100, clientY: 100});
  assert.equal(svg.hasPointerCapture(1), false);
  await pointer(svg, 'pointerdown', {clientX: 100, clientY: 100});
  await pointer(svg, 'pointermove', {pointerId: 2, clientX: 500, clientY: 100});
  await pointer(svg, 'pointerup', {clientX: 130, clientY: 120});
  assert.equal(svg.hasPointerCapture(1), false);
  assert.equal(svg.classList.contains('is-dragging'), false);
  assert.match(query('.atlas-camera').style.transform, /^matrix\(1,0,0,1,60,40\)$/);
});

test('reset cancels queued drag updates, and keyboard controls honor zoom limits', async () => {
  const svg = query('.atlas-stage > svg');
  svg.getBoundingClientRect = () => bounds(0, 0, 600, 400);
  await pointer(svg, 'pointerdown', {clientX: 100, clientY: 100});
  await pointer(svg, 'pointermove', {clientX: 300, clientY: 150});
  await key(svg, '0'); await frame();
  assert.equal(query('.atlas-camera').style.transform, 'matrix(1,0,0,1,0,0)');
  for (let i = 0; i < 12; i++) await key(svg, '+');
  assert.match(query('.atlas-camera').style.transform, /^matrix\(2\.5,/);
  assert.equal(button('Zoom in').disabled, true);
  for (let i = 0; i < 12; i++) await key(svg, '-');
  assert.match(query('.atlas-camera').style.transform, /^matrix\(0\.6,/);
  assert.equal(button('Zoom out').disabled, true);
});

test('vertical touch gestures scroll the page while horizontal gestures pan without vertical drift', async () => {
  const svg = query('.atlas-stage > svg');
  svg.getBoundingClientRect = () => bounds(0, 0, 600, 400);
  await pointer(svg, 'pointerdown', {pointerType: 'touch', clientX: 100, clientY: 100});
  await pointer(svg, 'pointermove', {pointerType: 'touch', clientX: 104, clientY: 140});
  assert.equal(svg.hasPointerCapture(1), false);
  assert.equal(svg.classList.contains('is-dragging'), false);
  assert.equal(query('.atlas-camera').style.transform, 'matrix(1,0,0,1,0,0)');
  await pointer(svg, 'pointerdown', {pointerType: 'touch', clientX: 100, clientY: 100});
  await pointer(svg, 'pointerup', {pointerType: 'touch', clientX: 140, clientY: 108});
  assert.equal(query('.atlas-camera').style.transform, 'matrix(1,0,0,1,80,0)');
});

test('hiding the map cancels its pending gesture while keeping the accepted camera position', async () => {
  const svg = query('.atlas-stage > svg');
  svg.getBoundingClientRect = () => bounds(0, 0, 600, 400);
  await pointer(svg, 'pointerdown', {clientX: 100, clientY: 100});
  await pointer(svg, 'pointermove', {clientX: 300, clientY: 150});
  await click(button('Cards view'));
  assert.equal(svg.hasPointerCapture(1), false);
  const position = query('.atlas-camera').style.transform;
  await frame();
  assert.equal(query('.atlas-camera').style.transform, position);
  await click(button('Map view'));
  assert.equal(query('.atlas-camera').style.transform, position);
});

test('native close events synchronize state and delayed events cannot dismiss a reopened dialog', async () => {
  const opener = button('About the data'); opener.focus(); await click(opener);
  const dialog = query('.source-dialog');
  await act(() => dialog.close());
  assert.equal(window.document.body.classList.contains('modal-open'), false);
  assert.equal(window.document.activeElement, opener);
  await click(opener);
  await act(() => dialog.dispatchEvent(new window.Event('close')));
  assert.equal(dialog.open, true);
  assert.equal(window.document.body.classList.contains('modal-open'), true);
  await click(button('Close sources'));
});
