import { injectable } from 'inversify';
import { AzureWebConfig } from './azure-web-config';
import { AuthenticationMethod } from './authentication-method';

@injectable()
export class AzureHttpService {
   
    constructor(private config: AzureWebConfig) {
    }

    public async post(service: string, correlationId: string, body?: any[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = this.createHttpRequest('POST', service, correlationId);
            
            request.onerror = () => {
                reject({
                    status: 0,
                    statusText: `An network error has occurred`
                });
            }

            request.onload = () => {
                if (request.status >= 200 && request.status <= 300) {
                    resolve(request.response);
                } else {
                    reject({
                            status: request.status,
                            statusText: request.statusText
                        }
                    );
                }
            }
            
            request.send();
        });
    }

    private createHttpRequest(method: string, url: string, corelationId: string): XMLHttpRequest {
        const request = new XMLHttpRequest();
        request.open(method, `${this.config.endpoint}/${url}`);
        
        if(this.config.authenticationMethod === AuthenticationMethod.AzureAD &&
            this.config.userProfile !== null) {
                request.setRequestHeader("Authorization", `Bearer ${this.config.userProfile.username}`);
        } else if (this.config.authenticationMethod === AuthenticationMethod.SharedAccessToken && this.config.sharedAccessToken) {
            request.setRequestHeader("x-functions-key", this.config.sharedAccessToken);
        } else {
            console.log(`The config`, this.config);
            throw new Error(`Not authenticated with method ${this.config.authenticationMethod}, please login first`);
        }

        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestHeader('correlation-id', corelationId)

        return request;
    }
}