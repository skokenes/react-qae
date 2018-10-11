import { createContext } from "react";
import { QaeService } from "./types";

type QaeServiceOrNull = QaeService | null;

const QaeContext: React.Context<QaeServiceOrNull> = createContext(
  null as QaeServiceOrNull
);

export default QaeContext;
