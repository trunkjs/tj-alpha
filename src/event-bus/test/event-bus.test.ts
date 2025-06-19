/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { EventBus, AbstractTjEvent, TjEvent } from "@/event-bus/event-bus";

/**
 * Vitest already exposes the `vi` global, but many developers are used to
 * the Jest API (`jest.fn`, `jest.spyOn`, …).  The following simple alias
 * keeps the original tests readable while still running under Vitest.
 */
// @ts-ignore – we purposely create a global alias
globalThis.jest = vi;

describe("EventBus", () => {
  // Helper: clear all internal maps between tests
  function resetBus() {
    const bus: any = EventBus;
    bus.eventMap.clear();
    bus.eventMapReverse.clear();
    bus.listenerIdToCallback.clear();
    bus.eventNameToListenerIds.clear();
    bus.nextListenerId = 0;
  }

  beforeEach(() => {
    resetBus();
    vi.spyOn(console, "log").mockImplementation(() => void 0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers events through @TjEvent decorator", () => {
    @TjEvent("decorator-event")
    class DecoratorEvent extends AbstractTjEvent {}

    const bus: any = EventBus;
    expect(bus.eventMap.get("decorator-event")).toBe(DecoratorEvent);
    expect(bus.eventMapReverse.get(DecoratorEvent)).toBe("decorator-event");
    // decorator also patches prototype
    expect((DecoratorEvent as any).prototype.eventName).toBe("decorator-event");
  });

  it("throws when emitting an unregistered event", async () => {
    class UnknownEvent extends AbstractTjEvent {}
    await expect(EventBus.emit(new UnknownEvent())).rejects.toThrow(
      /is not registered/
    );
  });

  it("throws when subscribing to an unregistered event", () => {
    class UnknownEvent extends AbstractTjEvent {}
    expect(() => EventBus.on(UnknownEvent, () => void 0)).toThrow(
      /is not registered/
    );
  });

  it("emits events to all listeners and awaits async handlers", async () => {
    @TjEvent("ping")
    class Ping extends AbstractTjEvent {
      constructor(readonly payload: string) {
        super();
      }
    }

    const handler1 = vi.fn(async (e: Ping) => {
      expect(e.payload).toBe("data");
    });
    const handler2 = vi.fn();

    EventBus.on(Ping, handler1);
    EventBus.on(Ping, handler2);

    await EventBus.emit(new Ping("data"));

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it("returns incrementing listener ids", () => {
    @TjEvent("inc")
    class Inc extends AbstractTjEvent {}

    const id1 = EventBus.on(Inc, () => void 0);
    const id2 = EventBus.on(Inc, () => void 0);
    expect(id2).toBe(id1 + 1);
  });

  it("unsubscribe stops listener from being called", async () => {
    @TjEvent("off")
    class Off extends AbstractTjEvent {}

    const handler = vi.fn();
    const id = EventBus.on(Off, handler);
    EventBus.unsubscribe(id);

    await EventBus.emit(new Off());
    expect(handler).not.toHaveBeenCalled();
  });

  it("stale listener ids are cleaned up automatically during emit", async () => {
    @TjEvent("cleanup")
    class CleanUp extends AbstractTjEvent {}

    const handler = vi.fn();
    const id = EventBus.on(CleanUp, handler);
    // unsubscribe but internal array still holds the id
    EventBus.unsubscribe(id);

    const bus: any = EventBus;
    expect(bus.eventNameToListenerIds.get("cleanup")).toContain(id);

    await EventBus.emit(new CleanUp());

    // after emit the id should be removed
    expect(bus.eventNameToListenerIds.get("cleanup")).not.toContain(id);
  });

  it("registerEvent is idempotent and does not overwrite existing mapping", () => {
    @TjEvent("once")
    class First extends AbstractTjEvent {}
    // Artificial duplicate registration
    EventBus.registerEvent("once", First);

    const bus: any = EventBus;
    expect(bus.eventMap.get("once")).toBe(First);
  });

  it("getInstance always returns the same singleton", async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { EventBus: EventBus2 } = await import("@/event-bus/event-bus");
    expect(EventBus2).toBe(EventBus);
    expect(window.__tjEventBus).toBe(EventBus);
  });
});
