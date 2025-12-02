// src/components/Navbar.jsx
import { NavLink } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import './Navbar.css';

import logo from '../assets/logoTR.png'; 

const Navbar = () => {
  // Why: We hook into the global authentication context. This single source of truth 
  // drives the entire UI state (what is visible vs hidden) based on login status.
  const { keycloak } = useKeycloak();

  return (
    <nav className="navbar">
      
      {/* BLOQUE IZQUIERDO */}
      <div className="navbar-left">
         <img src={logo} alt="Logo" className="logo-avatar" /> 
         <span className="navbar-brand">ToolRent</span>
      </div>

      {/* Central Block */}
      {/* Why: Conditional rendering acts as a basic security layer (Security through Obscurity). 
          We prevent unauthenticated users from even seeing the application's structure/routes. */}
      {keycloak.authenticated && (
        <ul className="navbar-links">
          {/* Why: NavLink is preferred over Link or <a> because it automatically applies 
              an 'active' class when the URL matches, allowing for visual highlighting of the current page. */}
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/clientes">Clientes</NavLink></li>
          <li><NavLink to="/inventario">Inventario</NavLink></li>
          <li><NavLink to="/kardex">Kardex</NavLink></li>
        </ul>
      )}

      {/* rigth block */}
      <div className="navbar-user">
        {!keycloak.authenticated ? (
          // ENDPOINT TRIGGER: Redirects the user to the Keycloak Identity Provider (SSO).
          // Why: Authentication logic is offloaded entirely to the external service; the app remains stateless regarding credentials.
          <button onClick={() => keycloak.login()} className="logout-button">
            Iniciar Sesión
          </button>
        ) : (
          <>
             {/* ENDPOINT DATA: We read user details directly from the JWT token cached in the browser.
                 Why: This avoids an unnecessary API call to the backend just to fetch the user's name. */}
            <span>{keycloak.tokenParsed.preferred_username}</span>
            <button onClick={() => keycloak.logout()} className="logout-button">
              Cerrar Sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;