import { React } from "react";
import { componentFromStream, createEventHandler } from "recompose";
import { createSessionObject } from "rxq/Doc";
import { getLayout, setProperties } from "rxq/GenericObject";
import {
  map,
  distinctUntilChanged,
  switchAll,
  switchMap,
  shareReplay,
  startWith,
  withLatestFrom,
  ignoreElements,
  take,
  skip
} from "rxjs/operators";
import { combineLatest } from "rxjs/observable/combineLatest";
import { merge } from "rxjs/observable/merge";
import withSideEffects from "../util/with-side-effects";

export default QaeContext => {
  const GenericObject = componentFromStream(props$ => {
    // Unique app$
    const app$ = props$.pipe(
      map(props => props.qix.app$),
      distinctUntilChanged(),
      switchAll()
    );

    // Initialize a Generic Object
    const obj$ = app$.pipe(
      switchMap(h =>
        createSessionObject(h, {
          qInfo: {
            qType: "react-qae-temp"
          }
        })
      )
    );

    // qDef's
    const qDef$ = props$.pipe(map(props => props.qDef), distinctUntilChanged());

    // Object qDef changes
    const effectObjChange$ = combineLatest(obj$, qDef$).pipe(
      switchMap(([h, qDef]) => setProperties(h, qDef))
    );

    // Re-validating layout stream
    const layout$ = obj$.pipe(
      switchMap(h => h.invalidated$.pipe(startWith(h))),
      switchMap(h => getLayout(h)),
      shareReplay(1)
    );

    // Props to pass to component
    return combineLatest(props$, layout$).pipe(
      withSideEffects(effectObjChange$),
      map(([props, layout]) => props.children({ layout }))
    );
  });

  return props => (
    <QaeContext.Consumer>
      {qix => (
        <GenericObject qix {...props}>
          {props.children}
        </GenericObject>
      )}
    </QaeContext.Consumer>
  );
};
