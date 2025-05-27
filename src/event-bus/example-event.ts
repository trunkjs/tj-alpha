import { AbstractTjEvent, EventBus, TjEvent } from '@/event-bus/event-bus';
import { sleep } from '@/tools/sleep';

@TjEvent('example-event')
export class ExampleEvent extends AbstractTjEvent {
    constructor(
        readonly data: string,
    ) {
        super();
    }

}


export class MessageBusUser {
    private listenerId: number|undefined;

    async emitExampleEvent(data: string) {
        const event = new ExampleEvent(data);
        await EventBus.emit(event);
        console.log('emitted and waited for listeners')
    }
    async emitExampleEventDontWait(data: string) {
        const event = new ExampleEvent(data);
        EventBus.emit(event);
        console.log('emitted, not waiting')
    }

    async setupListener() {
        this.listenerId = EventBus.on(ExampleEvent, async (event) => {
            console.log('Received ExampleEvent:', event.data);
            await sleep(1500);
            console.log('Finished ExampleEvent:');
        });
    }

    unsubscribe() {
        if (this.listenerId) {
            EventBus.unsubscribe(this.listenerId)
            console.log(`unsubscribed ${this.listenerId}`)
        }
    }
}
