export interface Price {

  // The maximum price that a buyer or buyers are willing to pay for a security.
  readonly bid: number;

  // The minimum price that a seller or sellers are willing to pay for a security.
  readonly ask: number;

  // The median average of the bid and ask.
  readonly mid: number;

  // The difference between the @bid price and the @ask price
  readonly spread: number;
}
