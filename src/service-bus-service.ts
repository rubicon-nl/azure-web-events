import { Guid } from 'guid-typescript';
import { LocalCommandStorageService } from './local-command-storage-service';

export class ServiceBusService {
    private baseUrl: string;
    private sharedAccessKey: string;

    constructor(sbNameSpace: string,
                sharedAccesKey: string) {
        this.baseUrl = sbNameSpace;
        this.sharedAccessKey = sharedAccesKey;
    }

    public async sendCommandAsync(queueName: string, correlationId: Guid, args?: any[]): Promise<void> {
        const url = `${this.baseUrl}/SendCommand`;
        // First we add it to ensure that the id is stored before the response is received.
        LocalCommandStorageService.addCommand(queueName, correlationId);
        
        try {
            const httpRequest = this.createHttpRequest("POST", url, correlationId.toString());
            httpRequest.send(JSON.stringify(args));
        } catch (error) {
            // Something when't wrong with sending the message. Remove the stored correlationid.
            LocalCommandStorageService.deleteCommand(correlationId)
            if (error.response) {
                throw Error(`An error occured while sending the message ${error.response.status}`)
            }

            throw Error(`Oops... something wen't wrong ${error}`);
        }
    }

    private createHttpRequest(method: string, url: string, corelationId: string): XMLHttpRequest {
        const request = new XMLHttpRequest();
        request.open(method, url, true);
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("x-functions-key", this.sharedAccessKey);
        request.setRequestHeader("correlation-id", corelationId)

        return request;
    }
}