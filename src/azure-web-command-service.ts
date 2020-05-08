import { Guid } from "guid-typescript";

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
    public static getCommand(commandId: Guid): Guid | null {
        const storedCommands = this.getStoredCommands();
        if (storedCommands === null) {
            return null;
        }

        const id = storedCommands.find((id) => id.equals(commandId));
        return id || null;
    }

    /**
     * Store the command id from a sent azure web event.
     * @param commandId The command id.
     * @returns A updated list of all send azure web events.
     */
    public static addCommand(commandId: Guid): Array<Guid> {
        const storedCommands = this.getStoredCommands() || new Array<Guid>();
        storedCommands.push(commandId);
        this.setStoredCommands(storedCommands);

        return storedCommands;
    }

    /**
     * Delete a azure web event by its command id
     * @param commandId The command id
     * @returns A updated list of all send azure web events
     */
    public static deleteCommand(commandId: Guid): Array<Guid> | null {
        const storedCommands = this.getStoredCommands();
        if (!storedCommands) {
            return null;
        }       
        const index = storedCommands.findIndex((id) => id.equals(commandId));
        const updatedStoredCommands = storedCommands.splice(index, 1);

        this.setStoredCommands(updatedStoredCommands);
        return updatedStoredCommands;
    }

    private static getStoredCommands(): Array<Guid> | null {
        const storedCommands = localStorage.getItem(this.localStorageKey);
        if (!storedCommands) {
            return null;
        }

        const storage = JSON.parse(storedCommands) as Array<string>;
        return storage.map(c => Guid.parse(c));        
    }

    private static setStoredCommands(commands: Array<Guid>): void {
        const stringyfyArray = commands.map(c => c.toString());
        localStorage.setItem(this.localStorageKey, JSON.stringify(stringyfyArray));
    }
}