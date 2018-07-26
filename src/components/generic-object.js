import React from "react";
import { componentFromStream } from "../util/observable-config.js";
import { plan } from "react-streams";
import { qAsk, qAskReplay, invalidations } from "rxq";
import { CreateSessionObject, GetObject } from "rxq/Doc";
import { GetLayout, SetProperties, GetProperties } from "rxq/GenericObject";
import {
  map,
  distinctUntilChanged,
  switchAll,
  switchMap,
  shareReplay,
  filter,
  startWith,
  withLatestFrom,
  ignoreElements,
  take,
  tap,
  skip
} from "rxjs/operators";
import { combineLatest, merge } from "rxjs";
import withSideEffects from "../util/with-side-effects";

export default QaeContext => {
  const GenericObject = componentFromStream(props$ => {
    // Unique app$
    const doc$ = props$.pipe(
      map(props => props.qix.doc$),
      distinctUntilChanged(),
      switchAll(),
      shareReplay(1)
    );

    // Initialize a Generic Object
    const obj$ = doc$.pipe(
      withLatestFrom(props$),
      switchMap(([docH, props]) => {
        if (typeof props.qId !== "undefined") {
          return docH.ask(GetObject, props.qId);
        } else
          return docH.ask(CreateSessionObject, {
            qInfo: {
              qType: "react-qae-temp"
            }
          });
      }),
      shareReplay(1)
    );

    // qDef's
    const qDef$ = props$.pipe(
      map(props => props.qDef),
      distinctUntilChanged(),
      filter(qDef => typeof qDef !== "undefined")
    );

    // Object qDef changes
    const effectObjChange$ = combineLatest(obj$, qDef$).pipe(
      switchMap(([h, qDef]) => h.ask(SetProperties, qDef))
    );

    // Re-validating layout stream
    const layout$ = obj$.pipe(
      invalidations(true),
      qAskReplay(GetLayout),
      filter(layout => layout.qInfo.qType !== "react-qae-temp")
    );

    // Obj Props stream
    const qProps$ = obj$.pipe(
      invalidations(true),
      qAskReplay(GetProperties),
      filter(qProps => qProps.qInfo.qType !== "react-qae-temp")
    );

    // Props to pass to component
    return combineLatest(props$, layout$, qProps$).pipe(
      withSideEffects(effectObjChange$),
      map(([props, layout, qProps]) => props.children({ layout, obj$, qProps }))
    );
  });

  return props => (
    <QaeContext.Consumer>
      {qix => (
        <GenericObject qix={qix} {...props}>
          {props.children}
        </GenericObject>
      )}
    </QaeContext.Consumer>
  );
};
