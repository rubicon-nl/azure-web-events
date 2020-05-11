import { Guid } from 'guid-typescript';
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

    public init(endpoint: string, sharedKey: string): void {
        this.getAweConfig(endpoint, sharedKey)
        .subscribe((config: AzureWebConfig) => {
            this.sbClient = new ServiceBusService(config.baseUrl, config.sharedAccessKey);
            this.srClient = new SignalRService(config.baseUrl);
            this.initialized = true;
        });
    }

     public async sendAsync(methodName: string, 
                            args?: any[], 
                            callback?: (args: any[]) => void, 
                            error?: (error: string) => void,
                            progress?: (percentage: number, message: string) => void): Promise<void> {
        const correlationId = Guid.create();

        this.listenToEvent("finished-commands", correlationId, callback);

        await this.sbClient.sendMessageAsync(methodName, correlationId, args);
    }

     /**
     * Register a handler that will be invoked when the hub method with the specific methodname is invoked.
     * When the handler is invoked it invokes the completedEvent observable. 
     * @param methodName The hub method name.
     */
    private listenToEvent(methodName: string, correlationId: Guid, callback?: (args: any[]) => void): void {

        if (callback) {
            this.srClient.listen(methodName)
            .pipe(filter((signalrArgs: any[]) => Guid.parse(signalrArgs[0]).equals(correlationId)),
                  map((signalrArgs: any[]) => signalrArgs.slice(1)),
                  tap(callback))
            .subscribe();
        }           
    }

    private getAweConfig(endpoint: string, sharedKey: string): Observable<AzureWebConfig> {
        const config = new AzureWebConfig();
        config.sharedAccessKey = sharedKey;
        config.baseUrl = `https://${endpoint}-functions.azurewebsites.net/api`;

        return of(config);
    }

}