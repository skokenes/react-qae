import React from "react";
import { componentFromStream } from "../util/observable-config.js";
import { defaultProps } from "recompose";
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
import { combineLatest, merge, Observable, of } from "rxjs";
import withSideEffects from "../util/with-side-effects";
import { QaeService, GenericObjectProps } from "../types";
import distinctProp from "../util/distinctProp";

type GenericObjectModel = GenericObjectProps & { qix: QaeService};

export default (QaeContext: React.Context<any>) => {
  
  const GenericObject = componentFromStream((props$: Observable<GenericObjectModel>) => {
    // User Provided Props
    const qDef$ = distinctProp("qDef")(props$);
    const qId$ = distinctProp("qDef")(props$);
    const syncLayouts$: Observable<boolean> = distinctProp("syncLayouts")(props$);
    const syncQProps$: Observable<boolean> = distinctProp("syncQProps")(props$);

    // Unique app$
    const doc$ = props$.pipe(
      distinctProp("qix", "doc$"),
      switchAll(),
      shareReplay(1)
    );

    // Initialize a Generic Object
    const obj$ = doc$.pipe(
      withLatestFrom(props$),
      switchMap(([docH, props] : [any, GenericObjectModel]) => {
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

    // Object qDef changes
    const effectObjChange$ = combineLatest(obj$, qDef$).pipe(
      switchMap(([h, qDef]: [any, object]) => h.ask(SetProperties, qDef))
    );

    // Layouts stream
    const layout$ = syncLayouts$.pipe(
      switchMap((syncLayouts: boolean) => {
        if(syncLayouts) {
          return obj$.pipe(
            invalidations(true),
            qAskReplay(GetLayout),
            filter((layout: any) => layout.qInfo.qType !== "react-qae-temp")
          );
        }
        else return of(null)
      })
    );
    
    // qProps Stream
    const qProps$ = syncQProps$.pipe(
      switchMap((syncQProps: boolean) => {
        if(syncQProps) {
          return obj$.pipe(
            invalidations(true),
            qAskReplay(GetProperties),
            filter((qProps: any) => qProps.qInfo.qType !== "react-qae-temp")
          );
        }
        else return of(null)
      })
    );

    // Props to pass to component
    return combineLatest(props$, layout$, qProps$).pipe(
      withSideEffects(effectObjChange$),
      map(([props, layout, qProps] : [GenericObjectProps, any, any]) => props.children({ layout, obj$, qProps }))
    );
  });

  const ConnectedGenericObject = (props: GenericObjectProps) => (
    <QaeContext.Consumer>
      {(qix: QaeService) => (
        <GenericObject qix={qix} {...props}>
          {props.children}
        </GenericObject>
      )}
    </QaeContext.Consumer>
  );

  const GenericObjectDefaults: Partial<GenericObjectProps> = {
    syncLayouts: true,
    syncQProps: false
  }

  return defaultProps(GenericObjectDefaults)(ConnectedGenericObject);
};
