import { TemplateResult } from 'lit';

export function litTemplateToString(template: TemplateResult): string {
    const strings = template.strings;
    const values = template.values;

    let result = '';
    for (let i = 0; i < strings.length; i++) {
        result += strings[i];
        if (i < values.length) {
            result += String(values[i]);
        }
    }

    return result;
}
