import {ConnectableObservable, Observable, Subject, Subscription} from 'rxjs';
import {distinctUntilChanged, map, publishBehavior, scan, take} from 'rxjs/operators';

interface CustomElement {
  connectedCallback(): void;

  disconnectedCallback(): void;

  readonly isConnected: boolean;
}

type Constructor<T> = new(...args: any[]) => T;

// type ProjectStateFn<T> = (oldState: T) => Partial<T>;
type ProjectValueFn<T, K extends keyof T> = (oldState: T) => T[K];

export const defaultReducer = <T>(current: T, slice: Partial<T>): T => {
  return Object.entries(slice)
    .reduce((state: any | T, [key, value]) => {
      if (state[key] !== value) {
        return {...state, [key]: value};
      }
      return state;
    }, current);
};

export const RxState =
  <S extends object>(initialState: S) =>
    <T extends Constructor<CustomElement>>(baseElement: T) =>
      class extends baseElement {

        readonly _updates = new Subject<Partial<S>>();

        readonly state$: Observable<S> = this._updates
          .pipe(
            scan(defaultReducer, initialState),
            distinctUntilChanged(),
            publishBehavior(initialState),
          );

        _stateSubscription: Subscription | undefined;

        connectedCallback() {
          super.connectedCallback();
          this._stateSubscription = (this.state$ as ConnectableObservable<S>).connect();
        }

        disconnectedCallback() {
          super.disconnectedCallback();
          if (this._stateSubscription) {
            this._stateSubscription.unsubscribe();
          }
        }

        setState<K extends keyof S>(key: K,
                                    projectSlice: ProjectValueFn<S, K>): void {
          this.state$.pipe(
            take(1),
            map(state => {
              const slice: Partial<S> = {};
              slice[key] = projectSlice(state as S);
              return slice;
            }),
          ).subscribe(slice => this._updates.next(slice));
        }

        // connect(inputOrSlice$: Observable<Partial<T>>): void {
        //
        // }

        // setAccumulator(accumulatorFn: AccumulationFn): void {
        //   this.accumulator.nextAccumulator(accumulatorFn);
        // }

      };
