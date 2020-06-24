import { Guid } from 'guid-typescript';
import { inject, injectable } from 'inversify';
import { IAzureHttpService } from './interfaces/azure-http-service';
import { IServiceBusService } from './interfaces/service-bus.service';
import TYPES from './interfaces/types';
import { LocalCommandStorageService } from './local-command-storage-service';

@injectable()
export class ServiceBusService implements IServiceBusService {
    protected http: IAzureHttpService;
    private baseUrl: string;
    private sharedAccessKey: string;

    constructor(@inject(TYPES.IAzureHttpService) http: IAzureHttpService) {
        this.http = http;
    }

    public initialize(sbNameSpace: string, sharedAccesKey: string): void {
        this.baseUrl = sbNameSpace;
        this.sharedAccessKey = sharedAccesKey;
    }

    /**
     * Send a event to azure
     * @param queueName The name of the event.
     * @param correlationId The guid correlation id for keeping track.
     * @param args event body.
     */
    public async sendEventAsync(eventName: string, correlationId: Guid, args?: any[]): Promise<void> {
        const url = `${this.baseUrl}/ReceiveWebEvent`;
        await this.http.post(url, this.sharedAccessKey, correlationId.toString(), args)
            .then(() => {
                // First we add it to ensure that the id is stored before the response is received.
                LocalCommandStorageService.addCommand(eventName, correlationId);
            }).catch((reason) => {
                throw new Error(`An error occured while sending the command: ${reason.status}-${reason.statusText}`);
            });
    }
}