export class LocalStorageItem {
    public eventName: string;
    public correlationId: string;

    constructor(eventName: string, correlationId: string) {
        this.eventName = eventName;
        this.correlationId = correlationId;
    }

    public toString = () => {
        return JSON.stringify(this);
    }
}