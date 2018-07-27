"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _operators = require("rxjs/operators");

var _default = function _default() {
  for (var _len = arguments.length, path = new Array(_len), _key = 0; _key < _len; _key++) {
    path[_key] = arguments[_key];
  }

  return function (src$) {
    return src$.pipe(_operators.pluck.apply(void 0, path), (0, _operators.distinctUntilChanged)());
  };
};

exports.default = _default;