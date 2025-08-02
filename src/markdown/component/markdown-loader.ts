import {ReactiveElement} from "lit";
import {customElement} from "lit/decorators.js";
import {property} from "lit/decorators.js";
import {LoggingMixin} from "@/tools/mixins/LoggingMixin";
import {MarkdownDocument} from "@/markdown/markdown";


@customElement('markdown-loader')
export class MarkdownLoader extends LoggingMixin(ReactiveElement) {

  @property({type: String}) target: string = '';
  @property({type: String}) src: string = '';

  async connectedCallback() {
    super.connectedCallback();

    let content : string | null = null;
    if (this.src) {
      // Fetch the markdown content from the src URL
      try {
        const response = await fetch(this.src);
        if (!response.ok) {
          throw new Error(`Failed to fetch markdown from ${this.src}`);
        }
        content = await response.text();

      } catch (error) {
        this.error('Error fetching markdown:', error);
      }


    } else {
      content = this.querySelector("script")?.innerText || null;
      if (!content) {
        this.warn('No content found in script tag or src attribute is missing');
        return;
      }
      content = content.trim(); // Trim whitespace from the content
      // Remove any leading <!-- and -->
      if (content.startsWith('<!--') && content.endsWith('-->')) {
        content = content.slice(4, -3).trim(); // Remove the comment markers
      }
    }

    let target = document.querySelector(this.target);
    if (!target) {
      this.warn(`Target element "${this.target}" not found`);
      return;
    }

    if ( !content) {
      this.warn('No content to render');
      return;
    }

    const markdownDocument = new MarkdownDocument();
    markdownDocument.markdown = content;

    let html = markdownDocument.getHTML()

    target.innerHTML = html.innerHTML;
  }

}
