// src/pages/LoginHandler.jsx
import { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logoTR.webp';
import './LoginHandler.css';

// Why: This component acts as a "Traffic Controller". It sits between the IDP (Keycloak) login page
// and the application's protected content to route users based on their security clearance (Roles).
const LoginHandler = () => {
  const { keycloak, initialized } = useKeycloak();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // ENDPOINT TRIGGER: The "Gatekeeper" Check.
    // Why: We must ensure the Keycloak SDK is fully loaded (initialized) and the token is valid (authenticated) 
    // before attempting to read roles, otherwise we might get false negatives or crashes.
    if (initialized && keycloak.authenticated) {
      setIsLoading(true);
      
      // ENDPOINT ROUTING: Branching logic based on Business Roles.
      // Why: Administrators require a different dashboard (Management) than regular employees (Operation).
      const timer = setTimeout(() => {
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
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [keycloak, initialized, navigate]);

  // Show different UI based on authentication state
  if (!initialized) {
    return (
      <div className="login-handler-container">
        <div className="login-handler-content">
          <div className="login-handler-loading">
            <div className="login-handler-spinner"></div>
            Inicializando aplicación...
          </div>
        </div>
      </div>
    );
  }

  // If authenticated and loading, show loading screen
  if (keycloak.authenticated && isLoading) {
    return (
      <div className="login-handler-container">
        <div className="login-handler-content">
          <div className="login-handler-loading">
            <div className="login-handler-spinner"></div>
            Redirigiendo...
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show login prompt
  return (
    <div className="login-handler-container">
      <div className="login-handler-content">
        <img src={logo} alt="Logo ToolRent" className="login-handler-logo" />
        
        <h1 className="login-handler-title">ToolRent</h1>
        
        <p className="login-handler-subtitle">
          Sistema integral de gestión de rentales de herramientas. Administra tu inventario, clientes y transacciones de forma eficiente.
        </p>

        <div className="login-handler-features">
          <div className="login-handler-feature">
            <div className="login-handler-feature-icon">👥</div>
            <h3>Gestión de Clientes</h3>
            <p>Registra y administra todos tus clientes en un solo lugar.</p>
          </div>

          <div className="login-handler-feature">
            <div className="login-handler-feature-icon">🔧</div>
            <h3>Inventario</h3>
            <p>Controla herramientas y disponibilidad en tiempo real.</p>
          </div>

          <div className="login-handler-feature">
            <div className="login-handler-feature-icon">📋</div>
            <h3>Kardex</h3>
            <p>Historial completo de todas las transacciones.</p>
          </div>

          <div className="login-handler-feature">
            <div className="login-handler-feature-icon">💰</div>
            <h3>Rentales</h3>
            <p>Registra y gestiona todos los arriendos fácilmente.</p>
          </div>
        </div>

        <div className="login-handler-cta">
          <p className="login-handler-cta-text">
            ¿Listo para comenzar? Presiona el botón de abajo para iniciar sesión.
          </p>
          <button 
            className="login-handler-button"
            onClick={() => keycloak.login()}
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginHandler;