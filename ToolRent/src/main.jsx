import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './services/keycloak.js';

// ENDPOINT ENTRY: This is the physical bootstrap point of the React application.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    
    {/* Why: Context Provider Pattern. We wrap the entire application tree in this provider 
        so that the authentication state (tokens, user profile, login/logout methods) 
        is "injected" and available to every single component deep in the hierarchy 
        without needing to pass props manually. */}
    <ReactKeycloakProvider
      authClient={keycloak}
      
      // Why: Silent Authentication Strategy. 'check-sso' attempts to restore an existing session 
      // via browser cookies (iframe) in the background. If the user is already logged in elsewhere, 
      // they get logged in here automatically without seeing the login screen.
      // If not, they remain unauthenticated (public view) rather than being forced to login immediately.
      initOptions={{ onLoad: 'check-sso' }}
      
      // Why: UX Guard. Displays a fallback UI while the SDK performs the initial network handshake.
      // This prevents the App from rendering with a "null" auth state which would cause crashes.
      LoadingComponent={<div>Loading, please wait...</div>}
    >
    <App />
    </ReactKeycloakProvider>
  </StrictMode>,
)