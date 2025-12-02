// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import './App.css'; 

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ClientsPage from './pages/ClientsPage';
import InventoryPage from './pages/InventoryPage';
import KardexPage from './pages/KardexPage';
import ClientDetailsPage from './pages/ClientDetailPage';
import ToolDetailPage from './pages/ToolDetailPage';
import RentalDetailPage from './pages/RentalDetailPage';

function App() {
  // ENDPOINT SECURITY: Hooks into the Identity Provider.
  // 'initialized' tells us if the handshake with the Keycloak server is complete.
  const { keycloak, initialized } = useKeycloak();

  // Why: The "Loading Gate". Keycloak initialization is asynchronous (network request).
  // We must block the entire UI render until we know for sure if the user is logged in or not.
  // Attempting to render routes before this finishes would result in false redirects or token errors.
  if (!initialized) {
    return <div>Cargando...</div>; 
  }

  return (
    <div className="App">    
      <BrowserRouter>
        
        {/* Why: Persistent Layout. Placing the Navbar outside the 'Routes' block ensures it remains 
            visible and static as the user navigates between different pages, maintaining context. */}
        <Navbar />

        <div className="main-content">
          
          {/* Why: Public Landing. A lightweight fallback for visitors who haven't logged in yet. 
              This prevents the "Flash of Unstyled Content" or unauthorized access errors by 
              physically removing the protected routes from the DOM entirely. */}
          {!keycloak.authenticated && (
            <h1>Bienvenido a ToolRent. Por favor, inicia sesión.</h1>
          )}

          {/* ENDPOINT ROUTING: The "Switchboard". These paths define the application's map.
              Only authenticated users can see this block, effectively acting as a client-side firewall. */}
          {keycloak.authenticated && (
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/clientes" element={<ClientsPage />} />
              
              {/* ENDPOINT NAVIGATION: Dynamic Parametrization. 
                  We use wildcards like ':rut' or ':id' to tell the router that this segment is variable data, 
                  allowing one single component to handle thousands of unique record views. */}
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