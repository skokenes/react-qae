"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _observableConfig = require("../util/observable-config.js");

var _reactStreams = require("react-streams");

var _rxq = require("rxq");

var _Doc = require("rxq/Doc");

var _GenericObject = require("rxq/GenericObject");

var _operators = require("rxjs/operators");

var _rxjs = require("rxjs");

var _withSideEffects = require("../util/with-side-effects");

var _withSideEffects2 = _interopRequireDefault(_withSideEffects);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (QaeContext) {
  var GenericObject = (0, _observableConfig.componentFromStream)(function (props$) {
    // Unique app$
    var doc$ = props$.pipe((0, _operators.map)(function (props) {
      return props.qix.doc$;
    }), (0, _operators.distinctUntilChanged)(), (0, _operators.switchAll)(), (0, _operators.shareReplay)(1));

    // Initialize a Generic Object
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
    }), (0, _operators.shareReplay)(1));

    // qDef's
    var qDef$ = props$.pipe((0, _operators.map)(function (props) {
      return props.qDef;
    }), (0, _operators.distinctUntilChanged)(), (0, _operators.filter)(function (qDef) {
      return typeof qDef !== "undefined";
    }));

    // Object qDef changes
    var effectObjChange$ = (0, _rxjs.combineLatest)(obj$, qDef$).pipe((0, _operators.switchMap)(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          h = _ref4[0],
          qDef = _ref4[1];

      return h.ask(_GenericObject.SetProperties, qDef);
    }));

    // Re-validating layout stream
    var layout$ = obj$.pipe((0, _rxq.invalidations)(true), (0, _rxq.qAskReplay)(_GenericObject.GetLayout), (0, _operators.filter)(function (layout) {
      return layout.qInfo.qType !== "react-qae-temp";
    }));

    // Obj Props stream
    var qProps$ = obj$.pipe((0, _rxq.invalidations)(true), (0, _rxq.qAskReplay)(_GenericObject.GetProperties), (0, _operators.filter)(function (qProps) {
      return qProps.qInfo.qType !== "react-qae-temp";
    }));

    // Props to pass to component
    return (0, _rxjs.combineLatest)(props$, layout$, qProps$).pipe((0, _withSideEffects2.default)(effectObjChange$), (0, _operators.map)(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 3),
          props = _ref6[0],
          layout = _ref6[1],
          qProps = _ref6[2];

      return props.children({ layout: layout, obj$: obj$, qProps: qProps });
    }));
  });

  return function (props) {
    return _react2.default.createElement(
      QaeContext.Consumer,
      null,
      function (qix) {
        return _react2.default.createElement(
          GenericObject,
          _extends({ qix: qix }, props),
          props.children
        );
      }
    );
  };
};