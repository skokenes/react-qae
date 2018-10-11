import { connectSession, Handle } from "rxq";
import { QaeService } from "./types";
// @ts-ignore
import { OpenDoc } from "rxq/Global";
import { switchMap, shareReplay } from "rxjs/operators";
import { throwError, Observable } from "rxjs";

export default (config: any) => {
  const session = connectSession(config);
  const global$ = session.global$;
  const doc$: Observable<Handle> =
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

  const QaeService: QaeService = {
    session,
    global$,
    doc$
  };

  return QaeService;
};
