// Tiny event bus wiring the DOM input layer to the 3D scene (and HUD effects).
type ThrowPayload = { velocity: [number, number, number] };
type Handler<T> = (payload: T) => void;

const listeners: Record<string, Handler<any>[]> = {};

export const bus = {
  on<T>(event: string, fn: Handler<T>) {
    (listeners[event] ||= []).push(fn);
    return () => {
      listeners[event] = (listeners[event] || []).filter((f) => f !== fn);
    };
  },
  emit<T>(event: string, payload: T) {
    (listeners[event] || []).forEach((fn) => fn(payload));
  },
};

export type { ThrowPayload };
