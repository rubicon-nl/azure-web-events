import { Guid } from 'guid-typescript';
import { AzureWebCommandService } from './azure-web-command-service';
import { AzureWebConfig } from './azure-web-config';
import { SignalRService } from './signalr-service';
import { ServiceBusService } from './service-bus-service';
import { Observable, of } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

export class AzureWebEvent {
    private sbClient: ServiceBusService;
    private srClient: SignalRService;
    private initialized: boolean = false;

    constructor() { }

    public init(serviceBusNameSpace: string): void {
        this.getAweConfig(serviceBusNameSpace)
        .subscribe((config: AzureWebConfig) => {
            console.log(`The connectionstring: ${serviceBusNameSpace}`);
            this.sbClient = new ServiceBusService(config.serviceBusUrl, config.sharedAccessKeyName, config.sharedAccessKey);
            this.srClient = new SignalRService(config.signalRUrl);
            this.initialized = true;
        });
    }

     public async sendAsync(methodName: string, 
                            args?: any[], 
                            callback?: (args: any[]) => void, 
                            error?: (error: string) => void,
                            progress?: (percentage: number, message: string) => void): Promise<void> {
        const correlationId = Guid.create();
        
        try {
            // First we add it to ensure that the id is stored before the response is received.
            AzureWebCommandService.addCommand(correlationId);
            await this.sbClient.sendMessageAsync(methodName + "-queue", correlationId, args);

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
    private listenToEvent(methodName: string, correlationId: Guid, callback: (args: any[]) => void): void {
            this.srClient.listen(methodName)
            .pipe(filter((signalrArgs: any[]) => Guid.parse(signalrArgs[0]).equals(correlationId)),
                  map((signalrArgs: any[]) => signalrArgs.slice(1)),
                  tap(callback))
            .subscribe();
    }

    private getAweConfig(serviceBusNameSpace: string): Observable<AzureWebConfig> {
        const config = new AzureWebConfig();
        config.serviceBusUrl = serviceBusNameSpace;
        config.sharedAccessKeyName = "LocalExplorer";
        config.sharedAccessKey = "nujvznawC+HsMI7aka1iQgvTgCNmMnPzuYDsuDFyI9s=";
        config.QueueName = "update-commands-queue";
        config.signalRUrl = "https://cqrs-messaging-functions.azurewebsites.net/";

        return of(config);
    }

}