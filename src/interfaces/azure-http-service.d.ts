export interface IAzureHttpService {
    post(url: string, sasKey: string, correlationId: string, body?: any[]): Promise<void>
}