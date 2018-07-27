"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapPropsStream = exports.componentFromStream = void 0;

var _rxjs = require("rxjs");

var _recompose = require("recompose");

var config = {
  fromESObservable: _rxjs.from,
  toESObservable: function toESObservable(stream) {
    return stream;
  }
};
var componentFromStream = (0, _recompose.componentFromStreamWithConfig)(config);
exports.componentFromStream = componentFromStream;
var mapPropsStream = (0, _recompose.mapPropsStreamWithConfig)(config);
exports.mapPropsStream = mapPropsStream;