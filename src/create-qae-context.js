import { createContext } from "react";
import { connectSession } from "rxq";
import { OpenDoc } from "rxq/Global";
import { switchMap, shareReplay } from "rxjs/operators";
import createGenericObjectComponent from "./components/generic-object";

export default config => {
  const session = connectSession(config);
  const global$ = session.global$;

  // What if they dont have appname? don't connect app?
  const doc$ = global$.pipe(
    switchMap(h => h.ask(OpenDoc, config.appname)),
    shareReplay(1)
  );

  const QaeService = { session, global$, doc$ };

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
