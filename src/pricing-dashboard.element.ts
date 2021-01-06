import {customElement, html, LitElement, css, property} from 'lit-element';
import {LifecycleMixin} from './helpers/lifecycle-directive';
import {PricingStore} from './pricing/pricing-store';
import {async} from './helpers/async-directive';

@customElement('pricing-dashboard')
export class PricingDashboardElement extends LifecycleMixin(LitElement) {

  static styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
    }

    .container {
      display: flex;
      flex-direction: row;
    }

    price-tile {
      width: 120px;
      height: 100px;
      border: 1px solid grey;
    }
  `;

  private readonly store$ = new PricingStore();

  @property()
  private prices = this.store$
    .getPrices('EURUSD', 'USDJPY', 'EURCAD', 'USDCHF', 'AUDUSD', 'EURJPY', 'GBPUSD', 'USDCAD');

  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  private _removePrices() {
    this.prices = [];
  }

  render() {
    return html`
      <div class="container">
        ${this.prices.map(x => html`<price-tile .price="${async(x)}"></price-tile>`)}
      </div>
      <button @click="${this._removePrices}">Remove Prices</button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'price-dashboard': PricingDashboardElement;
  }
}
