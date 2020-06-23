import { Guid } from 'guid-typescript';
import { LocalCommandStorageService } from './local-command-storage-service';
import { AzureHttpService } from './azure-http-service';

export class ServiceBusService {
    private baseUrl: string;
    private sharedAccessKey: string;

    constructor(private httpService: AzureHttpService,
                sbNameSpace: string,
                sharedAccesKey: string) {
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
        const url = `${this.baseUrl}/SendCommand`;
        await this.httpService.post(url, this.sharedAccessKey, correlationId.toString(), args)
        .then(() => {
            // First we add it to ensure that the id is stored before the response is received.
            LocalCommandStorageService.addCommand(eventName, correlationId);
            console.debug(`The command is succesfully send`)
        }).catch((reason) => {
            console.error(`An error occured while sending the command: ${reason.status}-${reason.statusText}`)
        });
    }
}