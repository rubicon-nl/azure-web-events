import { Guid } from 'guid-typescript';
import { AzureWebCommandService } from './azure-web-command-service';

export class ServiceBusService {
    private baseUrl: string;
    private sharedAccessKey: string;

    constructor(sbNameSpace: string,
                sharedAccesKey: string) {
        this.baseUrl = sbNameSpace;
        this.sharedAccessKey = sharedAccesKey;
    }

    public async sendMessageAsync(queueName: string, correlationId: Guid, args?: any[]): Promise<void> {
        const url = `${this.baseUrl}/ReceiveWebEvent`;
        try {
            // First we add it to ensure that the id is stored before the response is received.
            AzureWebCommandService.addCommand(queueName, correlationId);
            const Http = new XMLHttpRequest();
            Http.open("POST", url, true);
            Http.setRequestHeader("Content-Type", "application/json");
            Http.setRequestHeader("x-functions-key", this.sharedAccessKey);
            Http.setRequestHeader("correlation-id", correlationId.toString())

            // Send the message.
            Http.send(JSON.stringify(args));
        } catch (error) {
            // Something when't wrong with sending the message. Remove the stored correlationid.
            AzureWebCommandService.deleteCommand(correlationId)
            if (error.response) {
                throw Error(`An error occured while sending the message ${error.response.status}`)
            }
            throw Error(`Oops... something wen't wrong ${error}`);
        }
    }
}