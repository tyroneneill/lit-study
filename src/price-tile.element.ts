import {LitElement, html, customElement, property, css} from 'lit-element';
import {RxState} from './helpers/rx-state';
import {Price} from './pricing/price.model';

type PriceTileState = {locked: boolean; count: number; showFractions: boolean};

const initialState = {locked: false, count: 0, showFractions: true};

@customElement('price-tile')
export class PriceTileElement extends RxState<PriceTileState>(initialState)(LitElement) {

  static styles = css`
    .price-tile {
      background-color: mediumpurple
    }
    .price-tile:hover {
      background-color: cornflowerblue
    }
  `;

  constructor() {
    super();
  }

  @property()
  price: Price | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.state$.subscribe(state => {
      console.log(`>> state update`, state);
    });
  }

  private _handleClick() {
    this.setState('count', ({count}) => ++count);
  }

  render() {
    return html`
      <div class="price-tile">
        <div @click="${this._handleClick}">bid: ${this.price?.bid}</div>
        <div>mid: ${this.price?.mid}</div>
        <div>ask: ${this.price?.ask}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'price-tile': PriceTileElement;
  }
}

