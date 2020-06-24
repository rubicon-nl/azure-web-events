import { Subject } from 'rxjs';
import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@aspnet/signalr';
import { LocalCommandStorageService } from './local-command-storage-service';
import { Guid } from 'guid-typescript';
import { SignalrResponse } from './signalr-response';
import { ISignalRService } from './interfaces/signal-r-service';
import { injectable } from 'inversify';

@injectable()
export class SignalrService implements ISignalRService {
    private signalrMessage: Subject<any> = new Subject<any>();
    private hubConnection: HubConnection;

    /**
     * Create a new instance of SignalRService
     * @param signalrUrl The azure signalR endpoint.
     * @param enableLogging Enable logging with level "Debug".
     */
     public async initialize(signalrUrl: string, enableLogging?: boolean): Promise<void> {
        const connection = new HubConnectionBuilder()
        .withUrl(signalrUrl);
        if (enableLogging) {
            connection.configureLogging(LogLevel.Debug);
        }

        this.hubConnection = connection.build();
        await this.hubConnection.start()
            .then()
            .catch(error => { 
                throw Error(`Error while starting connection: ${error}`);
            });
     }

    /**
     * Subscribe and listen to a signalR event.
     * @param eventName The event to subscibe on.
     */
    public listen<T>(eventName: string): Subject<any[]> {
        if (this.hubConnection.state === HubConnectionState.Disconnected) {
            this.hubConnection
            .start()
            .then()
            .catch(error => { throw Error(`Error while starting connection: ${error}`);});
        }       

        this.hubConnection.on(eventName, (args: any) => {
            const response = JSON.parse(args) as SignalrResponse;
            const correlationId = Guid.parse(response.CorrelationId);
            
            if (LocalCommandStorageService.hasCommand(correlationId)) {
                LocalCommandStorageService.deleteCommand(correlationId);
                this.signalrMessage.next(response.Body);
            }
        });

        return this.signalrMessage;
    }
}