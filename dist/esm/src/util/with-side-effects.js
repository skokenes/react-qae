"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _operators = require("rxjs/operators");

var _rxjs = require("rxjs");

exports.default = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return function (src$) {
    var effects$ = _rxjs.merge.apply(undefined, args).pipe((0, _operators.ignoreElements)());
    return (0, _rxjs.merge)(src$, effects$);
  };
};