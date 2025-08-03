import { LitElement } from 'lit';
import { html } from 'lit/html.js';
import {ToolWindow} from "@/ToolWindow/ToolWindow";

type Constructor<T = {}> = abstract new (...args: any[]) => T;

export function ToolWindowMixin<TBase extends Constructor<LitElement>>(Base: TBase) {
  abstract class ToolWindowMixinClass extends Base {

    public toolWindow : ToolWindow;


    constructor(...args: any[]) {
      super(...args);
      document.body.appendChild(this);
      console.log("ToolWindowMixin constructor called");
    }


    render(content?: any) {
      // Add a reference to the tool window by using the reference
      console.log("ToolWindowMixin render called");
      return html`<tool-window>${content}</tool-window>`;
    }
  };

  return ToolWindowMixinClass;
}
