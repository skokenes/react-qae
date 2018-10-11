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
  switchAll,
  switchMap,
  shareReplay,
  filter,
  withLatestFrom,
  pluck
} from "rxjs/operators";
import { combineLatest, merge, Observable, of, never } from "rxjs";
import withSideEffects from "../util/with-side-effects.js";
import {
  QaeService,
  GenericObjectProps,
  GenericObjectRenderProperties,
  GenericObjectRenderLayout,
  GenericObjectStreams
} from "../types.js";
import distinctProp from "../util/distinctProp.js";
import QaeContext from "../qae-context";

type GenericObjectModel = GenericObjectProps & { qix: QaeService };

const createGenericObject = (
  extendProps: (streams: GenericObjectStreams) => Observable<object> = () =>
    of({})
) => {
  const GenericObject = componentFromStream(
    (props$: Observable<GenericObjectModel>) => {
      // User Provided Props
      const qDef$: Observable<
        EngineAPI.IGenericObjectProperties
      > = distinctProp("qDef")(props$);
      const qId$: Observable<string> = distinctProp("qId")(props$);
      const syncLayouts$: Observable<boolean> = distinctProp("syncLayouts")(
        props$
      );
      const syncQProps$: Observable<boolean> = distinctProp("syncQProps")(
        props$
      );

      // Unique app$
      const doc$: Observable<Handle> = props$.pipe(
        distinctProp("qix", "doc$"),
        switchAll(),
        shareReplay(1)
      );

      // Initialize a Generic Object
      const obj$: Observable<Handle> = doc$.pipe(
        withLatestFrom(qId$),
        switchMap(([docH, qId]: [Handle, string | undefined]) => {
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
      const layouts$: Observable<GenericObjectRenderLayout> = syncLayouts$.pipe(
        switchMap((syncLayouts: boolean) => {
          if (syncLayouts) {
            return obj$.pipe(
              invalidations(true),
              qAskReplay(GetLayout),
              filter(
                (layout: EngineAPI.IGenericObjectLayout) =>
                  layout.qInfo.qType !== "react-qae-temp"
              )
            );
          } else return of(null);
        }),
        shareReplay(1)
      );

      // qProps Stream
      const qProps$: Observable<
        GenericObjectRenderProperties
      > = syncQProps$.pipe(
        switchMap((syncQProps: boolean) => {
          if (syncQProps) {
            return obj$.pipe(
              invalidations(true),
              qAskReplay(GetProperties),
              filter(
                (qProps: EngineAPI.IGenericObjectProperties) =>
                  qProps.qInfo.qType !== "react-qae-temp"
              )
            );
          } else return of(null);
        }),
        shareReplay(1)
      );

      const extendedProps$: Observable<object> = extendProps({
        props$,
        layouts$,
        qProps$,
        obj$
      });

      // Props to pass to component
      return combineLatest(props$, layouts$, qProps$, extendedProps$).pipe(
        withSideEffects(effectObjChange$),
        map(
          ([props, layout, qProps, extendedProps]: [
            GenericObjectProps,
            GenericObjectRenderLayout,
            GenericObjectRenderProperties,
            object
          ]) => props.children({ layout, obj$, qProps, ...extendedProps })
        )
      );
    }
  );

  const ConnectedGenericObject: React.SFC<GenericObjectProps> = (
    props: GenericObjectProps
  ) => (
    <QaeContext.Consumer>
      {qix => {
        if (qix === null) {
          throw Error(
            "QaeService was not defined. Did you forget to pass a QaeService in the Provider?"
          );
        }
        return (
          <GenericObject qix={qix} {...props}>
            {props.children}
          </GenericObject>
        );
      }}
    </QaeContext.Consumer>
  );

  const GenericObjectDefaults: Partial<GenericObjectProps> = {
    syncLayouts: true,
    syncQProps: false,
    extendProps: () => never()
  };

  return defaultProps(GenericObjectDefaults)(
    ConnectedGenericObject
  ) as React.SFC<GenericObjectProps>;
};

const GenericObject = createGenericObject();

export default GenericObject;

export { createGenericObject };
