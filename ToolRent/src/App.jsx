// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import './App.css'; 
import './pages/HomePage.css'; // Importante: Reutilizamos tus estilos existentes

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ClientsPage from './pages/ClientsPage';
import InventoryPage from './pages/InventoryPage';
import KardexPage from './pages/KardexPage';
import ClientDetailsPage from './pages/ClientDetailPage';
import ToolDetailPage from './pages/ToolDetailPage';
import RentalDetailPage from './pages/RentalDetailPage'; 

function App() {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div className="loading-screen">Cargando sistema...</div>; 
  }

  return (
    <div className="App">    
      <BrowserRouter>
        <Navbar />

        <div className="main-content">
          
          {/* LANDING PAGE ESTILO HOME (USUARIOS NO AUTENTICADOS) */}
          {!keycloak.authenticated && (
            <div className="home-container animate-fade-in">
              
              {/* Profile Card de Bienvenida */}
              <div className="profile-card">
                <div className="profile-avatar" style={{fontSize: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>🔧</div>
                <h2 className="profile-name">¡Bienvenido a ToolRent!</h2>
                <p className="profile-role">Gestión de Arriendos e Inventario</p>
                
                <div style={{ marginTop: '30px', padding: '15px', borderTop: '1px solid #eee' }}>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
                    Identifícate para gestionar el sistema
                  </p>
                  <div className="login-arrow-indicator" style={{ animation: 'bounce 2s infinite' }}>
                    <span style={{ fontSize: '20px' }}>⬆️</span>
                    <p style={{ fontWeight: 'bold', color: '#17abb6' }}>Usa el botón de arriba a la derecha para iniciar sesión</p>
                  </div>
                </div>
              </div>

              {/* Información del Proyecto en Cards */}
              <div className="info-cards-container">
                <div className="info-card">
                  <h3 className="info-card-title">Sobre el Proyecto</h3>
                  <p className="info-card-text">
                    ToolRent es una plataforma robusta diseñada para el control total del ciclo de vida 
                    de herramientas. Desde la entrega hasta la devolución, gestionamos cada paso con precisión.
                  </p>
                </div>

                <div className="info-card">
                  <h3 className="info-card-title">Reglas de Negocio</h3>
                  <p className="info-card-text">
                    El sistema aplica automáticamente multas por atraso, valida el stock disponible en tiempo real 
                    y bloquea a clientes con deudas pendientes para proteger tus activos.
                  </p>
                </div>

                <div className="info-card">
                  <h3 className="info-card-title">Administración y Reportes</h3>
                  <p className="info-card-text">
                    Genera reportes detallados para visualizar clientes con atrasos, 
                    herramientas más solicitadas y movimientos de Kardex históricos.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* RUTAS PROTEGIDAS */}
          {keycloak.authenticated && (
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/clientes" element={<ClientsPage />} />
              <Route path="/clientes/:rut" element={<ClientDetailsPage />} />
              <Route path="/inventario" element={<InventoryPage />} />
              <Route path="/inventario/:idtool" element ={<ToolDetailPage />} />
              <Route path="/kardex" element={<KardexPage />} />
              <Route path="/rental/:id" element={<RentalDetailPage />} />
            </Routes>
          )}
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;