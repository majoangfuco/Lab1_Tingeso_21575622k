import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InventoryService from '../services/InventoryService'; 
import './InventoryPage.css'; 


// --- INTERNAL COMPONENT: Create Type Modal ---
const CreateTypeModal = ({ isOpen, onClose, onSave, categories }) => {
  const [formData, setFormData] = useState({ 
    nameTool: '', 
    categoryTool: '', 
    repositionPrice: '',
    rentPrice: '',  
    duePrice: ''    
  });

  // Why: Basic performance optimization. If the modal is hidden, we return null 
  // to avoid the browser calculating layout for invisible elements.
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    // Why: Prevents the browser's default behavior of reloading the entire page 
    // when a form is submitted, which would wipe out our React application state.
    e.preventDefault();
    
    // ENDPOINT TRIGGER: Passes the captured form data up to the parent component
    // to execute the actual API call.
    onSave(formData);
    
    // Why: Cleanup. We wipe the form state so that if the user opens the modal again later,
    // they start with a fresh, empty form instead of seeing their old data.
    setFormData({ nameTool: '', categoryTool: '', repositionPrice: '', rentPrice: '', duePrice: '' });
  };

  return (
    // Why: The 'onClick={onClose}' on the overlay allows the user to close the modal 
    // simply by clicking the dark background outside the box (standard UX pattern).
    <div className="modal-overlay" onClick={onClose}>
      
      {/* Why: 'e.stopPropagation()' is critical here. Without it, clicking inside the white box 
          would "bubble up" to the overlay and trigger the onClose function, accidentally closing the modal. */}
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 style={{marginTop: 0, textAlign: 'center', color: '#C7372C'}}>Nuevo Tipo de Herramienta</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            {/* Why: 'autoFocus' automatically puts the cursor in the first field when the modal opens,
                saving the user one click and speeding up data entry. */}
            <input 
              type="text" 
              value={formData.nameTool} 
              onChange={e => setFormData({...formData, nameTool: e.target.value})} 
              required autoFocus 
              placeholder="e.j. Taladro Percutor"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select 
              value={formData.categoryTool} 
              onChange={e => setFormData({...formData, categoryTool: e.target.value})} 
              required
            >
              {/* Why: The first option is disabled to force the user to make a conscious selection 
                  rather than defaulting to the first item in the list accidentally. */}
              <option value="" disabled>Seleccione una Categoría</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            <div className="form-group">
              <label>Precio de Reposición ($)</label>
              <input 
                type="number" 
                min="0"
                value={formData.repositionPrice} 
                onChange={e => setFormData({...formData, repositionPrice: e.target.value})} 
                required 
              />
            </div>
             <div className="form-group">
              <label>Precio Diario de Renta ($)</label>
              <input 
                type="number" 
                min="0"
                value={formData.rentPrice} 
                onChange={e => setFormData({...formData, rentPrice: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Precio Diario de Multa ($)</label>
            <input 
              type="number" 
              min="0"
              value={formData.duePrice} 
              onChange={e => setFormData({...formData, duePrice: e.target.value})} 
              required 
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT: Inventory Page ---
const InventoryPage = () => {
  const navigate = useNavigate();

  const [catalog, setCatalog] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

  // Why: Hardcoding categories ensures the frontend has a fallback if the backend reference table is missing.
  // Ideally, this should be fetched from an API endpoint (GET /categories) in the future.
  const categories = [
    "Herramientas Manuales",
    "Herramientas Eléctricas",
    "Herramientas de Medición",
    "Maquinaria Pesada / Gran Tamaño"
  ];

  // 1. Fetch Data (Using Service Layer)
  const fetchCatalog = async (keyword = '') => {
    setIsLoading(true);
    try {
      // ENDPOINT QUERY: Retrieves the list of tools, optionally filtered by a keyword query param.
      const response = await InventoryService.getAll(keyword);
      setCatalog(response.data || []);
    } catch (error) {
      console.error("Error loading catalog:", error);
      // Why: Resetting to empty array prevents the map function in the render block from crashing 
      // if 'response.data' is undefined due to an error.
      setCatalog([]);
    } finally {
      // Why: We must turn off the loading indicator regardless of success or failure 
      // so the user isn't stuck looking at a "Loading..." spinner forever.
      setIsLoading(false);
    }
  };

  // 2. Create New Type (Using Service Layer)
  const handleSaveType = async (typeData) => {
    try {
      // ENDPOINT POST: Sends the new tool definition to the backend database.
      await InventoryService.createType(typeData);
      
      // Why: Immediate Refresh. We re-fetch the data to display the new item in the table immediately, 
      // confirming to the user that the action worked.
      fetchCatalog(); 
      setIsTypeModalOpen(false);
      alert("Tipo de herramienta creado exitosamente.");

    } catch (error) {
      console.error("Error creating type:", error);
      
      // Why: Specific Error Handling. We check for business logic errors (like validation) 
      // or permission errors (403) to give the user exact instructions on what went wrong.
      const serverMessage = error.response?.data?.error;
      
      if (serverMessage) {
        alert(`Server Error: ${serverMessage}`);
      } else if (error.response?.status === 403) {
        alert("Acceso denegado: No tienes permisos para ingresar un tipo de herramienta, solicita ayuda a un administrador.");
      } else {
        alert("A ocurrido un error inesperado.");
      }
    }
  };

  // 3. Navigation
  const handleRowClick = (idtool) => {
    // ENDPOINT NAVIGATION: Redirects to the specific detail view (dynamic route).
    navigate(`/inventario/${idtool}`);
  };

  // Lifecycle
  useEffect(() => {
    fetchCatalog();
  }, []);

  // Search Debounce
  // Why: Performance Throttling. Instead of hitting the database every time a single letter is typed,
  // we wait for a 500ms pause in typing. This drastically reduces server load.
  useEffect(() => {
    const delayFn = setTimeout(() => fetchCatalog(searchTerm), 500);
    // Why: Cleanup function cancels the previous timer if the user types again before the 500ms is up.
    return () => clearTimeout(delayFn);
  }, [searchTerm]);

  return (
    <div className="inventory-container">
      <h1 className="page-title">Inventario </h1>

      <div className="actions-bar">
        <input 
          type="text" 
          placeholder="Buscar herramienta..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-btn" onClick={() => setIsTypeModalOpen(true)}>
          <span>+</span> Nuevo Tipo
        </button>
      </div>

      {isLoading ? (
        <div className="loading-text">Cargando catálogo...</div>
      ) : (
        <div className="table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio de Repositorio</th>
                <th>Precio de Renta Diaria</th>
              </tr>
            </thead>
            <tbody>
              {catalog.length > 0 ? (
                catalog.map(item => (
                  <tr key={item.idInformationTool}
                      // Why: Making the row clickable improves UX on touch devices compared to small buttons.
                      onClick={() => handleRowClick(item.idInformationTool)}
                      className="table-row-hover"
                  >
                    <td><strong>{item.nameTool}</strong></td>
                    <td>{item.categoryTool}</td>
                    {/* Why: 'toLocaleString' formats raw numbers (2500) into currency format (2.500) for readability. */}
                    <td className="price-tag">${item.repositionPrice?.toLocaleString()}</td>
                    <td className="price-tag" style={{color:'#28a745'}}>${item.rentPrice?.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="loading-text">No se han encontrado herramientas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <CreateTypeModal 
        isOpen={isTypeModalOpen} 
        onClose={() => setIsTypeModalOpen(false)} 
        onSave={handleSaveType}
        categories={categories}
      />

    </div>
  );
};

export default InventoryPage;