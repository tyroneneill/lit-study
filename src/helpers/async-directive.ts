import {Part} from 'lit-html';
import {Observable, Subscription} from 'rxjs';
import {lifecycleDirective} from './lifecycle-directive';

const subscriptions = new WeakMap<Part, Subscription>();

export const async = lifecycleDirective((obs: Observable<any>) => {
  return (part: Part) => {
    if (subscriptions.has(part)) {
      return;
    }
    const sub = obs.subscribe(x => {
      part.setValue(x);
      part.commit();
    });
    subscriptions.set(part, sub);
    return () => {
      sub.unsubscribe();
      subscriptions.delete(part);
    };
  };
});
