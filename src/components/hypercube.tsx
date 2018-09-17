import React from "react";
import createGenericObjectComponent from "./generic-object";
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

const createHyperCubeComponent = (QaeContext: React.Context<QaeService>) => {
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
          return handle.ask("GetHyperCubeData", "/qHyperCubeDef", [
            dataPageDef
          ]);
        }
      )
    );

    return combineLatest(data$).pipe(
      map(([data]) => ({
        data
      }))
    );
  };

  const GenericObjectWithHCLogic = createGenericObjectComponent(
    QaeContext,
    extendLogic
  );

  const HyperCube = componentFromStream(
    (props$: Observable<HyperCubeProps>) => {
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
    }
  );

  return HyperCube;
};

export default createHyperCubeComponent;

// export default (GenericObject: React.ComponentType<GenericObjectProps>) => {

//   const addLogic = (streams: GenericObjectStreams) => {
//     const props$ = streams.props$ as Observable<GenericObjectProps & HyperCubeProps>;
//     const layouts$ = streams.layouts$
//     const obj$ = streams.obj$;
//     const dataPageDef$ = props$.pipe(
//       map(props => props.dataPageDef),
//       distinctUntilChanged((a, b) => {
//         return a.qTop === b.qTop && a.qLeft === b.qLeft && a.qHeight === b.qHeight && a.qWidth === b.qWidth;
//       })
//     );

//     const nonNullLayouts$ = layouts$.pipe(
//       filter(layout => layout !== null),
//       tap(() => console.log("here")),
//     );

//     const data$ = combineLatest(nonNullLayouts$, dataPageDef$).pipe(
//       map(arr => arr[1]),
//       withLatestFrom(obj$),
//       switchMap(([dataPageDef, handle]): Observable<EngineAPI.INxDataPage> => {
//         return handle.ask("GetHyperCubeData", "/qHyperCubeDef",[dataPageDef]);
//       })
//     );

//     const a = of(1);

//     props$.subscribe(console.log);

//     return combineLatest(a).pipe(
//       map(([data]) => ({
//         data
//       }))
//     )
//   }

//   const HyperCube = (props: HyperCubeProps) => {

//     const qDef = {
//       qInfo: { qType: "react-qae-hypercube" },
//       qHyperCubeDef: props.qHyperCubeDef
//     };

//     return <GenericObject {...props} qDef={qDef} extendProps={addLogic} >
//       {props.children}
//     </GenericObject>
//   };

//   return HyperCube;

// }
