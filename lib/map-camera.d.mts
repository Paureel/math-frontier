export type Camera = {zoom: number; x: number; y: number};
export const MIN_ZOOM: number;
export const MAX_ZOOM: number;
export function constrainCamera(camera: Camera, width: number, height: number): Camera;
export function panFromPointer(origin: Camera, start: {x: number; y: number}, point: {x: number; y: number}, viewport: {width: number; height: number}, width: number, height: number): Camera;
export function frameQueue<T>(publish: (value: T) => void, requestFrame: (callback: () => void) => number, cancelFrame: (frame: number) => void): {push: (value: T) => void; flush: () => void; cancel: () => void};
