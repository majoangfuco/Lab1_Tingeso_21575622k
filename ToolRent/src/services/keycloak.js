// src/services/keycloak.js
import Keycloak from 'keycloak-js';

// Why: We initialize the official Keycloak SDK here. This object handles the complex OIDC protocol 
// (redirects, token parsing, refresh loops) so we don't have to write that logic manually.
const keycloak = new Keycloak({
  // ENDPOINT CONNECTION: Points to the Identity Provider (IdP). 
  // When a user logs in, the browser will physically redirect to this URL to show the login form.
  url: 'http://localhost:9090',      
  
  // Why: Logical Partition. Keycloak can host multiple companies or projects. 
  // We specify exactly which "Tenant" (Realm) we want to authenticate against.
  realm: 'toolrent-realm',             
  
  // ENDPOINT CONFIG: Public Identifier. 
  // Why: Since this is a Single Page Application (SPA) running in the browser, we CANNOT store a 'Client Secret' here.
  // We rely on the 'clientId' and PKCE flow for security.
  clientId: 'sisgr-frontend',       
});

// Why: Singleton Pattern. We export a single instance to be shared across the entire React application.
// This ensures that the authentication state (Is logged in? What is the token?) is consistent in every component.
export default keycloak;