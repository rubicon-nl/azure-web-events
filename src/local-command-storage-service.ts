import 'reflect-metadata';
import { Guid } from "guid-typescript";
import { injectable, inject } from 'inversify';
import { LocalStorageItem } from "./local-storage-item";
import { LocalStorageService } from './local-storage-service';

/**
 * Manage local stored azure web event commands.
 */
@injectable()
export class LocalCommandStorageService {
    private localStorageKey: string = "SENTMESSAGES";

    constructor(@inject(LocalStorageService)private storageService: LocalStorageService) {
    }

    /**
     * Get a stored command by its id.
     * @param commandId The command id.
     * @returns If found the command id or null if not found.
     */
    public getCommand(commandId: Guid): LocalStorageItem | undefined {
        const storedCommands = this.storageService.get(this.localStorageKey);
        if (!storedCommands) {
            return undefined;
        }

        return storedCommands.find((id) => commandId.toString() === id.correlationId);
    }

    /**
     * Check if given command is sent.
     * @param commandId The command id.
     */
    public hasCommand(commandId: Guid): boolean {
        const storedCommands = this.getCommand(commandId);
        return storedCommands !== undefined;
    }

    /**
     * Store the command id from a sent azure web event.
     * @param commandId The command id.
     * @returns A updated list of all send azure web events.
     */
    public addCommand(eventName: string, commandId: Guid): LocalStorageItem[] {
        const storedCommands = this.storageService.get(this.localStorageKey) || new Array<LocalStorageItem>();

        storedCommands.push(new LocalStorageItem(eventName, commandId.toString()));
        this.storageService.set(this.localStorageKey, storedCommands);

        return storedCommands;
    }

    /**
     * Delete a azure web event by its command id
     * @param commandId The command id
     * @returns A updated list of all send azure web events
     */
    public deleteCommand(commandId: Guid): LocalStorageItem[] | undefined {
        const storedCommands = this.storageService.get(this.localStorageKey);
        if (!storedCommands) {
            return undefined;
        }       
        const index = storedCommands.findIndex((id) => commandId.toString() === id.correlationId);
        storedCommands.splice(index, 1);

        this.storageService.set(this.localStorageKey, storedCommands);
        return storedCommands;
    }
}