import { createContext } from "react";
import { connectSession } from "rxq";
import { openDoc } from "rxq/Global";
import { switchMap, shareReplay } from "rxjs/operators";

export default config => {
  const session$ = connectSession(config).pipe(shareReplay(1));

  // What if they dont have appname? don't connect app?
  const doc$ = session$.pipe(
    switchMap(h => openDoc(h, config.appname)),
    shareReplay(1)
  );

  const QaeService = { session$, doc$ };

  // auto provider?
  const QaeContext = createContext(QaeService);

  return {
    QaeProvider: QaeContext.Provider,
    QaeConsumer: QaeContext.Consumer
  };
};
