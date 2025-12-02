import React, { useState, useEffect } from 'react';
import InventoryService from '../services/InventoryService';
import '../pages/ClientsPage.css';

const NewRentalModal = ({ isOpen, onClose, onSave, clientName }) => {
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  
  // Why: We separate the "Shopping Cart" state from the "Selection" state (catalog/units)
  // to allow the user to build a multi-item rental transaction locally before submitting.
  const [cart, setCart] = useState([]); 
  
  const [catalog, setCatalog] = useState([]); 
  const [selectedTypeId, setSelectedTypeId] = useState(''); 
  const [availableUnits, setAvailableUnits] = useState([]); 
  const [selectedUnitId, setSelectedUnitId] = useState(''); 
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);

  // Why: Cleanup is crucial here. Every time the modal opens, we must wipe previous selections
  // to prevent data leaking from one client's rental session to another.
  useEffect(() => {
    if(isOpen) {
      setDates({ startDate: '', endDate: '' });
      setCart([]);
      setSelectedTypeId('');
      setSelectedUnitId('');
      setAvailableUnits([]);
      fetchCatalog();
    }
  }, [isOpen]);

  const fetchCatalog = async () => {
    setIsLoadingCatalog(true);
    try {
      // ENDPOINT DATA: Fetches the high-level categories (Drills, Saws) to populate the first dropdown.
      const res = await InventoryService.getAll();
      setCatalog(res.data || []);
    } catch (err) { 
        console.error("Error al cargar catálogo", err);
    } finally {
        setIsLoadingCatalog(false);
    }
  };

  // Why: Cascading Logic. The second dropdown (Units) depends entirely on the first (Type).
  // We reset the Unit selection whenever the Type changes to avoid mismatched data.
  useEffect(() => {
    if (selectedTypeId) {
        loadUnits(selectedTypeId);
    } else {
        setAvailableUnits([]);
        setSelectedUnitId('');
    }
  }, [selectedTypeId]);

  const loadUnits = async (typeId) => {
    setAvailableUnits([]); 
    setSelectedUnitId(''); 
    try {
      // ENDPOINT DATA: Fetches specific physical items based on the selected category.
      const res = await InventoryService.getUnitsByTypeId(typeId);
      // Why: Client-side filtering ensures we only display tools that are physically in the warehouse (status 0).
      const available = (res.data || []).filter(u => u.toolStatus === 0);
      setAvailableUnits(available);
    } catch (err) { console.error(err); }
  };

  const handleAddTool = () => {
    if (!selectedUnitId) return;
    const unitToAdd = availableUnits.find(u => u.toolId === parseInt(selectedUnitId));
    const typeInfo = catalog.find(t => t.idInformationTool === parseInt(selectedTypeId));

    if (!unitToAdd || !typeInfo) return;

    // Why: Business Logic Rule - Prevent adding the exact same physical item twice.
    if (cart.some(item => item.toolId === unitToAdd.toolId)) {
      alert("Ya está en la lista."); return;
    }
    // Why: Business Logic Rule - Restrict rental to one tool per Category/Type (optional strict rule).
    if (cart.some(item => item.typeName === typeInfo.nameTool)) {
      alert(`Ya seleccionaste un "${typeInfo.nameTool}". Solo una por tipo.`); return;
    }

    setCart([...cart, { ...unitToAdd, typeName: typeInfo.nameTool }]);
    setSelectedUnitId('');
  };

  const removeFromCart = (toolId) => setCart(cart.filter(item => item.toolId !== toolId));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) { alert("Selecciona al menos una herramienta."); return; }
    
    // Why: The backend likely expects seconds in the timestamp string (ISO 8601), 
    // but the HTML <input type="datetime-local"> only provides minutes. We append ":00".
    const formatIso = (d) => d && d.length === 16 ? d + ":00" : d;
    
    // ENDPOINT TRIGGER: Consolidates the date range and the list of IDs into a single transaction payload.
    onSave({
      startDate: formatIso(dates.startDate),
      endDate: formatIso(dates.endDate),
      toolIds: cart.map(t => t.toolId)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{marginTop:0, color: '#ffc107'}}>Nuevo Arriendo</h2>
        <p style={{marginBottom: '20px', color: '#666'}}>Cliente: <strong>{clientName}</strong></p>
        <form onSubmit={handleSubmit}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
            <div className="form-group">
              <label>Fecha Inicio</label>
              <input type="datetime-local" required value={dates.startDate} onChange={e => setDates({...dates, startDate: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Fecha Término</label>
              <input type="datetime-local" required value={dates.endDate} onChange={e => setDates({...dates, endDate: e.target.value})} />
            </div>
          </div>
          <hr style={{border:'0', borderTop:'1px solid #eee', margin:'20px 0'}}/>
          
          <div style={{background: '#e3f2fd', padding: '15px', borderRadius: '6px', marginBottom: '15px'}}>
              <div className="form-group">
                <label>1. Tipo de Herramienta</label>
                <select 
                    value={selectedTypeId} 
                    onChange={(e) => setSelectedTypeId(e.target.value)}
                    disabled={isLoadingCatalog}
                >
                    <option value="">-- Selecciona un Tipo --</option>
                    {catalog.map(type => (
                        <option key={type.idInformationTool} value={type.idInformationTool}>
                            {type.nameTool} ({type.categoryTool})
                        </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label>2. Unidad Disponible</label>
                <select 
                    value={selectedUnitId} 
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    // Why: UX enforcement. We disable the second dropdown until the first decision is made.
                    disabled={!selectedTypeId} 
                >
                    <option value="">-- Selecciona Unidad --</option>
                    {availableUnits.length > 0 ? (
                        availableUnits.map(unit => (
                            <option key={unit.toolId} value={unit.toolId}>
                                {unit.toolCode} - Disponible
                            </option>
                        ))
                    ) : (
                        selectedTypeId && <option disabled>Sin unidades disponibles</option>
                    )}
                </select>
              </div>
              <button type="button" className="btn-add-tool" onClick={handleAddTool} disabled={!selectedUnitId}>
                + Agregar al Arriendo
              </button>
          </div>

          <div className="cart-list">
            <strong style={{display:'block', marginBottom:'10px'}}>Resumen ({cart.length})</strong>
            {cart.length === 0 && <div style={{color:'#999', fontSize:'0.9rem'}}>No hay herramientas.</div>}
            {cart.map(item => (
              <div key={item.toolId} className="cart-item">
                <span><strong>{item.typeName}</strong> <small>({item.toolCode})</small></span>
                <button type="button" className="btn-remove-small" onClick={() => removeFromCart(item.toolId)}>✕</button>
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default NewRentalModal;