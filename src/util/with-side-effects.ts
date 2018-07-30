import { ignoreElements } from "rxjs/operators";
import { merge, Observable } from "rxjs";

export default (...args: Observable<any>[]) => (src$: Observable<any>) => {
  const effects$ = merge(...args).pipe(ignoreElements());
  return merge(src$, effects$);
};
