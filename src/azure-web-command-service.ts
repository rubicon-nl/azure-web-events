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
     * Check if given command is sent.
     * @param commandId The command id.
     */
    public static hasCommand(commandId: Guid): boolean {
        const storedCommands = this.getCommand(commandId);
        return storedCommands !== null ? true : false;
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
        storedCommands.splice(index, 1);

        this.setStoredCommands(storedCommands);
        return storedCommands;
    }

    private static getStoredCommands(): Array<LocalStorageItem> | null {
        const storedCommands = localStorage.getItem(this.localStorageKey);
        if (!storedCommands) {
            return null;
        }

        return JSON.parse(storedCommands) as Array<LocalStorageItem>;       
    }

    private static setStoredCommands(commands: Array<LocalStorageItem>): void {
        localStorage.setItem(this.localStorageKey, JSON.stringify(commands));
    }
}