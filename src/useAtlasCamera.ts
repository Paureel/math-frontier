import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import type {KeyboardEvent, PointerEvent} from 'react';
import {constrainCamera, frameQueue, panFromPointer} from '../lib/map-camera.mjs';
import type {Camera} from '../lib/map-camera.mjs';

const HOME: Camera = {zoom: 1, x: 0, y: 0};

export default function useAtlasCamera(width: number, height: number, layout: string, enabled: boolean) {
  const [camera, setCamera] = useState(HOME);
  const [dragging, setDragging] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const layer = useRef<SVGGElement>(null);
  const current = useRef(camera);
  const gesture = useRef<{
    pointerId: number; start: {x: number; y: number}; origin: Camera;
    viewport: {width: number; height: number}; moved: boolean; touch: boolean;
  } | null>(null);
  const suppressUntil = useRef(0);
  const update = (next: Camera) => {
    current.current = next;
    setCamera(next);
  };
  const queue = useMemo(() => frameQueue<Camera>(update, callback => window.requestAnimationFrame(callback), frame => window.cancelAnimationFrame(frame)), []);

  const finish = (cancel = false) => {
    if (cancel) queue.cancel(); else queue.flush();
    const active = gesture.current;
    gesture.current = null;
    if (active?.moved) suppressUntil.current = performance.now() + 180;
    if (active && svg.current?.hasPointerCapture(active.pointerId)) svg.current.releasePointerCapture(active.pointerId);
    setDragging(false);
  };
  const reset = () => {
    finish(true);
    update(HOME);
  };
  useLayoutEffect(() => {
    reset();
  }, [width, height, layout]);
  useLayoutEffect(() => {if (!enabled) finish(true);}, [enabled]);
  useEffect(() => () => queue.cancel(), [queue]);

  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (!event.isPrimary || event.button !== 0 || (event.target as Element).closest('[data-node]')) return;
    const viewport = event.currentTarget.getBoundingClientRect();
    if (!viewport.width || !viewport.height) return;
    queue.cancel();
    // A drag may interrupt a zoom. Continue from the position actually on screen.
    const transform = layer.current && getComputedStyle(layer.current).transform;
    if (transform && transform !== 'none') {
      const matrix = new DOMMatrixReadOnly(transform);
      update(constrainCamera({zoom: matrix.a, x: matrix.e - width / 2 * (1 - matrix.a), y: matrix.f - height / 2 * (1 - matrix.a)}, width, height));
    }
    gesture.current = {pointerId: event.pointerId, start: {x: event.clientX, y: event.clientY}, origin: current.current, viewport, moved: false, touch: event.pointerType === 'touch'};
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const dx = event.clientX - active.start.x, dy = event.clientY - active.start.y;
    if (!active.moved && Math.hypot(dx, dy) < 4) return;
    if (!active.moved && active.touch && Math.abs(dy) > Math.abs(dx)) {finish(true); return;}
    const point = {x: event.clientX, y: active.touch ? active.start.y : event.clientY};
    active.moved = true;
    queue.push(panFromPointer(active.origin, active.start, point, active.viewport, width, height));
  };
  const zoomBy = (amount: number) => {
    finish();
    update(constrainCamera({...current.current, zoom: current.current.zoom + amount}, width, height));
  };
  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const step = event.shiftKey ? 90 : 45;
    const direction: Record<string, [number, number]> = {ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step]};
    if (direction[event.key]) {
      event.preventDefault();
      finish();
      const [x, y] = direction[event.key];
      update(constrainCamera({...current.current, x: current.current.x + x, y: current.current.y + y}, width, height));
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault(); zoomBy(.25);
    } else if (event.key === '-') {
      event.preventDefault(); zoomBy(-.25);
    } else if (event.key === '0') {
      event.preventDefault(); reset();
    }
  };

  return {
    camera, svg, layer, dragging, reset, zoomBy,
    transform: `matrix(${camera.zoom},0,0,${camera.zoom},${width / 2 * (1 - camera.zoom) + camera.x},${height / 2 * (1 - camera.zoom) + camera.y})`,
    handlers: {
      onPointerDown, onPointerMove, onKeyDown,
      onPointerUp: (event: PointerEvent<SVGSVGElement>) => {if (gesture.current?.pointerId === event.pointerId) {onPointerMove(event); finish();}},
      onPointerCancel: (event: PointerEvent<SVGSVGElement>) => {if (gesture.current?.pointerId === event.pointerId) finish(true);},
      onLostPointerCapture: () => {if (gesture.current) finish(true);},
      onClickCapture: (event: React.MouseEvent<SVGSVGElement>) => {
        if (event.detail && performance.now() < suppressUntil.current) {event.preventDefault(); event.stopPropagation();}
      },
    },
  };
}
