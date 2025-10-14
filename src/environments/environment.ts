export const environment = {
    production: true,
    apiUrl: 'https://cc-perso-api.azurewebsites.net/api', // URL de production
    azureAd: {
        clientId: '7b937ab1-2b96-4206-b373-f0aacb79b4a7', // Client ID de test - À remplacer
        authority: 'https://login.microsoftonline.com/515af266-ba4c-4452-a190-d3a7520a6957',
        redirectUri: 'https://cc-perso-app.azurewebsites.net/client/home',
        postLogoutRedirectUri: 'https://cc-perso-app.azurewebsites.net/home',
        backendScope:'api://586ffe0a-59c4-4e52-af81-be102e2e6e07/access_as_user'
    },
    features: {
        enableMockData: false, // false = API services en production
        enableDebugLogs: false,
        enableCaptcha: true
    }
};
