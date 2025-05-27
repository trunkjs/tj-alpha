import { Constructor } from '@/tools/types';

export abstract class AbstractTjEvent {}

export function TjEvent(eventName: string) {
    return function (constructor: Constructor) {
        EventBus.registerEvent(eventName, constructor);
        constructor.prototype.eventName = eventName;
    };
}

declare global {
    interface Window {
        __tjEventBus?: _EventBus;
    }
}

class _EventBus {

    static getInstance(): _EventBus {
        if (!window.__tjEventBus) {
            window.__tjEventBus = new _EventBus();
            Object.defineProperty(window, '__tjEventBus', {
                writable: false,
                configurable: false,
            })
        }

        return window.__tjEventBus;
    }

    private readonly eventMap = new Map<string, Function>();
    private readonly eventMapReverse = new Map<Function, string>();

    private nextListenerId = 0;
    private listenerIdToCallback = new Map<number, ((event: AbstractTjEvent) => Promise<void>)>();
    private readonly eventNameToListenerIds = new Map<string, number[]>();

    async emit(event: AbstractTjEvent) {
        const name = this.eventMapReverse.get(event.constructor);
        if (!name) {
            throw new Error(`Event ${event.constructor.name} is not registered.`);
        }

        const listenerIds = (this.eventNameToListenerIds.get(name)) ?? [];
        for (const listenerId of listenerIds) {
            const cb = this.listenerIdToCallback.get(listenerId);
            if (!cb) {
                this.eventNameToListenerIds.set(name, listenerIds.filter(i => i !== listenerId))
                continue;
            }

            await cb(event);
        }
    }

    on<E extends AbstractTjEvent>(event: Constructor<E>, cb: (event: E) => void) {
        const name = this.eventMapReverse.get(event);
        if (!name) {
            throw new Error(`Event ${event.name} is not registered.`);
        }

        const listenerId = ++this.nextListenerId;
        console.log(`created listener ${this.nextListenerId}`)

        // @ts-expect-error
        this.listenerIdToCallback.set(listenerId, (e: AbstractTjEvent) => cb(e))

        if (!this.eventNameToListenerIds.has(name)) {
            this.eventNameToListenerIds.set(name, [])
        }
        this.eventNameToListenerIds.get(name)!.push(listenerId);
        return listenerId;
    }

    unsubscribe(listenerId: number) {
        this.listenerIdToCallback.delete(listenerId)
    }

    registerEvent(name: string, constructor: Constructor<AbstractTjEvent>) {
        if (this.eventMap.has(name)) {
            return
        }

        this.eventMap.set(name, constructor);
        this.eventMapReverse.set(constructor, name);
    }

}

export const EventBus = _EventBus.getInstance();
