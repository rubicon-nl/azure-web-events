import { Container } from 'inversify';
import { AzureWebConfig } from './azure-web-config';

const container = new Container({ autoBindInjectable: true });
container.bind<AzureWebConfig>(AzureWebConfig).toSelf().inSingletonScope();

export { container };