import React from "react";
import { createGenericObject } from "./generic-object";
import {
  GenericObjectStreams,
  GenericObjectProps,
  HyperCubeProps,
  QaeService
} from "../types";
import { of, Observable, combineLatest } from "rxjs";
import { componentFromStream } from "../util/observable-config.js";
import distinctProp from "../util/distinctProp";
import {
  pluck,
  distinctUntilChanged,
  map,
  filter,
  withLatestFrom,
  switchMap,
  tap
} from "rxjs/operators";

const extendLogic = (streams: GenericObjectStreams) => {
  const props$ = streams.props$ as Observable<
    GenericObjectProps & HyperCubeProps
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
        return handle.ask("GetHyperCubeData", "/qHyperCubeDef", [dataPageDef]);
      }
    )
  );

  return combineLatest(data$).pipe(
    map(([data]) => ({
      data
    }))
  );
};

const GenericObjectWithHCLogic = createGenericObject(extendLogic);

const HyperCube = componentFromStream((props$: Observable<HyperCubeProps>) => {
  const qDef$ = props$.pipe(
    map(props => props.qHyperCubeDef),
    distinctUntilChanged(),
    map(qHyperCubeDef => ({
      qInfo: { qType: "react-qae-hypercube" },
      qHyperCubeDef
    }))
  );

  // should only update when necessary, so be explicit about what props are allowed to retrigger update.
  // currently, any new props just triggers rerender due to combineLatest(props$)
  // BUT using a render prop function will always cause re-render anyways. so maybe have to do a check downstream to ensure data didnt change before redrawing

  return combineLatest(props$, qDef$).pipe(
    map(([props, qDef]) => (
      <GenericObjectWithHCLogic {...props} qDef={qDef}>
        {props.children}
      </GenericObjectWithHCLogic>
    ))
  );
});

export default HyperCube;
