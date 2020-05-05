import { ServiceBusClient, QueueClient, Sender, SendableMessageInfo } from '@azure/service-bus';
import { Guid } from 'guid-typescript';

export class AzureWebSender {
    private sbClient: ServiceBusClient;
    private sbQueueClient: QueueClient;
    private sbSender: Sender;

    // Moet een global key worden ?!
    private localStorageKey: string = "sendMessages";
    
    constructor(serviceBusConnectionString: string,
                serviceBusQueueName: string) {
        this.sbClient = ServiceBusClient.createFromConnectionString(serviceBusConnectionString);
        this.sbQueueClient = this.sbClient.createQueueClient(serviceBusQueueName)
        this.sbSender = this.sbQueueClient.createSender();
    }

    public async sendAsync(body: any): Promise<void> {
        try {
            const messageGuidId = Guid.create();
            const message = {
                body: body,
                messageId: messageGuidId.toString(),
            } as SendableMessageInfo;

            await this.sbSender.send(message);
        } catch (error) {
            
        }
    }

    private storeMessageId(messageGuidId: string): void {
        if (window.localStorage) {
            const storage = localStorage.getItem(this.localStorageKey);
            const storedMessages = new Array<string>();

            if (storage !== null) {
                const messages = JSON.parse(storage) as Array<string>;
                messages.forEach(message => storedMessages.push(message));
            }

            storedMessages.push(messageGuidId);
            localStorage.setItem(this.localStorageKey, JSON.stringify(storedMessages));
        } else {
            throw new Error("HIER MOETEN WE WAT MEE DOEN");
        }
    }

    public async dispose(): Promise<void> {
        await this.sbSender.close();
        await this.sbClient.close();
    }



}