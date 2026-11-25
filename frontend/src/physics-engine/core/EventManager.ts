export type EventHandler<T = unknown> = (payload: T) => void;

/**
 * Lightweight typed event bus for decoupling core engine managers from UI components.
 */
export class EventManager {
  private listeners = new Map<string, Set<EventHandler<unknown>>>();

  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(handler as EventHandler<unknown>);
    return () => this.off(event, handler);
  }

  off<T = unknown>(event: string, handler: EventHandler<T>): void {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(handler as EventHandler<unknown>);
    if (set.size === 0) {
      this.listeners.delete(event);
    }
  }

  emit<T = unknown>(event: string, payload: T): void {
    const set = this.listeners.get(event);
    if (!set) return;
    set.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[PhysicsEngine EventManager] Error in handler for "${event}":`, err);
      }
    });
  }

  clear(): void {
    this.listeners.clear();
  }
}
