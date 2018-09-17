import { Observable } from "rxjs";
import { Handle, Session } from "rxq";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type GenericObjectRenderLayout = EngineAPI.IGenericObjectLayout | null;
export type GenericObjectRenderProperties = EngineAPI.IGenericObjectProperties | null;

export type QaeService = {
  session: Session;
  global$: Observable<Handle>;
  doc$: Observable<Handle>;
};

export type GenericObjectRenderProp = {
  layout: GenericObjectRenderLayout;
  obj$: Observable<Handle>;
  qProps: GenericObjectRenderProperties;
};

export interface GenericObjectProps {
  qId?: string;
  qDef?: EngineAPI.IGenericObjectProperties;
  syncLayouts: boolean;
  syncQProps: boolean;
  extendProps: (props: GenericObjectStreams) => Observable<object>;
  children: (props: GenericObjectRenderProp) => React.ReactNode;
}

export interface GenericObjectStreams {
  props$: Observable<GenericObjectProps>;
  layouts$: Observable<GenericObjectRenderLayout>;
  qProps$: Observable<GenericObjectRenderProperties>;
  obj$: Observable<Handle>;
}

export interface HyperCubeProps extends Omit<GenericObjectProps, "qDef"> {
  qHyperCubeDef: EngineAPI.IHyperCubeDef;
  dataPageDef: EngineAPI.INxPage;
}

export interface ListObjectProps extends Omit<GenericObjectProps, "qDef"> {
  qListObjectDef: EngineAPI.IListObjectDef;
  dataPageDef: EngineAPI.INxPage;
}
