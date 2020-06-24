import { Guid } from 'guid-typescript';
import 'reflect-metadata'; // This import must be the first import or DI will break
import { AzureHttpService } from '../src/azure-http-service';
import { LocalCommandStorageService } from '../src/local-command-storage-service';
import { LocalStorageItem } from '../src/local-storage-item';
import { ServiceBusService } from '../src/service-bus-service';
import TYPES from './../src/interfaces/types';
import container from './../src/inversify.config';

describe(`servicebus testing`, async () => {
    let serviceBusService: ServiceBusService;
    let azureHttpService: AzureHttpService;
        
    beforeEach(async () => {
        azureHttpService = container.get(TYPES.IAzureHttpService);
        serviceBusService = new ServiceBusService(azureHttpService);
        serviceBusService.initialize('testNameSpace', 'testKey');
    });

    it(`Sent an event and store the event in a localstorage`, async () => {
        // Arrange
        const testQueue: string = 'testQueue';
        const testGuid: Guid = Guid.create();
        const storageItem = new LocalStorageItem('testEvent', testGuid.toString());
        spyOn(LocalCommandStorageService, 'addCommand').and.returnValue([storageItem]);

        spyOn(azureHttpService, 'post').and.returnValue(Promise.resolve().then());
        
        // Act
        await serviceBusService.sendEventAsync(testQueue, testGuid);

        // Assert
        expect(LocalCommandStorageService.addCommand).toHaveBeenCalledWith(testQueue, testGuid);
    });

    it(`An error is throw when sending the event fails`, async () => {

        // Arrange
        const testQueue = 'testQueue';
        const testGuid = Guid.create();
        spyOn(azureHttpService, 'post').and.rejectWith({
            status: 0,
            statusText: 'test error'
        });
        
        // Act
        const action = serviceBusService.sendEventAsync(testQueue, testGuid);
        
        // Assert
        expectAsync(action).toBeRejectedWithError();
    });
});




