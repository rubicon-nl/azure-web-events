import { Guid } from "guid-typescript";
import { injectable } from 'inversify';
import { LocalStorageItem } from "./local-storage-item";

/**
 * Manage local stored azure web event commands.
 */
@injectable()
export class LocalCommandStorageService {
    private localStorageKey: string = "SENTMESSAGES";

    /**
     * Get a stored command by its id.
     * @param commandId The command id.
     * @returns If found the command id or null if not found.
     */
    public getCommand(commandId: Guid): LocalStorageItem | undefined {
        const storedCommands = this.getStoredCommands();
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
        const storedCommands = this.getStoredCommands() || new Array<LocalStorageItem>();

        storedCommands.push(new LocalStorageItem(eventName, commandId.toString()));
        this.setStoredCommands(storedCommands);

        return storedCommands;
    }

    /**
     * Delete a azure web event by its command id
     * @param commandId The command id
     * @returns A updated list of all send azure web events
     */
    public deleteCommand(commandId: Guid): LocalStorageItem[] | undefined {
        const storedCommands = this.getStoredCommands();
        if (!storedCommands) {
            return undefined;
        }       
        const index = storedCommands.findIndex((id) => commandId.toString() === id.correlationId);
        storedCommands.splice(index, 1);

        this.setStoredCommands(storedCommands);
        return storedCommands;
    }

    private getStoredCommands(): LocalStorageItem[] | undefined {
        const storedCommands = localStorage.getItem(this.localStorageKey);
        if (!storedCommands) {
            return undefined;
        }

        return JSON.parse(storedCommands) as LocalStorageItem[];       
    }

    private setStoredCommands(commands: LocalStorageItem[]): void {
        localStorage.setItem(this.localStorageKey, JSON.stringify(commands));
    }
}