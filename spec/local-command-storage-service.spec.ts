import { container } from "../src/inversify.config";
import { LocalCommandStorageService } from "../src/local-command-storage-service";
import { LocalStorageItem } from "../src/local-storage-item";
import { Guid } from "guid-typescript";
import { LocalStorageService } from "../src/local-storage-service";

describe(`Unittesting for the LocalCommandStorageService`, async () => {
    let localCommandStorageService: LocalCommandStorageService;
    let storageServiceMock: LocalStorageService;
    let localStorageMock: LocalStorageItem[];
    
    beforeEach(() => {
        createLocalStorageMock();
        localCommandStorageService = new LocalCommandStorageService(storageServiceMock);
    });

    it(`Store a new command and return the updated storages`, async () => {
        // Arrange
        const correlationId = Guid.create();
        const command = new LocalStorageItem('testEvent', correlationId.toString());

        // Act
        const storage = localCommandStorageService.addCommand('testEvent', correlationId);

        // Assert
        expect(storage.length).toBe(1);
        expect(storage[0].eventName).toBe('testEvent');
        expect(storage[0].correlationId).toBe(correlationId.toString())
    });

    it('Delete a stored command and return the update storage', () => {
        // Arrange
        const correlationId1 = Guid.create();
        const correlationId2 = Guid.create();
        addLocalStorageItem('testEvent1', correlationId1);
        addLocalStorageItem('testEvent2', correlationId2);

        // Act
        const storage = localCommandStorageService.deleteCommand(correlationId1);

        // Assert
        expect(storage!.length).toBe(1);
        expect(storage![0].eventName).toBe('testEvent2');
        expect(storage![0]!.correlationId).toBe(correlationId2.toString());        
    });

    it('Validate the presence of a certain stored event', () => {
        // Arrange
        const correlationId = Guid.create();
        addLocalStorageItem('testEvent', correlationId);

        // Act
        const hasEventTrue = localCommandStorageService.hasCommand(correlationId);
        const hasEventFalse = localCommandStorageService.hasCommand(correlationId);

        // Assert
        expect(hasEventTrue).toBeTrue();
        expect(hasEventFalse).toBeTrue();
    });

    afterEach(() => {
        storageServiceMock.clear();
    });

    function createLocalStorageMock(): void {
        storageServiceMock = container.get(LocalStorageService);
        localStorageMock = new Array<LocalStorageItem>();

        spyOn(storageServiceMock, 'get').and.callFake(() => {
            return localStorageMock;
        });
        spyOn(storageServiceMock, 'set').and.callFake((key: string, value: LocalStorageItem[]) => {
            localStorageMock = value;
        });
        spyOn(storageServiceMock, 'clear').and.callFake(() => {
            localStorageMock = [];
        });
    }

    function addLocalStorageItem(eventName: string, correlationId: Guid): void {
        localStorageMock.push(new LocalStorageItem(eventName, correlationId.toString()));
    }
});