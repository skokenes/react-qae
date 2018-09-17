///<reference types="rxjs" />

declare module "rxq" {
  import { Observable } from "rxjs";
  
  export function connectSession(config: SessionConfig): Session;

  type HandleOperator = (src$: Observable<Handle>) => Observable<any>;
  
  export function qAsk(method: string, ...args: any[]): HandleOperator;

  export function qAskReplay(method: string, ...args: any[]): HandleOperator;

  export function invalidations(shouldStartWithHandle: boolean): (src$: Observable<Handle>) => Observable<Handle>;

  export type SessionConfig = {
    host?: string;
    appname?: string;
    isSecure?: boolean;
    port?: number;
    prefix?: string;
    origin?: string;
    rejectUnauthorized?: boolean;
    headers?: object;
    ticket?: string;
    key?: string;
    cert?: string;
    ca?: string[];
    identity?: string;
    ws?: WebSocket;
  }

  export interface Handle {
    session: any;
    handle: number;
    qClass: string;
    invalidated$: Observable<Handle>;
    ask: (method: string, ...args: any[]) => Observable<any>
  }

  export interface Session {
    global$: Observable<Handle>;
    notifications$: Observable<any>;
    close: () => {};
    suspend: () => {};
    unsuspend: () => {};
  }

}
