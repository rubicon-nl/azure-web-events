import { Component } from '@angular/core';
import { SendMessage } from './send-message';
import { AzureWebEvents } from '../../../src/index';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  sentMessages: SendMessage[] = new Array<SendMessage>();
  message: string = "";
  private awe: AzureWebEvents;

  constructor() {
  }

  private ngOnInit(): void {
    this.awe = new AzureWebEvents()
    this.awe.init(,);
  }

  public async sendMessage(): Promise<void> {
    if (!this.message) {
      alert("no message entered, please enter message");
    } else {
      
      try {
        const newMessage = new SendMessage();
        newMessage.id = this.generateMessageId();
        newMessage.sendMessage = this.message;
        newMessage.sendTimeStamp = new Date().toLocaleTimeString();
        this.sentMessages.push(newMessage);

        this.awe.sendAsync(, [newMessage.id, newMessage.sendMessage], (args) => this.responseMessage(args));        
      } catch (error) {
        console.error(error);
      }      
    }
  }

  public removeMessage(messageId: number): void {
    const index = this.sentMessages.findIndex((m) => m.id === messageId);
    this.sentMessages.splice(index, 1);
  }

  private responseMessage(args: string[]): void {
    const sentMessage = this.sentMessages.find(m => m.id === Number.parseInt(args[0]));

    if (sentMessage) {
      sentMessage.responseMessage = args[1];
      sentMessage.responseTimeStamp = new Date().toLocaleTimeString()
    }
  }

  private generateMessageId(): number {
    if (!this.sentMessages || this.sentMessages.length === 0) {
      return 1;
    } else {
      const number = this.sentMessages.map(m => m.id).sort((first: number, second: number) => second - first)
      return number[0]+1;
    }
  }
}
