import React from "react";
import { createGenericObject } from "./generic-object";
import {
  GenericObjectStreams,
  GenericObjectProps,
  ListObjectProps
} from "../types";
import { Observable, combineLatest, merge } from "rxjs";
import {
  componentFromStream,
  createEventHandler
} from "../util/observable-config.js";
import {
  distinctUntilChanged,
  map,
  filter,
  withLatestFrom,
  switchMap,
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

  const {
    handler: askHandler,
    stream: ask$
  }: {
    handler: (params: any) => void;
    stream: Observable<any>;
  } = createEventHandler();

  const selectListObjectValues = (
    qValues: number[],
    qToggleMode: boolean,
    qSoftLock?: boolean
  ) => {
    selectListObjectValuesHandler({ qValues, qToggleMode, qSoftLock });
  };

  const ask = (...args: any[]) => {
    askHandler(args);
  };

  const props$ = streams.props$ as Observable<
    GenericObjectProps & ListObjectProps
  >;
  const layouts$ = streams.layouts$;
  const obj$ = streams.obj$;
  const dataPageDef$ = props$.pipe(
    map(
      props => props.dataPageDef || { qTop: 0, qLeft: 0, qWidth: 0, qHeight: 0 }
    ),
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
      ([dataPageDef, handle]): Observable<EngineAPI.INxDataPage[]> => {
        return handle.ask("GetListObjectData", "/qListObjectDef", [
          dataPageDef
        ]);
      }
    ),
    map(data => data[0])
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

const GenericObjectWithListObjectLogic = createGenericObject(extendLogic);

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

export default ListObject;
