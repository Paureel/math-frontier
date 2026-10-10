import test from 'node:test';
import assert from 'node:assert/strict';
import {constrainCamera, panFromPointer, frameQueue} from '../lib/map-camera.mjs';

test('pointer movement stays proportional to the displayed map at any viewport size', () => {
  const origin = {zoom: 1.5, x: 20, y: -10};
  const start = {x: 100, y: 100};
  const point = {x: 130, y: 120};
  assert.deepEqual(panFromPointer(origin, start, point, {width: 600, height: 400}, 1200, 800), {zoom: 1.5, x: 80, y: 30});
  assert.deepEqual(panFromPointer(origin, start, point, {width: 1200, height: 800}, 1200, 800), {zoom: 1.5, x: 50, y: 10});
  assert.equal(panFromPointer(origin, start, point, {width: 0, height: 0}, 1200, 800), origin);
});

test('zoom and pan limits keep the map recoverable, including after zooming out', () => {
  assert.deepEqual(constrainCamera({zoom: 10, x: 1e6, y: -1e6}, 1000, 600), {zoom: 2.5, x: 1250, y: -750});
  assert.deepEqual(constrainCamera({zoom: .1, x: 1000, y: -1000}, 1000, 600), {zoom: .6, x: 300, y: -180});
});

function frames() {
  const pending = new Map(); let next = 0;
  return {
    request: fn => {pending.set(++next, fn); return next;},
    cancel: id => pending.delete(id),
    run: () => {const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(fn => fn());},
    get size() {return pending.size;},
  };
}

test('a burst of pointer events publishes only its final position once per frame', () => {
  const clock = frames(), positions = [];
  const queue = frameQueue(value => positions.push(value), clock.request, clock.cancel);
  for (let x = 0; x < 100; x++) queue.push({x});
  assert.equal(clock.size, 1); assert.deepEqual(positions, []);
  clock.run(); assert.deepEqual(positions, [{x: 99}]);
  queue.push({x: 110}); clock.run(); assert.deepEqual(positions, [{x: 99}, {x: 110}]);
});

test('release flushes the latest position, while cancellation prevents a later camera jump', () => {
  const clock = frames(), positions = [];
  const queue = frameQueue(value => positions.push(value), clock.request, clock.cancel);
  queue.push({x: 20}); queue.push({x: 40}); queue.flush();
  assert.deepEqual(positions, [{x: 40}]); assert.equal(clock.size, 0);
  clock.run(); assert.equal(positions.length, 1);
  queue.push({x: 100}); queue.cancel(); clock.run(); queue.flush();
  assert.deepEqual(positions, [{x: 40}]);
});
