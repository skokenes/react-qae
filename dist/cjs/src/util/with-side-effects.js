"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _operators = require("rxjs/operators");

var _rxjs = require("rxjs");

var _default = function _default() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return function (src$) {
    var effects$ = _rxjs.merge.apply(void 0, args).pipe((0, _operators.ignoreElements)());

    return (0, _rxjs.merge)(src$, effects$);
  };
};

exports.default = _default;