import React from 'react'; 
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { tutorialContent } from '../tutorials/tutorialContent';
import adminAvatar from '../assets/admin-avatar.webp';
import employeeAvatar from '../assets/employee-avatar.webp';

import './HomePage.css'; 

const HomePage = () => {
  // ENDPOINT AUTH: We hook into the global authentication state to derive UI permissions.
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();

  // Why: Authorization Checks. We pre-calculate these booleans once per render 
  // to avoid repetitive function calls (hasRealmRole) inside the JSX return block.
  const isAdmin = keycloak.hasRealmRole('Admin');
  const isEmployee = keycloak.hasRealmRole('employee');

  // ENDPOINT DATA: Extracting user identity from the JWT token payload (tokenParsed).
  // Why: We use a fallback ('Usuario') to ensure the UI doesn't break or look empty 
  // if the token is malformed or missing the username claim.
  let userName = keycloak.tokenParsed?.preferred_username || 'Usuario';
  let roleName = 'Rol Desconocido';
  let profileImage = employeeAvatar; 

  // Why: Dynamic Asset Loading. Instead of hardcoding images in the JSX, 
  // we determine the visual identity (Avatar + Label) based on the user's highest privilege level.
  if (isAdmin) {
    roleName = 'Administrador';
    profileImage = adminAvatar;
  } else if (isEmployee) {
    roleName = 'Empleado';
    profileImage = employeeAvatar;
  }

  return (
    <PageLayout tutorialData={tutorialContent.home}>
      <div className="home-container">
        
        <div className="profile-card">
          {/* Why: 'profileImage' is a computed variable. This allows the component to be polymorphic 
              (look different for Admins vs Employees) while using the exact same HTML structure. */}
          <img src={profileImage} alt="Avatar de perfil" className="profile-avatar" />
          <h2 className="profile-name">¡Bienvenido, {userName}!</h2>
          <p className="profile-role"> <strong>{roleName}</strong></p>
        </div>

        {/* Information Cards Section */}
        <div className="info-cards-container">
          <button 
            className="info-card clickable-card" 
            onClick={() => navigate('/clientes')}
            type="button"
            aria-label="Gestionar clientes"
          >
            <h3 className="info-card-title">Clientes</h3>
            <p className="info-card-subtitle">Haz clic para gestionar clientes</p>
            <ul className="card-features">
              <li>Registrar nuevos clientes</li>
              <li>Ver historial de arriendos</li>
              <li>Actualizar datos de contacto</li>
              <li>Revisar estado de deudas</li>
            </ul>
          </button>

          <button 
            className="info-card clickable-card" 
            onClick={() => navigate('/inventario')}
            type="button"
            aria-label="Gestionar inventario"
          >
            <h3 className="info-card-title">Inventario</h3>
            <p className="info-card-subtitle">Haz clic para gestionar herramientas</p>
            <ul className="card-features">
              <li>Agregar nuevas unidades</li>
              <li>Editar información de herramientas</li>
              <li>Cambiar estado de unidades</li>
              <li>Visualizar disponibilidad</li>
            </ul>
          </button>

          <button 
            className="info-card clickable-card" 
            onClick={() => navigate('/kardex')}
            type="button"
            aria-label="Ver reportes de Kardex"
          >
            <h3 className="info-card-title">Kardex</h3>
            <p className="info-card-subtitle">Haz clic para ver reportes</p>
            <ul className="card-features">
              <li>Historial de transacciones</li>
              <li>Movimientos de inventario</li>
              <li>Registro de arriendos y devoluciones</li>
              <li>Ranking de herramientas mas rentadas</li>
            </ul>
          </button>
        </div>

      </div>
    </PageLayout>
  );
};

export default HomePage;