import { from, Observable } from "rxjs";
import React, { ReactNode } from "react";
import {
  componentFromStreamWithConfig,
  mapPropsStreamWithConfig,
  createEventHandlerWithConfig
} from "recompose";

const config = {
  fromESObservable: from,
  toESObservable: function toESObservable(stream: Observable<any>) {
    return stream;
  }
};

function componentFromStream<T>(
  propsToReactNode: (input: Observable<T>) => Observable<ReactNode>
) {
  // @ts-ignore
  return componentFromStreamWithConfig(config)<T>(propsToReactNode);
}

const mapPropsStream = mapPropsStreamWithConfig(config);

const createEventHandler = createEventHandlerWithConfig(config);

export { componentFromStream, mapPropsStream, createEventHandler };
