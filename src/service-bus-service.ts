import 'reflect-metadata';
import { Guid } from 'guid-typescript';
import { inject, injectable } from 'inversify';
import { AzureHttpService } from './azure-http-service';
import { LocalCommandStorageService } from './local-command-storage-service';

@injectable()
export class ServiceBusService {
    private apiEndpoint: string;
    private sharedAccessKey: string;

    constructor(
        @inject(AzureHttpService) private http: AzureHttpService,
        @inject(LocalCommandStorageService) private localCommandStorageService: LocalCommandStorageService) {
    }

    /**
     * Initialize the servicebus service with the given configuration.
     * @param azureApiEndpoint The azure API endpoint.
     * @param sharedAccesKey A Shared Access Key for authorization perposes.
     */
    public initialize(azureApiEndpoint: string, sharedAccesKey: string): void {
        this.apiEndpoint = azureApiEndpoint;
        this.sharedAccessKey = sharedAccesKey;
    }

    /**
     * Send a event to azure.
     * @param queueName The name of the event.
     * @param correlationId The guid correlation id for keeping track.
     * @param args event body.
     */
    public async sendEventAsync(eventName: string, correlationId: Guid, args?: any[]): Promise<void> {
        if (!this.apiEndpoint || !this.sharedAccessKey) {
            throw new Error('Azure API endpoint or SAS key is missing, Initialize service before sending event.');
        }

        const url = `${this.apiEndpoint}/ReceiveWebEvent`;
        await this.http.post(url, this.sharedAccessKey, correlationId.toString(), args)
            .then(() => {
                // First we add it to ensure that the id is stored before the response is received.
                this.localCommandStorageService.addCommand(eventName, correlationId);
            }).catch((reason) => {
                throw new Error(`An error occured while sending the command: ${reason.status}-${reason.statusText}`);
            });
    }
}