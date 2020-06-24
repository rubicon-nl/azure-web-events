import { Subject } from "rxjs";

export interface ISignalRService {
    initialize(signalrUrl: string, enableLogging?: boolean): Promise<void>;
    listen<T>(eventName: string): Subject<any[]>;
}