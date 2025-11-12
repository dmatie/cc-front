export const environment = {
    production: false,
    apiUrl: 'https://localhost:7501/api', // URL de développement
    azureAd: {
        clientId: '6ea7798e-7e05-452a-a8b2-13909a0566d0', 
        authority: 'https://login.microsoftonline.com/727339d1-16ec-43cb-b6c3-5001fec5e907',
        redirectUri: 'http://localhost:4200/client/home',
        postLogoutRedirectUri: 'http://localhost:4200/home',
        backendScope:'api://e2cfa7cd-a691-48df-9da3-3171fe3c5c41/access_as_user'
    },
    features: {
        enableMockData: false, // true = Mock services, false = API services
        enableDebugLogs: true,
        enableCaptcha: true
    }
};
