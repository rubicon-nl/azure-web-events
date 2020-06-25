import { injectable } from "inversify";
import { LocalStorageItem } from "./local-storage-item";

@injectable()
export class LocalStorageService {
    public get(key: string): LocalStorageItem[] | undefined {
        const value = localStorage.getItem(key);
        if (!value) {
            return undefined;
        }

        return JSON.parse(value) as LocalStorageItem[];       
    }

    public set(key: string, value: LocalStorageItem[]): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    public clear(): void {
        localStorage.clear();
    }
}