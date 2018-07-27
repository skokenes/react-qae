import React, { createContext } from "react";
import { connectSession } from "rxq";
import { OpenDoc } from "rxq/Global";
import { switchMap, shareReplay } from "rxjs/operators";
import createGenericObjectComponent from "./components/generic-object";
import { throwError, Observable } from "rxjs";
import { RxQSession, QaeService } from "./types";


export default (config: any) => {
  const session = connectSession(config) as RxQSession;
  const global$ = session.global$;
  const doc$ = typeof config.appname !== "undefined" ? global$.pipe(
    switchMap((h: any) => h.ask(OpenDoc, config.appname)),
    shareReplay(1)
  ) : throwError(new Error("You are trying to use doc$ but did not define an appname in your qae config."));

  const QaeService = { 
    session, global$, doc$ } as QaeService;

  // auto provider?
  const QaeContext = createContext(QaeService);
  const GenericObject = createGenericObjectComponent(QaeContext);

  return {
    QaeProvider: QaeContext.Provider,
    QaeConsumer: QaeContext.Consumer,
    GenericObject,
    QaeService
  };
};
