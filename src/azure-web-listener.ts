import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@aspnet/signalr';
import { Subject } from 'rxjs';
import { Guid } from 'guid-typescript';
import { AzureWebCommandService } from './azure-web-command-service';

/**
 * Create a listener for receiving and handling completed azure web events.
 */
export class AzureWebListener {
    public completedEvent = new Subject<Guid>();

    private hubConnection: HubConnection;

    constructor(signalRUrl: string) {
        this.hubConnection = new HubConnectionBuilder()
        .withUrl(signalRUrl)
        .build();
    }

    public initialize(): void {
        this.hubConnection
            .start()
            .then()
            .catch(error => console.error(`Error while starting connection: ${error}`));
    }

    /**
     * Register a handler that will be invoked when the hub method with the specific methodname is invoked.
     * When the handler is invoked it invokes the completedEvent observable. 
     * @param methodName The hub method name.
     */
    public listenTo(methodName: string): void {

        if (this.hubConnection.state === HubConnectionState.Disconnected) {
            console.error(`Hubconnection disconnected, Initialize the listener`);
        }

        this.hubConnection.on(methodName, (commandId: Guid) => {
            this.completedEvent.next(commandId);
            
            // Received event 
            AzureWebCommandService.deleteCommand(commandId);
        });
    }
}