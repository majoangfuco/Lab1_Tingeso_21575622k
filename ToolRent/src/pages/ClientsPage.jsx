import React, { useState, useEffect } from 'react';

import  './ClientsPage.css';
import ClientService from '../services/ClientService';
import SearchBar from '../components/SearchBar';
import AddClientButton from '../components/AddClientButton';
import ClientList from '../components/ClientList';
import NewClientModal from '../components/NewClientModal';

const ClientsPage = () => {
  const [clients, setClients] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Why: Separate state for filtering prevents mixing UI controls with the actual data source,
  // allowing independent management of search text vs status dropdowns.
  const [statusFilter, setStatusFilter] = useState('');

  // ENDPOINT DATA: This function acts as the central data hub.
  // Why: We accept arguments (keyword, status) instead of reading state directly inside
  // to allow immediate refreshing when the user changes a filter, avoiding "stale state" issues.
  const fetchClients = async (keyword = searchTerm, status = statusFilter) => {
      setIsLoading(true);
      try {
        // ENDPOINT QUERY: The service layer abstracts the Axios call (GET /clients?q=...&status=...)
        const response = await ClientService.getAll(keyword, status);
        setClients(response.data || []);
      } catch (error) {
        console.error("Error", error);
      } finally {
        // Why: Guaranteed execution ensuring the UI doesn't get stuck in a "Loading" state 
        // even if the network request fails completely.
        setIsLoading(false);
      }
  };

  const handleSaveClient = async (clientData) => {
    try {
      // ENDPOINT TRIGGER: Initiates the creation of a new resource (POST).
      await ClientService.create(clientData);
      
      // Why: We refresh the list immediately after creation so the user sees their new item 
      // without needing to manually refresh the page.
      fetchClients(); 
      setIsModalOpen(false);
      alert("¡Cliente creado correctamente!");
    } catch (error) {
      console.error("Error al guardar:", error);
      
      // Why: Granular Error Handling. We parse specific business logic errors sent by the backend 
      // (e.g., "RUT already exists") to give the user actionable feedback instead of a generic "Failed".
      const serverMessage = error.response?.data?.error;
      if (serverMessage) {
        alert(`Error del Servidor: ${serverMessage}`);
      } else if (error.response?.status === 403) {
        alert("No tienes permisos para crear clientes.");
      } else {
        alert("Ocurrió un error inesperado al guardar.");
      }
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Performance Optimization: We implement a "Debounce" pattern here.
  // Why: If we fired an API call on every single keystroke, we would flood the server.
  // This logic waits 500ms after the user *stops* typing before actually sending the request.
  useEffect(() => {
    const delayFn = setTimeout(() => {
      fetchClients(searchTerm);
    }, 500);
    // Cleanup: Cancels the previous timer if the user types again before 500ms passes.
    return () => clearTimeout(delayFn);
  }, [searchTerm]);

  return (
    <div className="clients-container">
      <h1 className="page-title">Gestión de Clientes</h1>

      <div className="actions-bar">
        <SearchBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />
        <AddClientButton 
          onClick={() => setIsModalOpen(true)} 
        />

        <select 
            value={statusFilter}
            // Why: Inline onChange handler allows us to update the state AND trigger a fetch immediately,
            // ensuring the list updates the moment the dropdown changes value.
            onChange={(e) => {
                setStatusFilter(e.target.value);
                fetchClients(searchTerm, e.target.value); 
            }}
            className="border p-2 rounded"
        >
            <option value="">Todos los Estados</option>
            <option value="true">Activos</option>
            <option value="false">Bloqueados</option>
        </select>
      </div>

      <ClientList 
        clients={clients} 
        isLoading={isLoading} 
      />

      <NewClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveClient} 
      />
    </div>
  );
};
export default ClientsPage;