import { Guid } from 'guid-typescript';

export interface IServiceBusService {
    initialize(sbNameSpace: string, sharedAccesKey: string): void
    sendEventAsync(eventName: string, correlationId: Guid, args?: any[]): Promise<void>
}