import { Guid } from 'guid-typescript';
import { AzureHttpService } from '../src/azure-http-service';
import { LocalCommandStorageService } from '../src/local-command-storage-service';
import { LocalStorageItem } from '../src/local-storage-item';
import { ServiceBusService } from '../src/service-bus-service';
import {container} from './../src/inversify.config';

describe(`servicebus testing`, async () => {
    let serviceBusService: ServiceBusService;
    let azureHttpService: AzureHttpService;
    let localCommandStorageService: LocalCommandStorageService;
    const azureApiEndpoint: string = 'https://azure.test.url.com/api';
    const sasKey: string = 'MLKDPH&*I#$RNFDKLSDH*(OPGL$';
        
    beforeEach(async () => {
        azureHttpService = container.get(AzureHttpService);
        localCommandStorageService = container.get(LocalCommandStorageService);
        serviceBusService = new ServiceBusService(azureHttpService, localCommandStorageService);
    });

    it(`Sent an event and store the event in a localstorage`, async () => {
        // Arrange
        const testQueue: string = 'testQueue';
        const testGuid: Guid = Guid.create();
        const storageItem = new LocalStorageItem('testEvent', testGuid.toString());
        

        spyOn(localCommandStorageService, 'addCommand').and.returnValue([storageItem]);
        spyOn(azureHttpService, 'post').and.returnValue(Promise.resolve().then());
        
        // Act
        await serviceBusService.sendEventAsync(testQueue, testGuid);

        // Assert
        expect(localCommandStorageService.addCommand).toHaveBeenCalledWith(testQueue, testGuid);
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
        await expectAsync(action).toBeRejectedWithError('An error occured while sending the command: 0-test error');
    });

    it(`Call sendEventAsync before service is initialized returns an error`, async () => {
        // Arrange
        const testQueue = 'testQueue';
        const testGuid = Guid.create();

        const action = serviceBusService.sendEventAsync(testQueue, testGuid);

        // Assert
        await expectAsync(action).toBeRejected(new Error('An error occured while sending the command: 0-Error: No Azure AD configuration found. Initialize Azure AD configuration first.'));

    })
});




