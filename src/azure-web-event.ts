import { Guid } from "guid-typescript";
import { SendableMessageInfo } from "@azure/service-bus";
import { AzureWebEventState } from "./azure-web-event-state";

export class AzureWebEvent {
    public messageId: Guid;
    public message: SendableMessageInfo;
    public progression: AzureWebEventState = AzureWebEventState.New;

    constructor(message: SendableMessageInfo) {
        this.messageId = Guid.create();
        this.message = message;
     }

}