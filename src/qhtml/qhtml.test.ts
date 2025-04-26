import { describe, it, expect, beforeEach } from 'vitest'
import { qhtml } from './qhtml'

describe('qhtml', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.innerHTML = '';
        document.body.appendChild(container);
    });

    it('should create a simple element hierarchy', () => {
        const frag = qhtml`
            .root
            > p | Hello World
        `;
        container.appendChild(frag);


        const root = container.querySelector('.root');
        expect(root).toBeInstanceOf(HTMLElement);
        expect(root?.querySelector('p')?.textContent).toBe('Hello World');
    });

    it('should attach class and id attributes', () => {
        const frag = qhtml`
            div.my-class#my-id
        `;
        container.appendChild(frag);

        const el = container.querySelector('#my-id');
        expect(el).not.toBeNull();
        expect(el?.classList.contains('my-class')).toBeTruthy();
    });

    it('should support nested depth using >', () => {
        const frag = qhtml`
            ul
            > li | Item 1
            > li | Item 2
        `;
        container.appendChild(frag);

        const ul = container.querySelector('ul');
        const items = ul?.querySelectorAll('li');
        expect(items?.length).toBe(2);
        expect(items?.[0].textContent).toBe('Item 1');
        expect(items?.[1].textContent).toBe('Item 2');
    });

    it('should parse quoted attribute values', () => {
        const frag = qhtml`
            input type="text" placeholder='Say "hi"'
        `;
        container.appendChild(frag);

        const input = container.querySelector('input');
        expect(input?.getAttribute('placeholder')).toBe('Say "hi"');
        expect(input?.getAttribute('type')).toBe('text');
    });

    it('should inject text nodes using |', () => {
        const frag = qhtml`
            .container
            | Hello
            | World
        `;
        container.appendChild(frag);

        const containerEl = container.querySelector('.container');
        expect(containerEl?.textContent).toBe('HelloWorld');
    });

    it('should throw on invalid attribute', () => {
        expect(() =>
            qhtml`
                div invalidAttr
            `
        ).toThrowError('lacks \'=\'');
    });

    it('should throw on unmatched quote', () => {
        expect(() =>
            qhtml`
                input name="myName
            `
        ).toThrowError(/Unterminated string/);
    });

    it('should support inline comments', () => {
        const frag = qhtml`
            div | Text %% comment here
        `;
        container.appendChild(frag);

        const commentNode = Array.from(container.querySelector('div')?.childNodes ?? [])
            .find(n => n.nodeType === Node.COMMENT_NODE);

        expect(commentNode?.nodeValue?.includes('comment here')).toBeTruthy();
    });

    it('should support element with only class or id', () => {
        const frag = qhtml`
            .only-class
            #only-id
        `;
        container.appendChild(frag);

        expect(container.querySelector('.only-class')).not.toBeNull();
        expect(container.querySelector('#only-id')).not.toBeNull();
    });

    it('should allow escaping quotes in string attrs', () => {
        const frag = qhtml`
            input title="He said: \\\"hi\\\" and left"
        `;
        container.appendChild(frag);
        const input = container.querySelector('input');
        expect(input?.getAttribute('title')).toBe('He said: "hi" and left');
    });

    it('should handle multiple class definitions', () => {
        const frag = qhtml`
            div.box red bold
        `;
        container.appendChild(frag);

        const el = container.querySelector('.box');
        expect(el?.classList.contains('red')).toBeTruthy();
        expect(el?.classList.contains('bold')).toBeTruthy();
    });
});
