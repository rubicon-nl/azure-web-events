import { Subject } from 'rxjs';
import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@aspnet/signalr';
import { AzureWebCommandService } from './azure-web-command-service';
import { Guid } from 'guid-typescript';
import { SignalRResponse } from './signal-r-response';

export class SignalRService {
    private signalrMessage: Subject<any> = new Subject<any>();
    private hubConnection: HubConnection;

    /**
     * Create a new instance of SignalRService
     * @param signalrUrl The azure signalR endpoint.
     * @param enableLogging Enable logging with level "Debug".
     */
    constructor(signalrUrl: string, enableLogging?: boolean) {
        const connection = new HubConnectionBuilder()
        .withUrl(signalrUrl);
        if (enableLogging) {
            connection.configureLogging(LogLevel.Debug);
        }

        this.hubConnection = connection.build();
        this.hubConnection.start()
            .then()
            .catch(error => { throw Error(`Error while starting connection: ${error}`);});
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
            const response = JSON.parse(args) as SignalRResponse;
            var correlationId = Guid.parse(response.CorrelationId);
            
            if (AzureWebCommandService.hasCommand(correlationId)) {
                AzureWebCommandService.deleteCommand(correlationId);
                this.signalrMessage.next(response.Body);
            }
        });

        return this.signalrMessage;
    }
}