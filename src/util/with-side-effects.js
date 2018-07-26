import { ignoreElements } from "rxjs/operators";
import { merge } from "rxjs";

export default (...args) => src$ => {
  const effects$ = merge(...args).pipe(ignoreElements());
  return merge(src$, effects$);
};
