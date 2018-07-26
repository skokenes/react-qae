"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require("react");

var _rxq = require("rxq");

var _Global = require("rxq/Global");

var _operators = require("rxjs/operators");

var _genericObject = require("./components/generic-object");

var _genericObject2 = _interopRequireDefault(_genericObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (config) {
  var session = (0, _rxq.connectSession)(config);
  var global$ = session.global$;

  // What if they dont have appname? don't connect app?
  var doc$ = global$.pipe((0, _operators.switchMap)(function (h) {
    return h.ask(_Global.OpenDoc, config.appname);
  }), (0, _operators.shareReplay)(1));

  var QaeService = { session: session, global$: global$, doc$: doc$ };

  // auto provider?
  var QaeContext = (0, _react.createContext)(QaeService);
  var GenericObject = (0, _genericObject2.default)(QaeContext);

  return {
    QaeProvider: QaeContext.Provider,
    QaeConsumer: QaeContext.Consumer,
    GenericObject: GenericObject,
    QaeService: QaeService
  };
};