import { Guid } from 'guid-typescript';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AzureWebConfig } from './azure-web-config';
import container from './inversify.config';
import { ServiceBusService } from './service-bus-service';
import { SignalrService } from './signalr-service';

export class AzureWebEvents {
    public initialized: boolean = false;
    private sbClient = container.get(ServiceBusService);
    private srClient = container.get(SignalrService);

    /**
     * Initialize the communication with azure.
     * @param url Azure function URL.
     * @param sharedKey Shared access host of function key. 
     */
    public async init(url: string, sharedKey: string): Promise<void> {
        this.getAweConfig(url, sharedKey)
        .subscribe((config: AzureWebConfig) => {
            this.sbClient.initialize(config.nameSpace, config.sharedAccessKey);
            this.srClient.initialize(config.nameSpace);
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
            this.listenToEvent(methodName, callback);    
        }
        if (error) {
            this.listenToEvent("error-commands", error);    
        }
        
        await this.sbClient.sendEventAsync(methodName, correlationId, args);
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

    private getAweConfig(url: string, sharedKey: string): Observable<AzureWebConfig> {
        const config = new AzureWebConfig();
        config.sharedAccessKey = sharedKey;
        config.nameSpace = url;

        return of(config);
    }

}