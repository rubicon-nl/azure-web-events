import 'reflect-metadata';
import { Guid } from 'guid-typescript';
import { inject, injectable } from 'inversify';
import { AzureHttpService } from './azure-http-service';
import { LocalCommandStorageService } from './local-command-storage-service';

@injectable()
export class ServiceBusService {
    constructor(
        @inject(AzureHttpService) private http: AzureHttpService,
        @inject(LocalCommandStorageService) private localCommandStorageService: LocalCommandStorageService) {
    }

    /**
     * Send a event to azure.
     * @param queueName The name of the event.
     * @param correlationId The guid correlation id for keeping track.
     * @param args event body.
     */
    public async sendEventAsync(eventName: string, correlationId: Guid, args?: any[]): Promise<void> {
        const url = `functions/ReceiveWebEvent`;
        await this.http.post(url, correlationId.toString(), args)
            .then(() => {
                // First we add it to ensure that the id is stored before the response is received.
                this.localCommandStorageService.addCommand(eventName, correlationId);
            }).catch((reason) => {
                console.log(`the reason`, reason);
                throw new Error(`An error occured while sending the command: ${reason.status}-${reason.statusText}`);
            });
    }
}