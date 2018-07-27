"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = require("react");

var _rxq = require("rxq");

var _Global = require("rxq/Global");

var _operators = require("rxjs/operators");

var _genericObject = _interopRequireDefault(require("./components/generic-object"));

var _rxjs = require("rxjs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = function _default(config) {
  var session = (0, _rxq.connectSession)(config);
  var global$ = session.global$;
  var doc$ = typeof config.appname !== "undefined" ? global$.pipe((0, _operators.switchMap)(function (h) {
    return h.ask(_Global.OpenDoc, config.appname);
  }), (0, _operators.shareReplay)(1)) : (0, _rxjs.throwError)(new Error("You are trying to use doc$ but did not define an appname in your qae config."));
  var QaeService = {
    session: session,
    global$: global$,
    doc$: doc$
  }; // auto provider?

  var QaeContext = (0, _react.createContext)(QaeService);
  var GenericObject = (0, _genericObject.default)(QaeContext);
  return {
    QaeProvider: QaeContext.Provider,
    QaeConsumer: QaeContext.Consumer,
    GenericObject: GenericObject,
    QaeService: QaeService
  };
};

exports.default = _default;