export const environment = {
    production: false,
    apiUrl: 'http://cc-perso-api.azurewebsites.net/api', // URL de développement
    azureAd: {
        clientId: '7b937ab1-2b96-4206-b373-f0aacb79b4a7', 
        authority: 'https://login.microsoftonline.com/515af266-ba4c-4452-a190-d3a7520a6957',
        redirectUri: 'http://localhost:4200/client/home',
        postLogoutRedirectUri: 'http://localhost:4200/home',
        backendScope:'api://586ffe0a-59c4-4e52-af81-be102e2e6e07/access_as_user'
    },
    features: {
        enableMockData: false, // true = Mock services, false = API services
        enableDebugLogs: true,
        enableCaptcha: true
    }
};
