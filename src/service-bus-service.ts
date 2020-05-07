import { Guid } from 'guid-typescript';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';

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
            const response = await axios.post(`https://${this.serviceBusNameSpace}.servicebus.windows.net/${queueName}`, args, {
                                            headers: {
                                                "Authorization": signature,
                                                "Content-Type": "application/atom+xml;type=entry;charset=utf-8",
                                                "BrokerProperties": JSON.stringify({ "CorrelationId": correlationId }),
                                                }
                                            });

                                        console.log(`THE RESPONSE ${response}`);
        } catch (error) {
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