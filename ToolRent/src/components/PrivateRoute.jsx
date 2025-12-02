// src/components/PrivateRoute.jsx
import { useKeycloak } from '@react-keycloak/web';
import { Navigate } from 'react-router-dom';

// Why: This Wrapper Component acts as a security gatekeeper. It intercepts navigation attempts 
// to protected routes and verifies credentials before the target component is even mounted/rendered.
const PrivateRoute = ({ children, roles }) => {
  const { keycloak, initialized } = useKeycloak();

  // Why: Keycloak initialization is asynchronous (it checks cookies/server). 
  // We must pause execution here; otherwise, we might falsely redirect a valid user 
  // just because the check hasn't finished yet.
  if (!initialized) {
    return <div>Cargando...</div>;
  }

  const isAuthed = keycloak.authenticated;
  
  // ENDPOINT AUTHORIZATION: Checks if the user possesses at least one of the required privilege levels (Realm Roles).
  // If no specific roles are enforced by the prop, we default to true (allow anyone who is simply logged in).
  const hasRequiredRole = roles 
    ? roles.some(role => keycloak.hasRealmRole(role)) 
    : true;

  // Why: The "Happy Path". If the user is identified and has the correct badge, 
  // we render the 'children' (the actual page they wanted to see).
  if (isAuthed && hasRequiredRole) {
    return children;
  }

  // Why: UX Decision. The user IS logged in but lacks permission. We show a static message 
  // instead of redirecting to login to prevent an infinite loop of "Login -> Redirect -> Fail -> Login".
  if (isAuthed && !hasRequiredRole) {
    return <div>Acceso Denegado.</div>;
  }

  // ENDPOINT REDIRECT: Fallback for unauthenticated users.
  // Why: We bounce them back to the public landing page (or login page) to protect the application state.
  return <Navigate to="/" />;
};

export default PrivateRoute;