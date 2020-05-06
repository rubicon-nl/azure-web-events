import { HubConnection, HubConnectionBuilder, HubConnectionState } from "@aspnet/signalr";
import { ServiceBusClient, QueueClient, Sender, SendableMessageInfo } from "@azure/service-bus";
import { Guid } from "guid-typescript";
import { AzureWebCommandService } from './azure-web-command-service';

export class AzureWebEvent {
    // SignalR properties
    private hubConnection: HubConnection;

    // Servicebus properties
    private sbClient: ServiceBusClient;
    private sbQueueClient: QueueClient;
    private sbSender: Sender;

    constructor(serviceBusConnectionString: string,
                serviceBusQueueName: string,
                signalRUrl: string) {   

        // Initialize servicebus
        this.sbClient = ServiceBusClient.createFromConnectionString(serviceBusConnectionString);
        this.sbQueueClient = this.sbClient.createQueueClient(serviceBusQueueName)
        this.sbSender = this.sbQueueClient.createSender();

        // Initialize signalR
        this.hubConnection = new HubConnectionBuilder()
        .withUrl(signalRUrl)
        .build();
      }

     public async sendAsync(methodName: string, args?: any[], callback?: (response: any[]) => any[]): Promise<void> {
        const correlationId = Guid.create();
        const message = {
            body: args,
            correlationId: correlationId.toString(),
        } as SendableMessageInfo;

        try {

            if (callback) {
                this.listenTo(methodName, callback)
            }

            // First we add it to ensure that the id is stored before the response is received.
            AzureWebCommandService.addCommand(correlationId);
            await this.sbSender.send(message);
        } catch (error) {
            // Something when't wrong with sending the message. Remove the stored correlationid.
            AzureWebCommandService.deleteCommand(correlationId)
            console.error(`An error occured while sending the message: ${error} `);
        }
    }

     /**
     * Register a handler that will be invoked when the hub method with the specific methodname is invoked.
     * When the handler is invoked it invokes the completedEvent observable. 
     * @param methodName The hub method name.
     */
    private listenTo(methodName: string, callback: (response: any[]) => any[]): void {

        if (this.hubConnection.state === HubConnectionState.Disconnected) {
            console.error(`Hubconnection disconnected, Initialize the listener`);
        }

        this.hubConnection.on(methodName, (correlationId: Guid) => {
            const sentEvent = AzureWebCommandService.getCommand(correlationId);

            // Validate correlation id. if this is a command sent by this client its processed.
            if (sentEvent) {
                AzureWebCommandService.deleteCommand(correlationId)
            }
            
            callback([correlationId]);
        });
    }

}