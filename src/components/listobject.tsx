import React from "react";
import createGenericObjectComponent from "./generic-object";
import {
  GenericObjectStreams,
  GenericObjectProps,
  QaeService,
  ListObjectProps
} from "../types";
import { of, Observable, combineLatest, merge } from "rxjs";
import {
  componentFromStream,
  createEventHandler
} from "../util/observable-config.js";
import distinctProp from "../util/distinctProp";
import {
  pluck,
  distinctUntilChanged,
  map,
  filter,
  withLatestFrom,
  switchMap,
  tap,
  ignoreElements
} from "rxjs/operators";

// List Object Extended Logic
const extendLogic = (streams: GenericObjectStreams) => {
  // Intent
  const {
    handler: selectListObjectValuesHandler,
    stream: selectListObjectValues$
  }: {
    handler: (
      params: { qValues: number[]; qToggleMode: boolean; qSoftLock?: boolean }
    ) => void;
    stream: Observable<{
      qValues: number[];
      qToggleMode: boolean;
      qSoftLock?: boolean;
    }>;
  } = createEventHandler();

  const selectListObjectValues = (
    qValues: number[],
    qToggleMode: boolean,
    qSoftLock?: boolean
  ) => {
    selectListObjectValuesHandler({ qValues, qToggleMode, qSoftLock });
  };

  const props$ = streams.props$ as Observable<
    GenericObjectProps & ListObjectProps
  >;
  const layouts$ = streams.layouts$;
  const obj$ = streams.obj$;
  const dataPageDef$ = props$.pipe(
    map(props => props.dataPageDef),
    distinctUntilChanged((a, b) => {
      return (
        a.qTop === b.qTop &&
        a.qLeft === b.qLeft &&
        a.qHeight === b.qHeight &&
        a.qWidth === b.qWidth
      );
    })
  );

  const nonNullLayouts$ = layouts$.pipe(
    filter(layout => layout !== null)
  ) as Observable<EngineAPI.IGenericObjectLayout>;

  const data$ = combineLatest(nonNullLayouts$, dataPageDef$).pipe(
    map(arr => arr[1]),
    withLatestFrom(obj$),
    switchMap(
      ([dataPageDef, handle]): Observable<EngineAPI.INxDataPage> => {
        return handle.ask("GetListObjectData", "/qListObjectDef", [
          dataPageDef
        ]);
      }
    )
  );

  // Side Effects
  const selectSideEffect$ = selectListObjectValues$.pipe(
    withLatestFrom(obj$),
    switchMap(([{ qValues, qToggleMode, qSoftLock }, handle]) => {
      const definedParams = [qValues, qToggleMode, qSoftLock].filter(
        p => typeof p !== "undefined"
      );

      return handle.ask(
        "SelectListObjectValues",
        "/qListObjectDef",
        ...definedParams
      );
    }),
    ignoreElements()
  );

  const extendedProps$ = combineLatest(data$).pipe(
    map(([data]) => ({
      data,
      selectListObjectValues
    }))
  );

  return merge(extendedProps$, selectSideEffect$);
};

// Create List Object Component from a QaeService
const createListObjectComponent = (QaeContext: React.Context<QaeService>) => {
  const GenericObjectWithListObjectLogic = createGenericObjectComponent(
    QaeContext,
    extendLogic
  );

  const ListObject = componentFromStream(
    (props$: Observable<ListObjectProps>) => {
      const qDef$ = props$.pipe(
        map(props => props.qListObjectDef),
        distinctUntilChanged(),
        map(qListObjectDef => ({
          qInfo: { qType: "react-qae-hypercube" },
          qListObjectDef: qListObjectDef
        }))
      );

      return combineLatest(props$, qDef$).pipe(
        map(([props, qDef]) => (
          <GenericObjectWithListObjectLogic {...props} qDef={qDef}>
            {props.children}
          </GenericObjectWithListObjectLogic>
        ))
      );
    }
  );

  return ListObject;
};

export default createListObjectComponent;
