import React, { ReactNode } from "react";
import { componentFromStream } from "../util/observable-config.js";
import { defaultProps } from "recompose";
import { qAsk, qAskReplay, invalidations, Handle } from "rxq";
// @ts-ignore
import { CreateSessionObject, GetObject } from "rxq/Doc";
// @ts-ignore
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
  skip,
  pluck
} from "rxjs/operators";
import { combineLatest, merge, Observable, of } from "rxjs";
import { Subscribable } from "recompose";
import withSideEffects from "../util/with-side-effects.js";
import { QaeService, GenericObjectProps } from "../types.js";
import distinctProp from "../util/distinctProp.js";

type GenericObjectModel = GenericObjectProps & { qix: QaeService};

export default (QaeContext: React.Context<any>) => {
  
  const GenericObject = componentFromStream((props$: Observable<GenericObjectModel>) => {
    // User Provided Props
    const qDef$: Observable<EngineAPI.IGenericObjectProperties> = distinctProp("qDef")(props$);
    const qId$: Observable<string> = distinctProp("qId")(props$);
    const syncLayouts$: Observable<boolean> = distinctProp("syncLayouts")(props$);
    const syncQProps$: Observable<boolean> = distinctProp("syncQProps")(props$);

    // Unique app$
    const doc$: Observable<Handle> = props$.pipe(
      distinctProp("qix", "doc$"),
      switchAll(),
      shareReplay(1)
    );

    // Initialize a Generic Object
    const obj$: Observable<Handle> = doc$.pipe(
      withLatestFrom(qId$),
      switchMap(([docH, qId] : [Handle, GenericObjectModel]) => {
        if (typeof qId !== "undefined") {
          return docH.ask(GetObject, qId);
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
      withLatestFrom(qId$),
      filter(([[handle, qDef], qId]) => typeof qId === "undefined"),
      pluck("0"),
      switchMap(([h, qDef]: [any, object]) => h.ask(SetProperties, qDef))
    );

    // Layouts stream
    const layout$: Observable<EngineAPI.IGenericObjectLayout | null> = syncLayouts$.pipe(
      switchMap((syncLayouts: boolean) => {
        if(syncLayouts) {
          return obj$.pipe(
            invalidations(true),
            qAskReplay(GetLayout),
            filter((layout: EngineAPI.IGenericObjectLayout) => layout.qInfo.qType !== "react-qae-temp")
          );
        }
        else return of(null)
      })
    );
    
    // qProps Stream
    const qProps$: Observable<EngineAPI.IGenericObjectProperties | null> = syncQProps$.pipe(
      switchMap((syncQProps: boolean) => {
        if(syncQProps) {
          return obj$.pipe(
            invalidations(true),
            qAskReplay(GetProperties),
            filter((qProps: EngineAPI.IGenericObjectProperties) => qProps.qInfo.qType !== "react-qae-temp")
          );
        }
        else return of(null)
      })
    );

    // Props to pass to component
    return combineLatest(props$, layout$, qProps$).pipe(
      withSideEffects(effectObjChange$),
      map(([props, layout, qProps] : [GenericObjectProps, EngineAPI.IGenericObjectLayout, EngineAPI.IGenericObjectProperties]) => props.children({ layout, obj$, qProps }))
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
