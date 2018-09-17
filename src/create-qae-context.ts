import React, { createContext } from "react";
import { connectSession, Session } from "rxq";
// @ts-ignore
import { OpenDoc } from "rxq/Global";
import { switchMap, shareReplay } from "rxjs/operators";
import createGenericObjectComponent from "./components/generic-object";
import createHyperCubeComponent from "./components/hypercube";
import createListObjectComponent from "./components/listobject";
import { throwError, Observable } from "rxjs";
import { QaeService } from "./types";

export default (config: any) => {
  const session = connectSession(config);
  const global$ = session.global$;
  const doc$ =
    typeof config.appname !== "undefined"
      ? global$.pipe(
          switchMap((h: any) => h.ask(OpenDoc, config.appname)),
          shareReplay(1)
        )
      : throwError(
          new Error(
            "You are trying to use doc$ but did not define an appname in your qae config."
          )
        );

  const QaeService = {
    session,
    global$,
    doc$
  } as QaeService;

  // auto provider?
  const QaeContext = createContext(QaeService);
  const GenericObject = createGenericObjectComponent(QaeContext);
  const HyperCube = createHyperCubeComponent(QaeContext);
  const ListObject = createListObjectComponent(QaeContext);

  return {
    QaeProvider: QaeContext.Provider,
    QaeConsumer: QaeContext.Consumer,
    GenericObject,
    HyperCube,
    ListObject,
    QaeService
  };
};
