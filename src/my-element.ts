
import {LitElement, html, customElement, property, css} from 'lit-element';
import {interval} from 'rxjs';
import {async} from './helpers/async-directive';
import {LifecycleMixin} from './helpers/lifecycle-directive';

@customElement('my-element')
export class MyElement extends LifecycleMixin(LitElement) {
  static styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
    }
    pricing-dashboard {
      width: 100%;
      height: 100px;
    }
  `;

  @property()
  count = interval(1000);

  render() {
    return html`
      <h1>Count, ${async(this.count)}!</h1>
      <pricing-dashboard></pricing-dashboard>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement;
  }
}
