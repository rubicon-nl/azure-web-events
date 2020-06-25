import { Container } from 'inversify';
import 'reflect-metadata';
import { LocalCommandStorageService } from './local-command-storage-service';

const container = new Container({ autoBindInjectable: true });

export default container;