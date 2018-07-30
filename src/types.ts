import { Observable } from "rxjs";
import { Handle, Session } from "rxq";

export type QaeService = {
  session: Session,
  global$: Observable<Handle>;
  doc$: Observable<Handle>;
}

export type GenericObjectRenderProp = {
  layout: EngineAPI.IGenericObjectLayout;
  obj$: Observable<Handle>;
  qProps: EngineAPI.IGenericObjectProperties;
}

export interface GenericObjectProps {
  qId?: string;
  qDef?: EngineAPI.IGenericObjectProperties;
  syncLayouts: boolean;
  syncQProps: boolean;
  children: (props: GenericObjectRenderProp) => React.ReactNode;
}