
export class TjResponsive {
    private breakpoints: { [key: string]: number } = {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400,
    };
    private mutationObserver: MutationObserver | null = null;
    private originalData = new WeakMap<HTMLElement, { classes: string; styles: string }>();

    constructor() {
        if (window.config && window.config?.breakpoints) {
            this.breakpoints = window.config.breakpoints;
        }
    }

    /**
     * Adjusts classes and inline styles of the target element and its children
     * based on the defined breakpoints.
     *
     * @param target HTMLElement to process
     */
    adjust(target: HTMLElement): void {
        const elements: HTMLElement[] = [];
        if (this.needsResponsiveProcessing(target)) {
            elements.push(target);
        }

        const descendants = target.getElementsByTagName("*");
        for (let i = 0; i < descendants.length; i++) {
            const el = descendants[i] as HTMLElement;
            if (this.needsResponsiveProcessing(el)) {
                elements.push(el);
            }
        }

        elements.forEach(element => {
            if (!this.originalData.has(element)) {
                this.originalData.set(element, {
                    classes: element.className,
                    styles: element.getAttribute("style") || "",
                });
            }

            this.applyResponsiveClasses(element, window.innerWidth);
            this.applyResponsiveStyles(element, window.innerWidth);
        });
    }

    /**
     * Determines whether an element should be processed for responsive styles.
     */
    private needsResponsiveProcessing(element: HTMLElement): boolean {
        if (element.hasAttribute("class")) {
            return true;
        }

        for (const attr of Array.from(element.attributes)) {
            if (/^[a-z]+-style$/.test(attr.name)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Parses and applies responsive CSS classes based on conditions.
     */
    private applyResponsiveClasses(element: HTMLElement, width: number): void {
        const classList = element.className.split(/\s+/);
        const newClasses = new Set<string>();
        const originalClasses = new Set(this.originalData.get(element)?.classes.split(/\s+/) || []);

        classList.forEach(cls => {
            const match = cls.match(/^(-?)([a-z]+)(?:-([a-z]+))?:(.+)$/);

            if (match) {
                const [, negative, bp1, bp2, className] = match;
                const minWidth = this.breakpoints[bp1];
                const maxWidth = bp2 ? this.breakpoints[bp2] : undefined;
                const qualifies = this.shouldApplyClass(width, negative, minWidth, maxWidth);

                if (qualifies) {
                    newClasses.add(className);
                }
            } else {
                newClasses.add(cls);
            }
        });

        element.className = [...newClasses].filter(cls => originalClasses.has(cls) || newClasses.has(cls)).join(" ");
    }

    /**
     * Parses and applies responsive inline styles based on conditions.
     */
    private applyResponsiveStyles(element: HTMLElement, width: number): void {
        Array.from(element.attributes).forEach(attr => {
            const match = attr.name.match(/^([a-z]+)-style$/);
            if (match) {
                const bp = match[1];
                const minWidth = this.breakpoints[bp];

                if (width >= minWidth) {
                    element.setAttribute("style", attr.value);
                } else {
                    element.setAttribute("style", this.originalData.get(element)?.styles || "");
                }
            }
        });
    }

    /**
     * Determines whether a class should be applied based on breakpoints.
     */
    private shouldApplyClass(width: number, negative: string, minWidth: number, maxWidth?: number): boolean {
        if (negative) {
            return width < minWidth;
        }
        if (maxWidth !== undefined) {
            return width >= minWidth && width <= maxWidth;
        }
        return width >= minWidth;
    }

    /**
     * Observes changes in target element and its children, adjusting content dynamically.
     *
     * @param target HTMLElement to observe
     */
    observe(target: HTMLElement): void {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }

        this.mutationObserver = new MutationObserver(() => {
            this.adjust(target);
        });

        this.mutationObserver.observe(target, {
            childList: true,
            attributes: true,
            subtree: true
        });
    }
}


declare global {
    interface Window {
        config?: { breakpoints: { [key: string]: number } };
    }
}
