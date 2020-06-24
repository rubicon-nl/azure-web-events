import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@aspnet/signalr';
import { Guid } from 'guid-typescript';
import { inject, injectable } from 'inversify';
import { Subject } from 'rxjs';
import { LocalCommandStorageService } from './local-command-storage-service';
import { SignalrResponse } from './signalr-response';

@injectable()
export class SignalrService {
    private signalrMessage: Subject<any> = new Subject<any>();
    private hubConnection: HubConnection;

    constructor(
        @inject(LocalCommandStorageService) private localCommandStorageService: LocalCommandStorageService) {
    }

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
            
            if (this.localCommandStorageService.hasCommand(correlationId)) {
                this.localCommandStorageService.deleteCommand(correlationId);
                this.signalrMessage.next(response.Body);
            }
        });

        return this.signalrMessage;
    }
}