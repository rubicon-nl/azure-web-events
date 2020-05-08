import { Guid } from 'guid-typescript';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';
import { AzureWebCommandService } from './azure-web-command-service';

export class ServiceBusService {
    private serviceBusNameSpace: string;
    private sharedAccessKeyName: string;
    private sharedAccessKey: string;

    constructor(sbNameSpace: string,
                sharedAccesKeyName: string,
                sharedAccesKey: string) {
        this.serviceBusNameSpace = sbNameSpace;
        this.sharedAccessKeyName = sharedAccesKeyName;
        this.sharedAccessKey = sharedAccesKey;
    }

    public async sendMessageAsync(queueName: string, correlationId: Guid, args?: any[]): Promise<void> {
        const signature = this.getSASSignature(queueName);

        try {
            // First we add it to ensure that the id is stored before the response is received.
            AzureWebCommandService.addCommand(correlationId);
            const response = await axios.post(`https://${this.serviceBusNameSpace}.servicebus.windows.net/${queueName}`, args, { headers: {
                                                                                                                                    "Authorization": signature,
                                                                                                                                    "Content-Type": "application/atom+xml;type=entry;charset=utf-8",
                                                                                                                                    "BrokerProperties": JSON.stringify({ "CorrelationId": correlationId }),
                                                                                                                                    }
                                                                                                                                });

            
        } catch (error) {
            // Something when't wrong with sending the message. Remove the stored correlationid.
            AzureWebCommandService.deleteCommand(correlationId)
            if (error.response) {
                throw Error(`An error occured while sending the message ${error.response.status}`)
            }
            throw Error(`Oops... something wen't wrong ${error}`);
        }
    }

    private getSASSignature(servicebusQueue: string): string {
        const servicebusUri = `https://${this.serviceBusNameSpace}.servicebus.windows.net/${servicebusQueue}`;
        const expireInSeconds = Math.round(this.createExpireUnix(5) / 1000);
        const hmacSignature = CryptoJS.HmacSHA256(`${encodeURIComponent(servicebusUri)}\n${expireInSeconds}`, this.sharedAccessKey);

        return `SharedAccessSignature sr=${encodeURIComponent(servicebusUri)}&sig=${encodeURIComponent(CryptoJS.enc.Base64.stringify(hmacSignature))}&se=${expireInSeconds}&skn=${this.sharedAccessKeyName}`;
    }

    private createExpireUnix(lifeTimeinMinuts: number): number {
        const now = new Date();
        now.setMinutes(now.getMinutes() + lifeTimeinMinuts);
        return now.getTime();
    }
}