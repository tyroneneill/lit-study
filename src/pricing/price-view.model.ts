import {SplitPrice} from './split-price.model';

export type PriceView = Readonly<{bid: SplitPrice; mid: SplitPrice; ask: SplitPrice}>;
