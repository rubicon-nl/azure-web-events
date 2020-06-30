import { injectable } from 'inversify';

@injectable()
export class AzureHttpService {

    public async post(url: string, sasKey: string, correlationId: string, body?: any[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = this.createHttpRequest('POST', url, correlationId, sasKey);
            
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

    private createHttpRequest(method: string, url: string, corelationId: string, sasKey: string): XMLHttpRequest {
        const request = new XMLHttpRequest();
        request.open(method, url);
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("x-functions-key", sasKey);
        request.setRequestHeader("correlation-id", corelationId)

        return request;
    }
}