import {LitElement, html, unsafeCSS} from "lit";
import {customElement} from "lit/decorators.js";
import style from "./ErrorElement.scss?inline";

@customElement("tj-error-element")
export class TjErrorElement extends LitElement {

  private originalCode?: string;
  private message: string;
  static styles = [unsafeCSS(style)];
  static get is() {
    return "tj-error-element";
  }


  constructor(message: string = "An error occurred", originalCode?: string) {
    super();
    this.message = message;
    this.originalCode = originalCode;
  }

  render() {
    return html`
      <div id="error-fixed-indicator" @click=${() => this.scrollIntoView({behavior: "smooth"})}>Err: ${this.message}</div>
      <div id="error">
        <h1>Error: ${this.message}</h1>
        <pre class="error-details">
          ${this.originalCode ? this.originalCode : "No code provided."}
        </pre>

      </div>
    `;
  }

}
