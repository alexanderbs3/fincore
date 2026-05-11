export const environment = {
  production: false,
  // Path relativo — o proxy do Angular CLI (proxy.conf.json) roteia /v1/* → localhost:8080
  // Isso elimina CORS em desenvolvimento sem mexer no backend
  apiBaseUrl: '/v1',
};
