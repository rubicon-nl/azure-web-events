import 'reflect-metadata'; // This import must be the first import or DI will break
import { LocalCommandStorageService } from '../src/local-command-storage-service';
import { LocalStorageItem } from '../src/local-storage-item';
import { ServiceBusService } from '../src/service-bus-service';
import { AzureHttpService } from '../src/azure-http-service';
import container from './../src/inversify.config';
import TYPES from './../src/interfaces/types';


import { Guid } from 'guid-typescript';

describe(`servicebus testing`, async () => {
    let serviceBusService: ServiceBusService;
    let azureHttpService: AzureHttpService;
        
    beforeAll(async () => {
        azureHttpService = container.get(TYPES.IAzureHttpService);
        serviceBusService = new ServiceBusService(azureHttpService);
        serviceBusService.initialize('testNameSpace', 'testKey');
    });

    it(`Sent an event and store the event in a localstorage`, async () => {
        // Arrange
        const testQueue: string = 'testQueue';
        const testGuid: Guid = Guid.create();
        initializLocalStorageeSpies(testGuid);

        spyOn(azureHttpService, 'post').and.returnValue(Promise.resolve().then());
        
        // Act
        await serviceBusService.sendEventAsync(testQueue, testGuid);

        // Assert
        expect(LocalCommandStorageService.addCommand).toHaveBeenCalledWith(testQueue, testGuid);
    });

    it(`An error is throw when sending the even fails`, async () => {
        // Arrange
        const testQueue: string = 'testQueue';
        const testGuid: Guid = Guid.create();
        spyOn(azureHttpService, 'post').and.rejectWith('test error');
        spyOn(serviceBusService, 'sendEventAsync');
        
        // Assert
        expect(serviceBusService.sendEventAsync).toThrowError();
    })

    function initializLocalStorageeSpies(testGuid: Guid): void {
        const storageItem = new LocalStorageItem('testEvent', testGuid.toString());
        spyOn(LocalCommandStorageService, 'addCommand').and.returnValue([storageItem]);
    }
});




