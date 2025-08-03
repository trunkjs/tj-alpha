import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('tool-window')
export class ToolWindow extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      display: block;
      border: 1px solid #888;
      background: #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      min-width: 200px;
      min-height: 32px;
      user-select: none;
      z-index: 99999;
    }
    .header {
      background: #444;
      color: white;
      padding: 4px 8px;
      cursor: move;
      font-size: 0.9rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .buttons button {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 0.9rem;
      margin-left: 4px;
    }
    .content-scroller {
      padding: 0 ;
      overflow: auto;

      height: calc(100% - 32px); /* Adjust for header height */
    }
    .content {
      padding: 8px;
      box-sizing: border-box;
      height: 100%;
    }
    .resize-handle {
      position: absolute;
      width: 10px;
      height: 10px;
      background: transparent;
    }
    .resize-handle.br { bottom: 0; right: 0; cursor: se-resize; }
    .resize-handle.bl { bottom: 0; left: 0; cursor: sw-resize; }
    .resize-handle.tr { top: 0; right: 0; cursor: ne-resize; }
    .resize-handle.tl { top: 0; left: 0; cursor: nw-resize; }
  `;

  @property({type: String}) title = 'Tool Window';
  @property({type: Boolean}) fixed = true;

  @state() private _dragging = false;
  @state() private _resizing: string | null = null;
  @state() private _minimized = false;

  private _offsetX = 0;
  private _offsetY = 0;
  private _origWidth = 0;
  private _origHeight = 0;

  connectedCallback() {
    super.connectedCallback();
    this.style.left = this.style.left || '100px';
    this.style.top = this.style.top || '100px';
    this.style.position = this.fixed ? 'fixed' : 'absolute';
  }

  private _onMouseDown(e: MouseEvent) {
    this._dragging = true;
    this._offsetX = e.clientX - this.offsetLeft;
    this._offsetY = e.clientY - this.offsetTop;
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
  }

  private _onMouseMove = (e: MouseEvent) => {
    if (this._dragging) {
      this.style.left = `${e.clientX - this._offsetX}px`;
      this.style.top = `${e.clientY - this._offsetY}px`;
    } else if (this._resizing) {
      const dx = e.clientX - this.offsetLeft;
      const dy = e.clientY - this.offsetTop;
      if (this._resizing.includes('r')) this.style.width = `${dx}px`;
      if (this._resizing.includes('b')) this.style.height = `${dy}px`;
      if (this._resizing.includes('l')) {
        const newWidth = this._origWidth + (this._offsetX - e.clientX);
        this.style.width = `${newWidth}px`;
        this.style.left = `${e.clientX}px`;
      }
      if (this._resizing.includes('t')) {
        const newHeight = this._origHeight + (this._offsetY - e.clientY);
        this.style.height = `${newHeight}px`;
        this.style.top = `${e.clientY}px`;
      }
    }
  };

  private _onMouseUp = () => {
    this._dragging = false;
    this._resizing = null;
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
  };

  private _onResizeDown(e: MouseEvent, dir: string) {
    e.stopPropagation();
    this._resizing = dir;
    this._offsetX = e.clientX;
    this._offsetY = e.clientY;
    this._origWidth = this.offsetWidth;
    this._origHeight = this.offsetHeight;
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
  }

  private _toggleMinimize() {
    this._minimized = !this._minimized;
    this.style.height = this._minimized ? 'auto' : '';
    this.requestUpdate();
  }

  private _close() {
    this.remove();
  }

  render() {
    return html`
      <div class="header" @mousedown=${this._onMouseDown}>
        <span>${this.title}</span>
        <div class="buttons">
          <button @click=${this._toggleMinimize}>${this._minimized ? '▢' : '—'}</button>
          <button @click=${this._close}>✕</button>
        </div>
      </div>
      ${!this._minimized ? html`
        <div class="content-scroller">
          <div class="content">
            <slot></slot>
          </div>
        </div>` : null}
      ${['tl','tr','bl','br'].map(dir =>
        html`<div class="resize-handle ${dir}"
                  @mousedown=${(e: MouseEvent) => this._onResizeDown(e, dir)}></div>`)}
    `;
  }
}
