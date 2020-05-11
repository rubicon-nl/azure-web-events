import { Guid } from "guid-typescript";
import { LocalStorageItem } from "./azure-web-local-storage-item";

/**
 * Manage local stored azure web event commands.
 */
export class AzureWebCommandService {
    private static localStorageKey: string = "SENDMESSAGES";

    /**
     * Get a stored command by its id.
     * @param commandId The command id.
     * @returns If found the command id or null if not found.
     */
    public static getCommand(commandId: Guid): LocalStorageItem | null {
        const storedCommands = this.getStoredCommands();
        if (storedCommands === null) {
            return null;
        }

        const command = storedCommands.find((id) => commandId.toString() === id.correlationId);
        return command || null;
    }

    /**
     * Store the command id from a sent azure web event.
     * @param commandId The command id.
     * @returns A updated list of all send azure web events.
     */
    public static addCommand(eventName: string, commandId: Guid): Array<LocalStorageItem> {
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
    public static deleteCommand(commandId: Guid): Array<LocalStorageItem> | null {
        const storedCommands = this.getStoredCommands();
        if (!storedCommands) {
            return null;
        }       
        const index = storedCommands.findIndex((id) => commandId.toString() === id.correlationId);
        const updatedStoredCommands = storedCommands.splice(index, 1);

        this.setStoredCommands(updatedStoredCommands);
        return updatedStoredCommands;
    }

    private static getStoredCommands(): Array<LocalStorageItem> | null {
        const storedCommands = localStorage.getItem(this.localStorageKey);
        if (!storedCommands) {
            return null;
        }

        const storage = JSON.parse(storedCommands) as Array<string>;
        return storage.map(c => JSON.parse(c) as LocalStorageItem);        
    }

    private static setStoredCommands(commands: Array<LocalStorageItem>): void {
        const stringyfyArray = commands.map(c => c.toString());
        localStorage.setItem(this.localStorageKey, JSON.stringify(stringyfyArray));
    }
}