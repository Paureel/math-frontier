export const MIN_ZOOM = 0.6;
export const MAX_ZOOM = 2.5;

export function constrainCamera(camera, width, height) {
  const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, camera.zoom));
  return {
    zoom,
    x: Math.max(-width * zoom / 2, Math.min(width * zoom / 2, camera.x)),
    y: Math.max(-height * zoom / 2, Math.min(height * zoom / 2, camera.y)),
  };
}

export function panFromPointer(origin, start, point, viewport, width, height) {
  if (viewport.width <= 0 || viewport.height <= 0) return origin;
  return constrainCamera({
    zoom: origin.zoom,
    x: origin.x + (point.x - start.x) * width / viewport.width,
    y: origin.y + (point.y - start.y) * height / viewport.height,
  }, width, height);
}

// Keep the latest pointer position, including a release before the next frame.
export function frameQueue(publish, requestFrame, cancelFrame) {
  let frame = null;
  let pending = null;
  const flush = () => {
    if (frame !== null) cancelFrame(frame);
    frame = null;
    if (pending !== null) {
      const value = pending;
      pending = null;
      publish(value);
    }
  };
  return {
    push(value) {
      pending = value;
      if (frame === null) frame = requestFrame(flush);
    },
    flush,
    cancel() {
      if (frame !== null) cancelFrame(frame);
      frame = null;
      pending = null;
    },
  };
}
