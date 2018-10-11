import QaeContext from "./src/qae-context";
import createQaeService from "./src/create-qae-service";
import GenericObject from "./src/components/generic-object";
import HyperCube from "./src/components/hypercube";
import ListObject from "./src/components/listobject";
import { qaeConnector, QaeConnected as Qae } from "./src/components/qae";

const QaeProvider = QaeContext.Provider;
const QaeConsumer = QaeContext.Consumer;

export {
  QaeProvider,
  QaeConsumer,
  createQaeService,
  GenericObject,
  HyperCube,
  ListObject,
  Qae,
  qaeConnector
};
