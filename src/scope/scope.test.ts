
import { tj_scope, Scope } from './scope';
import { it, expect, describe } from 'vitest'


describe('tj_scope', () => {
    it('should initialize the scope object correctly', () => {
        const scope = tj_scope({
            form: null,
            $fn: {
                hello: () => 'Hello'
            },
            $refs: {},
            $watch: {}
        });

        expect(scope.form).toBeNull();
        expect(scope.$fn?.hello()).toBe('Hello');
    });

    it('should allow updating properties', () => {
        const scope = tj_scope({
            form: 'initial',
            $fn: {},
            $refs: {},
            $watch: {}
        });

        scope.form = 'updated';
        expect(scope.form).toBe('updated');
    });

    it('should return undefined for non-existent properties', () => {
        const scope = tj_scope({
            form: null,
            $fn: {},
            $refs: {},
            $watch: {}
        });

        expect(scope['nonExistent']).toBeUndefined();
    });

    it('should correctly access functions stored in $fn', () => {
        const scope = tj_scope({
            form: null,
            $fn: {
                greet: (name: string) => `Hello, ${name}!`
            },
            $refs: {},
            $watch: {}
        });

        expect(scope.$fn?.greet('World')).toBe('Hello, World!');
    });

    it('should correctly set $refs properties', () => {
        const scope = tj_scope({
            form: '',
            $fn: {},
            $refs: { button: document.createElement('button') },
            $watch: {}
        });

        const newButton = document.createElement('button');
        scope.$refs!.button = newButton;
        expect(scope.$refs!.button).toBe(newButton);
    });

    it('should properly trigger $watch functions', () => {
        let eventFired = false;
        const scope = tj_scope({
            form: '',
            $fn: {},
            $refs: {},
            $watch: {
                'form': (event, value) => {
                    eventFired = true;
                    expect(value).toBe('new value');
                }
            }
        });

        scope.form = 'new value';
        expect(eventFired).toBe(true);
    });
});
