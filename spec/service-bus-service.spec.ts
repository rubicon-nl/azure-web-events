import { LocalCommandStorageService } from '../src/local-command-storage-service';
import { LocalStorageItem } from '../src/local-storage-item';
import { ServiceBusService } from "../src/service-bus-service";
import { AzureHttpService } from '../src/azure-http-service';

import { Guid } from 'guid-typescript';

describe(`servicebus testing`, async () => {
    let serviceBusService: ServiceBusService;
    let azureHttpService: AzureHttpService;
    let testGuid: Guid;
    
    beforeAll(async () => {
        azureHttpService = new AzureHttpService();

        spyOn(azureHttpService, 'post').and.returnValue(Promise.resolve());

        serviceBusService = new ServiceBusService(azureHttpService, 'testNameSpace', 'testSharedKey');
        testGuid = Guid.create();
        initializeSpies();
    });

    it(`Sent an event and store the event in a localstorage`, async () => {
        // Arrange
        const testQueue: string = 'testQueue';

        // Act
        await serviceBusService.sendEventAsync(testQueue, testGuid);

        // Assert
        expect(LocalCommandStorageService.addCommand).toHaveBeenCalledWith(testQueue, testGuid);
    })

    function initializeSpies(): void {
        const storageItem = new LocalStorageItem('testEvent', testGuid.toString());
        spyOn(LocalCommandStorageService, 'addCommand').withArgs(storageItem.eventName, testGuid).and.returnValue([storageItem]);
    }
});




