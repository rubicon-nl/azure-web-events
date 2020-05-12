import { Guid } from 'guid-typescript';
import { AzureWebConfig } from './azure-web-config';
import { SignalRService } from './signalr-service';
import { ServiceBusService } from './service-bus-service';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export class AzureWebEvent {
    private sbClient: ServiceBusService;
    private srClient: SignalRService;
    public initialized: boolean = false;

    /**
     * Create a new instance of AzureWebEvent.
     */
    constructor() { }

    /**
     * Initialize the communication with azure.
     * @param nameSpace Azure namespace.
     * @param sharedKey Shared access host of function key. 
     */
    public init(nameSpace: string, sharedKey: string): void {
        this.getAweConfig(nameSpace, sharedKey)
        .subscribe((config: AzureWebConfig) => {
            this.sbClient = new ServiceBusService(config.nameSpace, config.sharedAccessKey);
            this.srClient = new SignalRService(config.nameSpace);
            this.initialized = true;
        });
    }

    /**
     * Send an event to azure servicebus.
     * @param methodName The action name, same as the servicebus queue.
     * @param args Arguments in the message
     * @param callback Invoked when response is received
     * @param error Invoked when error is received
     * @param progress Invoked when progress is received
     */
     public async sendAsync(methodName: string, 
                            args?: any[], 
                            callback?: (args: any[]) => void, 
                            error?: (error: string) => void,
                            progress?: (percentage: number, message: string) => void): Promise<void> {
        const correlationId = Guid.create();

        if (callback) {
            this.listenToEvent("finished-commands", callback);    
        }
        if (error) {
            this.listenToEvent("error-commands", error);    
        }
        
        await this.sbClient.sendMessageAsync(methodName, correlationId, args);
    }

     /**
     * Register a handler that will be invoked when the hub method with the specific methodname is invoked.
     * When the handler is invoked it invokes the completedEvent observable. 
     * @param methodName The hub method name.
     */
    private listenToEvent(methodName: string, callback: (args: any) => void): void {
            this.srClient.listen(methodName)
            .pipe(tap(callback))
            .subscribe();
    }

    private getAweConfig(endpoint: string, sharedKey: string): Observable<AzureWebConfig> {
        const config = new AzureWebConfig();
        config.sharedAccessKey = sharedKey;
        config.nameSpace = `https://${endpoint}-functions.azurewebsites.net/api`;

        return of(config);
    }

}