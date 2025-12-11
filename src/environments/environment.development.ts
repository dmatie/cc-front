export const environment = {
    production: false,
    //apiUrl: 'https://cc-perso-api.azurewebsites.net/api', // URL de développement
    apiUrl: 'https://localhost:7242/api', // URL de développement
   // apiUrl: 'https://clientconnection-backend.redwater-84229c45.canadaeast.azurecontainerapps.io/api', // URL de développement
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
    },
    encryption: {
        enabled: true,
        key: 'Pzgq08B00AhKkVVA3cfmAJnk1EtgLPbn29cltULMlVs=',
        neverEncryptPaths: [
            '/api/disbursements',
            '/api/accessrequests/*/submit',
            '/api/accessrequests/downloadsignedform'
        ]
    }
};
