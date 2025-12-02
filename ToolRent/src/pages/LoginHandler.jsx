// src/pages/LoginHandler.jsx
import { useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';

// Why: This component acts as a "Traffic Controller". It sits between the IDP (Keycloak) login page
// and the application's protected content to route users based on their security clearance (Roles).
const LoginHandler = () => {
  const { keycloak, initialized } = useKeycloak();
  const navigate = useNavigate();

  useEffect(() => {
    // ENDPOINT TRIGGER: The "Gatekeeper" Check.
    // Why: We must ensure the Keycloak SDK is fully loaded (initialized) and the token is valid (authenticated) 
    // before attempting to read roles, otherwise we might get false negatives or crashes.
    if (initialized && keycloak.authenticated) {
      
      // ENDPOINT ROUTING: Branching logic based on Business Roles.
      // Why: Administrators require a different dashboard (Management) than regular employees (Operation).
      if (keycloak.hasRealmRole('ADMIN')) {
        navigate('/admin-dashboard');
      } else if (keycloak.hasRealmRole('USER')) {
        navigate('/user-dashboard');
      } else {
        // Why: Fallback / Edge Case Handling.
        // If a user has a valid account but no assigned role (e.g., a newly created account waiting for approval),
        // we send them to a neutral "Waiting Room" or "Welcome" page instead of crashing.
        navigate('/welcome'); 
      }
    }
  }, [keycloak, initialized, navigate]);

  // Why: Visual Feedback (Interim State).
  // Since the logic above happens milliseconds after the page loads, we show a brief message 
  // so the user knows the application is processing their credentials and hasn't frozen.
  return <div>Iniciando sesión, redirigiendo...</div>;
};

export default LoginHandler;