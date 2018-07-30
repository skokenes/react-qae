"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.componentFromStream = componentFromStream;
exports.mapPropsStream = void 0;

var _rxjs = require("rxjs");

var _recompose = require("recompose");

var config = {
  fromESObservable: _rxjs.from,
  toESObservable: function toESObservable(stream) {
    return stream;
  }
}; // const componentFromStream =componentFromStreamWithConfig(config);

function componentFromStream(propsToReactNode) {
  // @ts-ignore
  return (0, _recompose.componentFromStreamWithConfig)(config)(propsToReactNode);
}

var mapPropsStream = (0, _recompose.mapPropsStreamWithConfig)(config);
exports.mapPropsStream = mapPropsStream;