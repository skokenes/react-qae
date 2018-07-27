import { Observable } from "rxjs";

export type RxQSession = {
  global$: Observable<any>
  close: () => {};
  notifications$: Observable<any>
}

export type QaeService = {
  session: RxQSession;
  global$: Observable<any>;
  doc$: Observable<any>;
}

export type GenericObjectRenderProp = {
  layout: any;
  obj$: Observable<any>;
  qProps: any;
}

export interface GenericObjectProps {
  qId?: string;
  qDef?: object;
  syncLayouts: boolean;
  syncQProps: boolean;
  children: (props: GenericObjectRenderProp) => React.ReactNode;
}