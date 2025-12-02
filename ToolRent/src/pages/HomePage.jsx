import React, { useState } from 'react'; 
import { useKeycloak } from '@react-keycloak/web';

import adminAvatar from '../assets/admin-avatar.png';
import employeeAvatar from '../assets/employee-avatar.png';

import RegisterUserModal from '../components/RegisterUserModal'; 

import './HomePage.css'; 

const HomePage = () => {
  // ENDPOINT AUTH: We hook into the global authentication state to derive UI permissions.
  const { keycloak } = useKeycloak();
  
  // Why: UI State Management. We need a local toggle to handle the modal's lifecycle (Open/Close) 
  // without routing to a new page.
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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
    <div className="home-container">
      
      <div className="profile-card">
        {/* Why: 'profileImage' is a computed variable. This allows the component to be polymorphic 
            (look different for Admins vs Employees) while using the exact same HTML structure. */}
        <img src={profileImage} alt="Avatar de perfil" className="profile-avatar" />
        <h2 className="profile-name">¡Bienvenido, {userName}!</h2>
        <p className="profile-role"> <strong>{roleName}</strong></p>
        
        {/* ENDPOINT SECURITY: Conditional Rendering. */}
        {/* Why: We hide the 'Create User' button entirely for non-admins. 
            This is a UX pattern (don't show what you can't touch) and a security layer. */}
        {isAdmin && (
            <div style={{marginTop: '20px'}}>
                <button 
                    className="action-btn-primary" 
                    // ENDPOINT TRIGGER: Opens the registration flow.
                    onClick={() => setIsRegisterModalOpen(true)}
                    style={{
                        padding: '10px 20px', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    + Crear Usuario Sistema
                </button>
            </div>
        )}
      </div>

      {/* Why: The Modal is always present in the DOM but conditionally rendered (or hidden via CSS/null return) 
          by the 'isOpen' prop. This keeps the parent layout clean and delegates the rendering logic to the child. */}
      <RegisterUserModal 
          isOpen={isRegisterModalOpen} 
          onClose={() => setIsRegisterModalOpen(false)} 
      />

    </div>
  );
};

export default HomePage;