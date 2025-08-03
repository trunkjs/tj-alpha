


import "./../ToolWindowMixin";
import "./../ToolWindow";
import {customElement} from "lit/decorators.js";
import {html} from "lit/html.js";
import {ToolWindowMixin} from "../ToolWindowMixin";
import {LitElement} from "lit";
import {LoggingMixin} from "@/tools/mixins/LoggingMixin";

@customElement('tool-window-2')
class ToolWindow2 extends LoggingMixin(ToolWindowMixin(LitElement)) {




  render() {

    return super.render(html`
        <div class="tool-window">
          <h1>Tool Window 2</h1>
          <p>This is a tool window that extends the ToolWindowMixin.</p>
          <content-area2></content-area2>
        </div>
      `);
  }
}

let n = new ToolWindow2();
