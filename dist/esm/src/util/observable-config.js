"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapPropsStream = exports.componentFromStream = undefined;

var _rxjs = require("rxjs");

var _recompose = require("recompose");

var config = {
  fromESObservable: _rxjs.from,
  toESObservable: function toESObservable(stream) {
    return stream;
  }
};

var componentFromStream = (0, _recompose.componentFromStreamWithConfig)(config);
var mapPropsStream = (0, _recompose.mapPropsStreamWithConfig)(config);

exports.componentFromStream = componentFromStream;
exports.mapPropsStream = mapPropsStream;