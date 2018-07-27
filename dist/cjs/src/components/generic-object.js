"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _observableConfig = require("../util/observable-config.js");

var _recompose = require("recompose");

var _rxq = require("rxq");

var _Doc = require("rxq/Doc");

var _GenericObject = require("rxq/GenericObject");

var _operators = require("rxjs/operators");

var _rxjs = require("rxjs");

var _withSideEffects = _interopRequireDefault(require("../util/with-side-effects"));

var _distinctProp = _interopRequireDefault(require("../util/distinctProp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _default = function _default(QaeContext) {
  var GenericObject = (0, _observableConfig.componentFromStream)(function (props$) {
    // User Provided Props
    var qDef$ = (0, _distinctProp.default)("qDef")(props$);
    var qId$ = (0, _distinctProp.default)("qDef")(props$);
    var syncLayouts$ = (0, _distinctProp.default)("syncLayouts")(props$);
    var syncQProps$ = (0, _distinctProp.default)("syncQProps")(props$); // Unique app$

    var doc$ = props$.pipe((0, _distinctProp.default)("qix", "doc$"), (0, _operators.switchAll)(), (0, _operators.shareReplay)(1)); // Initialize a Generic Object

    var obj$ = doc$.pipe((0, _operators.withLatestFrom)(props$), (0, _operators.switchMap)(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          docH = _ref2[0],
          props = _ref2[1];

      if (typeof props.qId !== "undefined") {
        return docH.ask(_Doc.GetObject, props.qId);
      } else return docH.ask(_Doc.CreateSessionObject, {
        qInfo: {
          qType: "react-qae-temp"
        }
      });
    }), (0, _operators.shareReplay)(1)); // Object qDef changes

    var effectObjChange$ = (0, _rxjs.combineLatest)(obj$, qDef$).pipe((0, _operators.switchMap)(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          h = _ref4[0],
          qDef = _ref4[1];

      return h.ask(_GenericObject.SetProperties, qDef);
    })); // Layouts stream

    var layout$ = syncLayouts$.pipe((0, _operators.switchMap)(function (syncLayouts) {
      if (syncLayouts) {
        return obj$.pipe((0, _rxq.invalidations)(true), (0, _rxq.qAskReplay)(_GenericObject.GetLayout), (0, _operators.filter)(function (layout) {
          return layout.qInfo.qType !== "react-qae-temp";
        }));
      } else return (0, _rxjs.of)(null);
    })); // qProps Stream

    var qProps$ = syncQProps$.pipe((0, _operators.switchMap)(function (syncQProps) {
      if (syncQProps) {
        return obj$.pipe((0, _rxq.invalidations)(true), (0, _rxq.qAskReplay)(_GenericObject.GetProperties), (0, _operators.filter)(function (qProps) {
          return qProps.qInfo.qType !== "react-qae-temp";
        }));
      } else return (0, _rxjs.of)(null);
    })); // Props to pass to component

    return (0, _rxjs.combineLatest)(props$, layout$, qProps$).pipe((0, _withSideEffects.default)(effectObjChange$), (0, _operators.map)(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 3),
          props = _ref6[0],
          layout = _ref6[1],
          qProps = _ref6[2];

      return props.children({
        layout: layout,
        obj$: obj$,
        qProps: qProps
      });
    }));
  });

  var ConnectedGenericObject = function ConnectedGenericObject(props) {
    return _react.default.createElement(QaeContext.Consumer, null, function (qix) {
      return _react.default.createElement(GenericObject, _extends({
        qix: qix
      }, props), props.children);
    });
  };

  var GenericObjectDefaults = {
    syncLayouts: true,
    syncQProps: false
  };
  return (0, _recompose.defaultProps)(GenericObjectDefaults)(ConnectedGenericObject);
};

exports.default = _default;