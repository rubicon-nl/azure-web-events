import { Container } from 'inversify';
import TYPES from './interfaces/types';
import 'reflect-metadata';
import { AzureHttpService } from './azure-http-service';
import { IAzureHttpService } from './interfaces/azure-http-service';
import { IServiceBusService } from './interfaces/service-bus.service';
import { ServiceBusService } from './service-bus-service';
import { ISignalRService } from './interfaces/signal-r-service';
import { SignalrService } from './signalr-service';

const container = new Container();
container.bind<IServiceBusService>(TYPES.IServiceBusService).to(ServiceBusService);
container.bind<IAzureHttpService>(TYPES.IAzureHttpService).to(AzureHttpService).inSingletonScope();
container.bind<ISignalRService>(TYPES.ISignalRService).to(SignalrService);

export default container;