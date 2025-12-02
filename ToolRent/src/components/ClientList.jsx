import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/ClientsPage.css';

const ClientList = ({ clients, isLoading }) => {
  const navigate = useNavigate();

  const handleRowClick = (rut) => {
    // ENDPOINT FLOW: Initiates navigation to the specific client view.
    // Why: Using the RUT in the URL allows the next page to fetch specific data directly from the backend.
    navigate(`/clientes/${rut}`);
  };

  // Why: specific guards simplify the main render logic and prevent null pointer errors during data fetching.
  if (isLoading) return (
    <div className="table-container">
      <div className="loading-text">Cargando clientes...</div>
    </div>
  );

  if (!clients || clients.length === 0) return (
    <div className="table-container">
      <div className="loading-text">No se encontraron clientes registrados.</div>
    </div>
  );

  return (
    <div className="table-container">
      <table className="clients-table">
        <thead>
          <tr>
            <th>RUT</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr 
              // Why: Using a unique DB ID (idClient) is critical for React's rendering performance.
              key={client.idClient} 
              // Why: Making the whole row clickable improves UX compared to a single small link.
              onClick={() => handleRowClick(client.rut)} 
              className="client-row-hover" 
            >
              <td className="text-rut">{client.rut}</td>
              
              <td style={{fontWeight: '600', color: '#333'}}>{client.clientName}</td>
              
              <td style={{color: '#666'}}>{client.mail}</td>
              
              <td>{client.phone}</td>
              
              <td>
                {/* Why: Conditional styling gives immediate visual cues about account standing without reading text. */}
                <span className={`status-badge ${client.clientStatus ? 'status-active' : 'status-blocked'}`}>
                  {client.clientStatus ? 'ACTIVO' : 'BLOQUEADO'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientList;