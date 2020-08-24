
import { injectable } from 'inversify';
import { AuthenticationMethod } from './authentication-method';
import { AccountInfo, Configuration, PublicClientApplication } from '@azure/msal-browser';


@injectable()
export class AzureWebConfig {
    private publicCLient: PublicClientApplication ;
    private authMethod: AuthenticationMethod;

    public endpoint: string;
    public sharedAccessToken?: string;

    public initializeAzureAD(endpoint: string, config: Configuration): boolean {
        this.endpoint = endpoint;
        this.publicCLient = new PublicClientApplication(config);
        this.authMethod = AuthenticationMethod.AzureAD;

        return !this.publicCLient.getAllAccounts();
    }

    public initializeAzureSas(endpoint: string, sharedAccessToken: string): boolean {
        this.endpoint = endpoint;
        this.sharedAccessToken = sharedAccessToken;
        this.authMethod = AuthenticationMethod.SharedAccessToken;

        return true;
    }

    get authenticationMethod(): AuthenticationMethod {
        return this.authMethod;
    }

    get userProfile(): AccountInfo | null {
        if (this.publicCLient.getAllAccounts()) {
            return this.publicCLient.getAllAccounts()[0];
        } else {
            return null;
        }
    }
}