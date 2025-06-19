---
slugName: event-bus-unit-tests
includeFiles:
- ./src/event-bus/event-bus.ts
editFiles:
- ./src/event-bus/test/event-bus.test.ts
original_prompt: Write Unittests for ./src/event-bus/event-bus.ts in ./src/event-bus/test/event-bus.test.ts
  Test all edge cases
---
# Prepare Event-bus unit tests

We need a comprehensive Jest test-suite for `src/event-bus/event-bus.ts`.  
The tests must validate correct behaviour, report edge-cases and guarantee the singleton can be used reliably in isolation.

## Tasks

- **create-test-suite** Implement `event-bus.test.ts` covering registration, emit/on/unsubscribe, error cases, singleton, listener clean-up and async behaviour.
- **reset-singleton-helper** Inside the test file add helpers to reset private maps between tests so cases stay independent.

## Overview: File changes

- **src/event-bus/test/event-bus.test.ts** New file containing the complete Jest test-suite.

## Detail changes

### src/event-bus/test/event-bus.test.ts

**Referenced Tasks**
- **create-test-suite**
- **reset-singleton-helper**

Add:

```ts
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { EventBus, AbstractTjEvent, TjEvent } from '@/event-bus/event-bus';

describe('EventBus', () => {

  // Helper: clear all internal data between tests
  function resetBus() {
    // access private fields through any–cast
    const bus: any = EventBus;
    bus.eventMap.clear();
    bus.eventMapReverse.clear();
    bus.listenerIdToCallback.clear();
    bus.eventNameToListenerIds.clear();
    bus.nextListenerId = 0;
  }

  beforeEach(() => {
    // Make sure window singleton is intact but internals cleared
    resetBus();
    jest.spyOn(console, 'log').mockImplementation(() => { /* silence */ });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('registers events through @TjEvent decorator', () => {
    @TjEvent('decorator-event')
    class DecoratorEvent extends AbstractTjEvent {}

    const bus: any = EventBus;
    expect(bus.eventMap.get('decorator-event')).toBe(DecoratorEvent);
    expect(bus.eventMapReverse.get(DecoratorEvent)).toBe('decorator-event');
    // prototype patched
    expect((DecoratorEvent as any).prototype.eventName).toBe('decorator-event');
  });

  it('throws when emitting an unregistered event', async () => {
    class UnknownEvent extends AbstractTjEvent {}
    await expect(EventBus.emit(new UnknownEvent()))
      .rejects
      .toThrow(/is not registered/);
  });

  it('throws when subscribing to an unregistered event', () => {
    class UnknownEvent extends AbstractTjEvent {}
    expect(() => EventBus.on(UnknownEvent, () => {}))
      .toThrow(/is not registered/);
  });

  it('emits events to all listeners and awaits async handlers', async () => {
    @TjEvent('ping')
    class Ping extends AbstractTjEvent {
      constructor(readonly payload: string) { super(); }
    }

    const handler1 = jest.fn(async (e: Ping) => {
      expect(e.payload).toBe('data');
    });
    const handler2 = jest.fn();

    EventBus.on(Ping, handler1);
    EventBus.on(Ping, handler2);

    await EventBus.emit(new Ping('data'));

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('returns incrementing listener ids', () => {
    @TjEvent('inc')
    class Inc extends AbstractTjEvent {}

    const id1 = EventBus.on(Inc, () => {});
    const id2 = EventBus.on(Inc, () => {});
    expect(id2).toBe(id1 + 1);
  });

  it('unsubscribe stops listener from being called', async () => {
    @TjEvent('off')
    class Off extends AbstractTjEvent {}

    const handler = jest.fn();
    const id = EventBus.on(Off, handler);
    EventBus.unsubscribe(id);

    await EventBus.emit(new Off());
    expect(handler).not.toHaveBeenCalled();
  });

  it('stale listener ids are cleaned up automatically during emit', async () => {
    @TjEvent('cleanup')
    class CleanUp extends AbstractTjEvent {}

    const handler = jest.fn();
    const id = EventBus.on(CleanUp, handler);
    // unsubscribe but internal array still holds the id
    EventBus.unsubscribe(id);

    const bus: any = EventBus;
    expect(bus.eventNameToListenerIds.get('cleanup')).toContain(id);

    await EventBus.emit(new CleanUp());

    // after emit the id should be removed
    expect(bus.eventNameToListenerIds.get('cleanup')).not.toContain(id);
  });

  it('registerEvent is idempotent and does not overwrite existing mapping', () => {
    @TjEvent('once')
    class First extends AbstractTjEvent {}
    // Artificial duplicate registration
    EventBus.registerEvent('once', First);

    const bus: any = EventBus;
    expect(bus.eventMap.get('once')).toBe(First);
  });

  it('getInstance always returns the same singleton', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { EventBus: EventBus2 } = require('@/event-bus/event-bus');
    expect(EventBus2).toBe(EventBus);
    expect(window.__tjEventBus).toBe(EventBus);
  });
});
```

The test-suite:

1. Mocks `console.log` to keep test output clean.  
2. Provides `resetBus()` so each test case starts with a pristine bus while keeping the singleton instance intact.  
3. Validates decorator registration, error paths, async handling, idempotency & clean-up logic.