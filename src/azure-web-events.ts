import 'reflect-metadata';
import { Guid } from 'guid-typescript';
import { tap } from 'rxjs/operators';
import { AzureWebConfig,  } from './azure-web-config';
import { container } from './inversify.config';
import { ServiceBusService } from './service-bus-service';
import { SignalrService } from './signalr-service';
import { Configuration } from '@azure/msal-browser';

export class AzureWebEvents {
    public initialized: boolean = false;

    private sbService: ServiceBusService = container.get<ServiceBusService>(ServiceBusService);
    private srService: SignalrService = container.get<SignalrService>(SignalrService);
    private config: AzureWebConfig = container.get<AzureWebConfig>(AzureWebConfig);
    
    
    /**
     * Initialize the communication with a shared access key.
     * @param url Azure function URL.
     * @param sharedKey Shared access host of function key. 
     */
    public async initWithSas(url: string, sharedAccessToken: string): Promise<void> {
        this.initialized = this.config.initializeAzureSas(url, sharedAccessToken);
        this.initializeServices();
    }

    /** 
     * Initialize the communication with azure active directory
     * @param endpointUri: The API endpoint 
    */
    public async initWithMsal(endpointUri: string, config: Configuration): Promise<void> {
        this.initialized = this.config.initializeAzureAD(endpointUri, config);
        this.initializeServices();
    }

    /**
     * Send an event to azure servicebus. 
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
        
        await this.sbService.sendEventAsync(methodName, correlationId, args);
    }

    private initializeServices(): void{
        this.srService.initialize(`${this.config.endpoint}\\functions`, true);
    }

     /**
      * Register a handler that will be invoked when the hub method with the specific methodname is invoked.
      * When the handler is invoked it invokes the completedEvent observable. 
      * @param methodName The hub method name.
      */
    private listenToEvent(methodName: string, callback: (args: any) => void): void {
            this.srService.listen(methodName)
            .pipe(tap(callback))
            .subscribe();
    }
}