
class FormBinder {




}

type BindData = {
    click?: string;
    submit?: string;
    change?: string;
    input?: string;
    focus?: string;
    blur?: string;
    keydown?: string;
    keyup?: string;
    keypress?: string;
    mouseover?: string;
    mouseout?: string;
    mousedown?: string;
    mouseup?: string;
    mousemove?: string;
    touchstart?: string;
    touchend?: string;
    touchmove?: string;
    touchcancel?: string;
    dragstart?: string;
    dragend?: string;

}

type BindOptions = {
    validate?: boolean;
    debounce?: number;
    throttle?: number;
}

export function tj_bind(element: HTMLFormElement|HTMLFormControlsCollection, bind: BindData, options: BindOptions) {
    // Checks if the element is already bind. If it is, then it will return the binder. Otherwis it will create a new binder. and return it.
    let form = new FormBinder();
    return form;
}



//
