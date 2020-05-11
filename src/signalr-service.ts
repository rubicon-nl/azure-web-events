import { Subject } from 'rxjs';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';

export class SignalRService {
    private signalrMessage: Subject<any> = new Subject<any>();
    private hubConnection: HubConnection;

    constructor(signalrUrl: string) {
        this.hubConnection = new HubConnectionBuilder()
        .withUrl(signalrUrl)
        .build();
     }

    public listen(eventName: string): Subject<any[]> {
        this.hubConnection
        .start()
        .then()
        .catch(error => { throw Error(`Error while starting connection: ${error}`);});

        this.hubConnection.on(eventName, (args: any[]) => {
            console.log(`Received message ${JSON.stringify(args)}`);
            this.signalrMessage.next(args);
        })

        return this.signalrMessage;
    }
}