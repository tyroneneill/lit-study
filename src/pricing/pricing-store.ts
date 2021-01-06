import {Observable, interval} from 'rxjs';
import {map} from 'rxjs/operators';
import {Price} from './price.model';

export class PricingStore {

  public getPrices(...symbols: string[]): Observable<Price>[] {
    return symbols.map(() => this.createPrice());
  }

  private count = 0;

  private createPrice(): Observable<Price> {
    const precision = 3;
    const multiplier = Math.pow(10, precision);
    const id = (++this.count).toString();
    return interval(2000 + (Math.round(Math.random() * 250))).pipe(
      map(() => {
        const bid = Math.round((1.1 + Math.random() * 0.3) * multiplier) / multiplier;
        const ask = Math.round((bid + Math.random() * 0.2) * multiplier) / multiplier;
        const mid = Math.round(((bid + ask) / 2) * multiplier) / multiplier;
        const spread = (ask - bid) * multiplier;
        return {id, bid, ask, mid, spread};
      }),
    );
  }
}



