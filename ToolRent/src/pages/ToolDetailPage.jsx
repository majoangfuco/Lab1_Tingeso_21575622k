import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/http-common';
import PageLayout from '../components/PageLayout';
import { tutorialContent } from '../tutorials/tutorialContent';
import './InventoryPage.css'; 

const ToolDetailPage = () => {
  // Why: We need the ID from the URL to know which Tool Type (e.g., "Drill") we are viewing.
  const { idtool } = useParams();
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [infoTool, setInfoTool] = useState(null);
  const [units, setUnits] = useState([]);
  
  // Why: We store statistics separately to allow the backend to perform complex calculations (Count/Sum)
  // rather than trying to calculate "Available Units" inside the React client, which is error-prone.
  const [stats, setStats] = useState({ totalUnits: 0, availableUnits: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // General Info Editing State
  // Why: Boolean toggle allows switching the Header view between "Read Mode" and "Edit Mode".
  const [isEditing, setIsEditing] = useState(false); 
  const [editForm, setEditForm] = useState({});      

  // Unit Management State
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [newTool, setNewTool] = useState({ toolCode: '', toolStatus: 0 });
  
  // Why: Client-side filtering allows users to quickly sift through units without re-fetching from the server.
  const [filterStatus, setFilterStatus] = useState('all'); 

  // Unit Editing State (Inline Editing)
  const [editingUnitId, setEditingUnitId] = useState(null); 
  const [tempStatus, setTempStatus] = useState(null);
  const [isEditingSaving, setIsEditingSaving] = useState(false);       

  // --- DATA FETCHING ---
  useEffect(() => {
    fetchData();
  }, [idtool]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // ENDPOINT DATA: 1. Fetch General Metadata (Name, Price, Category)
      const infoResponse = await apiClient.get(`/toolrent/information-tool/${idtool}`);
      setInfoTool(infoResponse.data);
      
      // Why: We initialize the form buffer with the fetched data so the user edits existing values, not blanks.
      setEditForm(infoResponse.data);

      // ENDPOINT DATA: 2. Fetch Physical Inventory List (The specific items in the warehouse)
      const unitsResponse = await apiClient.get(`/toolrent/tool/${idtool}`);
      setUnits(unitsResponse.data || []);

      // ENDPOINT DATA: 3. Fetch Real-time Statistics
      // Why: Separating this call allows the backend to optimize the SQL COUNT(*) query 
      // instead of the frontend iterating through thousands of array items.
      const statsResponse = await apiClient.get(`/toolrent/tool/stats/${idtool}`);
      if (statsResponse.data) {
          setStats(statsResponse.data);
      }

    } catch (error) {
      console.error("Error loading details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS ---

  const handleEditChange = (e) => {
    // Why: Standard React pattern for controlled inputs using computed property names.
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const startEditing = () => {
    setEditForm(infoTool);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    // Why: Reset the form buffer to original values if the user cancels, discarding unsaved changes.
    setEditForm(infoTool);
  };

  const handleSaveChanges = async () => {
    try {
      setIsEditingSaving(true);
      // ENDPOINT TRIGGER: PUT request to update the general definition of the tool.
      const response = await apiClient.put('/toolrent/information-tool', editForm);
      setInfoTool(response.data); 
      setIsEditing(false);        
      alert("¡Información actualizada correctamente!");
    } catch (error) {
      console.error("Error updating:", error);
      alert("Error al guardar los cambios. Verifica que tengas permisos de Administrador.");
    } finally {
      setIsEditingSaving(false);
    }
  };

  // --- UNIT EDITING LOGIC ---
  const startEditingUnit = (unit) => {
    // Why: We track the specific ID being edited to render an <input> only for that row.
    setEditingUnitId(unit.toolId);
    setTempStatus(unit.toolStatus);
  };

  const cancelEditingUnit = () => {
    setEditingUnitId(null);
    setTempStatus(null);
  };

  const saveUnitStatus = async (unitId) => {
    try {
      setIsEditingSaving(true);
      // ENDPOINT TRIGGER: PUT request to update the status of a specific physical item.
      await apiClient.put(`/toolrent/tool/${unitId}`, { 
        toolId: unitId, 
        toolStatus: parseInt(tempStatus) 
      });
      
      // Why: Critical Refresh. Changing a unit's status (e.g., from 'Available' to 'Broken') 
      // affects the global statistics. We must re-fetch data to update the counters at the top of the page.
      fetchData(); 
      
      setEditingUnitId(null);
      alert("Estado actualizado exitosamente.");

    } catch (error) {
      console.error("Error updating status:", error);
      
      // Why: Granular Error Handling. We specifically check for 403 (Forbidden) to inform the user
      // about missing privileges rather than showing a generic error.
      if (error.response && error.response.status === 403) {
        const serverMessage = error.response.data?.error;
        alert(`⛔ ACCESO DENEGADO\n\n${serverMessage || "Solo un Administrador puede realizar esta acción."}`);
      } else {
        alert("Ocurrió un error al intentar actualizar el estado.");
      }
      cancelEditingUnit();
    } finally {
      setIsEditingSaving(false);
    }
  };

  // --- UNIT CREATION LOGIC ---
  const handleSaveUnit = async (e) => {
    e.preventDefault();
    try {
      // ENDPOINT TRIGGER: POST request to add a new physical item to the inventory.
      await apiClient.post(`/toolrent/tool/${idtool}`, newTool);
      setIsUnitModalOpen(false);
      setNewTool({ toolCode: '', toolStatus: 0 });
      
      // Why: We re-fetch to immediately show the new item in the list and increment the "Total Units" counter.
      fetchData();
      
      alert("¡Unidad agregada!");
    } catch (error) {
      console.error(error);
      alert("Error al agregar unidad. Revisa que no hayas ingresado un código duplicado.");
    }
  };

  // Why: Filters are applied in memory (Client-Side) because the dataset for a single tool type 
  // is usually small enough (hundreds) that a server query isn't necessary for filtering.
  const filteredUnits = units.filter(unit => {
    if (filterStatus === 'all') return true;
    return unit.toolStatus.toString() === filterStatus;
  });

  const getStatusLabel = (status) => {
    // Why: Visual mapping for status codes to ensure consistent UI representation (colors/text) across the app.
    switch(status) {
      case 0: return { text: 'Disponible', color: '#e6f4ea', textColor: 'green' };
      case 1: return { text: 'Prestado', color: '#fff3cd', textColor: '#856404' };
      case 2: return { text: 'En Reparación', color: '#fce8e6', textColor: '#c7372c' };
      case 3: return { text: 'Dada de Baja', color: '#e2e3e5', textColor: '#383d41' };
      default: return { text: 'Desconocido', color: '#fff', textColor: '#000' };
    }
  };

  if (isLoading) return <div className="loading-text">Cargando detalles...</div>;
  if (!infoTool) return <div className="no-data">Herramienta no encontrada.</div>;

  const inputStyle = {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginTop: '5px'
  };

  return (
    <PageLayout tutorialData={tutorialContent.toolDetail}>
      <div className="inventory-container">
      
      <div className="actions-bar" style={{ justifyContent: 'flex-start', gap: '20px' }}>
        <button className="btn-secondary" onClick={() => navigate('/inventario')}>
          ← Volver 
        </button>
        <h1 style={{ margin: 0 }}>
          {isEditing ? 'Editando Herramienta' : infoTool.nameTool}
        </h1>
      </div>

      {/* --- INFO & STATISTICS CARD --- */}
      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
          <h2 style={{ margin: 0, color: '#C7372C' }}>Detalles y Precios</h2>
          
          {/* Why: Conditional rendering allows toggling between "View Mode" and "Edit Mode" buttons. */}
          {!isEditing ? (
             <button onClick={startEditing} className="btn-outline-primary">
               <span>✎</span> Editar Info
             </button>
          ) : (
            <div style={{display:'flex', gap:'10px'}}>
              <button onClick={cancelEditing} className="btn-cancel">Cancelar</button>
              <button onClick={handleSaveChanges} className="btn-save" disabled={isEditingSaving}>
                {isEditingSaving ? 'Cargando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          
          {/* Editable Fields */}
          <div><strong>Nombre Herramienta:</strong> <br />
            {isEditing ? <input type="text" name="nameTool" value={editForm.nameTool || ''} onChange={handleEditChange} style={inputStyle} /> : <span>{infoTool.nameTool}</span>}
          </div>
          <div><strong>Categoría:</strong> <br />
            {isEditing ? <input type="text" name="categoryTool" value={editForm.categoryTool || ''} onChange={handleEditChange} style={inputStyle} /> : <span>{infoTool.categoryTool}</span>}
          </div>
          <div><strong>Precio Reposición ($):</strong> <br />
            {isEditing ? <input type="number" name="repositionPrice" value={editForm.repositionPrice || 0} onChange={handleEditChange} style={inputStyle} /> : <span>${infoTool.repositionPrice}</span>}
          </div>
          <div><strong>Valor Arriendo Diario ($):</strong> <br />
            {isEditing ? <input type="number" name="rentPrice" value={editForm.rentPrice || 0} onChange={handleEditChange} style={inputStyle} /> : <span>${infoTool.rentPrice || 0}</span>}
          </div>
          <div><strong>Valor Multa Diaria ($):</strong> <br />
            {isEditing ? <input type="number" name="duePrice" value={editForm.duePrice || 0} onChange={handleEditChange} style={inputStyle} /> : <span>${infoTool.duePrice || 0}</span>}
          </div>

          {/* --- BACKEND STATISTICS --- */}
          {/* Why: We reduce opacity during editing to signal that these fields are calculated and cannot be manually changed. */}
          <div style={{opacity: isEditing ? 0.5 : 1}}>
            <strong>Total Unidades Físicas:</strong> <br /> 
            <span style={{fontSize:'1.2rem', fontWeight:'bold'}}>{stats.totalUnits}</span>
          </div>
          <div style={{opacity: isEditing ? 0.5 : 1}}>
            <strong>Disponibles para Arriendo:</strong> <br /> 
            {/* Why: Color coding provides immediate visual feedback on stock health (Green = Good, Red = Out of Stock). */}
            <span style={{
                fontSize:'1.2rem', 
                fontWeight:'bold', 
                color: stats.availableUnits > 0 ? '#28a745' : '#dc3545'
            }}>
                {stats.availableUnits}
            </span>
          </div>

        </div>
      </div>

      {/* --- BOTTOM SECTION (FILTERS & TABLE) --- */}
      <div className="actions-bar">
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <h2 style={{ margin: 0 }}>Unidades Físicas (Inventario)</h2>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los Estados</option>
            <option value="0">Disponibles</option>
            <option value="1">Prestados</option>
            <option value="2">En Reparación</option>
            <option value="3">De Baja</option>
          </select>
        </div>

        <button className="add-btn" onClick={() => setIsUnitModalOpen(true)}>
          + Agregar Unidad
        </button>
      </div>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>Código (Etiqueta)</th>
            <th style={{width: '220px'}}>Estado</th>
            <th style={{width: '120px', textAlign: 'center'}}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredUnits.length > 0 ? (
            filteredUnits.map((unit) => {
              const statusInfo = getStatusLabel(unit.toolStatus);
              const isRowEditing = editingUnitId === unit.toolId;

              return (
                <tr key={unit.toolId}>
                  <td><strong>{unit.toolCode}</strong></td>
                  <td>
                    {/* Why: Inline editing logic. If this specific row matches the editing ID, 
                        we render a select dropdown; otherwise, we render a static status badge. */}
                    {isRowEditing ? (
                      <select 
                        value={tempStatus} 
                        onChange={(e) => setTempStatus(e.target.value)}
                        style={{padding: '6px', borderRadius: '4px', border: '1px solid #007bff', width: '100%'}}
                        autoFocus
                      >
                        <option value="0">Disponible</option>
                        <option value="1">Prestado</option>
                        <option value="2">En Reparación</option>
                        <option value="3">De Baja</option>
                      </select>
                    ) : (
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold',
                        backgroundColor: statusInfo.color,
                        color: statusInfo.textColor
                      }}>
                        {statusInfo.text}
                      </span>
                    )}
                  </td>
                  <td style={{textAlign: 'center'}}>
                    {isRowEditing ? (
                      <div style={{display:'flex', justifyContent:'center', gap:'8px'}}>
                        <button onClick={() => saveUnitStatus(unit.toolId)} className="btn-table-save">✓</button>
                        <button onClick={cancelEditingUnit} className="btn-table-cancel">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => startEditingUnit(unit)} className="btn-table-edit">✎</button>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                No hay unidades registradas con este filtro.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add Unit Modal */}
      {isUnitModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsUnitModalOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsUnitModalOpen(false);
            }
          }}
        >
          <dialog 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            open
            aria-labelledby="add-unit-title"
          >
            <h2 id="add-unit-title" style={{color:'#007bff', marginTop:0, textAlign:'center'}}>Agregar Unidad</h2>
            <p style={{textAlign:'center', color:'#666'}}>
              Añadiendo a: <strong>{infoTool.nameTool}</strong>
            </p>
            
            <form onSubmit={handleSaveUnit}>
              <div className="form-group">
                <label>Código Único</label>
                <input 
                  type="text" 
                  placeholder="Ej: TAL-001" 
                  value={newTool.toolCode}
                  onChange={e => setNewTool({...newTool, toolCode: e.target.value})}
                  required 
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Estado Inicial</label>
                <select 
                  value={newTool.toolStatus}
                  onChange={e => setNewTool({...newTool, toolStatus: parseInt(e.target.value)})}
                  required
                  style={{
                    width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px',
                    fontSize: '1rem', backgroundColor: 'white'
                  }}
                >
                   <option value="0">Disponible</option>
                   <option value="1">Prestado</option>
                   <option value="2">En Reparación</option>
                   <option value="3">De Baja</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsUnitModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-save">Guardar</button>
              </div>
            </form>
          </dialog>
        </div>
      )}
      </div>
    </PageLayout>
  );
};

export default ToolDetailPage;