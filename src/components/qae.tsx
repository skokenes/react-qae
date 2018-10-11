import React from "react";
import {
  switchMap,
  map,
  first,
  distinctUntilChanged,
  withLatestFrom
} from "rxjs/operators";
import { from, combineLatest, Observable } from "rxjs";
import { componentFromStream } from "../util/observable-config";
import QaeContext from "../qae-context";
import { QaeService } from "../types";

const QaeConsumer = QaeContext.Consumer;

type StateDef = (qaeService: QaeService) => { [key: string]: Observable<any> };

type QaeProps = {
  stateDef?: StateDef;
  children: (state: {}) => React.ReactNode;
};

type QaeInnerProps = {
  stateDef?: StateDef;
  render: (state: {}) => React.ReactNode;
  qaeService: QaeService;
};

const Qae = componentFromStream((props$: Observable<QaeInnerProps>) => {
  const qaeService$ = props$.pipe(
    map(props => props.qaeService),
    distinctUntilChanged()
  );

  const stateDefFn$ = props$.pipe(
    map(
      props =>
        typeof props.stateDef === "undefined" ? () => ({}) : props.stateDef
    ),
    first()
  );

  const render$ = props$.pipe(map(props => props.render));

  const state$ = stateDefFn$.pipe(
    withLatestFrom(qaeService$),
    switchMap(([stateDefFn, qaeService]) => {
      const stateDef = stateDefFn(qaeService);
      const observableProperties = Object.entries(stateDef).map(
        ([propName, obs$]) => obs$.pipe(map(value => ({ propName, value })))
      );

      return combineLatest(...observableProperties).pipe(
        map(values =>
          values.reduce((acc, curr) => {
            return { ...acc, [curr.propName]: curr.value };
          }, {})
        )
      );
    })
  );

  return combineLatest(state$, render$).pipe(
    map(([state, render]) => render(state))
  );
});

const QaeConnected = (props: QaeProps) => (
  <QaeConsumer>
    {qaeService => (
      <Qae
        qaeService={qaeService}
        stateDef={props.stateDef}
        render={props.children}
      />
    )}
  </QaeConsumer>
);

const qaeConnector = (stateDef: StateDef) => {
  return (WrappedComponent: React.ComponentType) => (props: {}) => (
    <QaeConnected stateDef={stateDef}>
      {(state: {}) => <WrappedComponent {...props} {...state} />}
    </QaeConnected>
  );
};

export { qaeConnector, QaeConnected };
