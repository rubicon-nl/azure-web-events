# DemoAzureWebEvent

This example project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.4.
With this project you are able to test en see how Azure-Web-Events works.
This project has a direct import from the Azure-Web-Events package therefor it always uses the actual version.

This project is a basic angular 9 project with a single component (app.component).
This component has a basic UI which can be used for sending and recieving azure web events.
When you enter a message in the input field and click on the sent button a azure event will be send to azure.
In the table below you see the event event details. When the event is processed and the complete signal is received the event details will be updated with the received data.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## HOW TO Configuration

Before you can run this project you have to configure Azure-Web-Events.
In app.component.ts AzureWebEvents is created and needs to be configured.
Add the following configuration:
1. On line 21 add the Azure API url and the SAS key.
2. On line 36 add the event description. (When you have an action process in azure named 'Delete-File' add this as event description)

AzureWebEvents is configured.



