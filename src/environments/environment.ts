export const environment = {
    production: true,
    apiUrl: 'https://clientconnection-backend.victoriousmeadow-cdaaa30d.eastus.azurecontainerapps.io/api', // URL de production
    azureAd: {
        clientId: '6ea7798e-7e05-452a-a8b2-13909a0566d0', // Client ID de test - À remplacer
        authority: 'https://login.microsoftonline.com/727339d1-16ec-43cb-b6c3-5001fec5e907',
        redirectUri: 'https://clientconnection-frontend.gentlepond-89c90e87.eastus.azurecontainerapps.io/client/home',
        postLogoutRedirectUri: 'https://clientconnection-frontend.gentlepond-89c90e87.eastus.azurecontainerapps.io/home',
        backendScope:'api://e2cfa7cd-a691-48df-9da3-3171fe3c5c41/access_as_user'
    },
    features: {
        enableMockData: false, // false = API services en production
        enableDebugLogs: false,
        enableCaptcha: true
    },
    encryption: {
        enabled: true,
        key: 'Pzgq08B00AhKkVVA3cfmAJnk1EtgLPbn29cltULMlVs=',
        neverEncryptPaths: [
            '/api/disbursements',
            '/api/accessrequests/*/submit',
            '/api/accessrequests/downloadsignedform',
            '/api/otherdocuments'
        ]
    }
};
