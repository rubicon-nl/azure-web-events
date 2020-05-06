import { ServiceBusClient, QueueClient, Sender, SendableMessageInfo } from "@azure/service-bus";
import { Guid } from "guid-typescript";

export class ServiceBusService {
        // Servicebus properties
        private sbClient: ServiceBusClient;
        private sbQueueClient: QueueClient;
        private sbSender: Sender;

    constructor(serviceBusUrl: string) {
        this.sbClient = ServiceBusClient.createFromConnectionString(serviceBusUrl);
    }

    public async sendMessageAsync(queueName: string, correlationId: Guid, args?: any[]): Promise<void> {
        const sbSender = this.sbClient.createQueueClient(queueName).createSender();
        const message = {
            body: args,
            correlationId: correlationId.toString(),
        } as SendableMessageInfo;

        await sbSender.send(message);
    }
}