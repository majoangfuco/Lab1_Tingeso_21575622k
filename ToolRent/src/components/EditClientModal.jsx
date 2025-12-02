import React, { useState, useEffect } from 'react';

const EditClientModal = ({ isOpen, onClose, clientData, onSave }) => {
  // Why: We create a local copy of data to allow editing without mutating the parent state directly before saving.
  const [formData, setFormData] = useState(clientData || {});

  // Why: Ensures the form inputs sync up if the parent component updates the 'clientData' prop asynchronously.
  useEffect(() => { if(clientData) setFormData(clientData); }, [clientData]);

  // Why: Returning null prevents the DOM from being cluttered with hidden elements when the modal is inactive.
  if(!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Cliente</h2>
        {/* ENDPOINT TRIGGER: The form submission passes the prepared payload back to the parent to execute the API update. */}
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
           <div className="form-group">
             <label>Nombre</label>
             {/* Why: Spreading (...formData) preserves the integrity of other fields while updating only the specific target. */}
             <input value={formData.clientName} onChange={e=>setFormData({...formData, clientName:e.target.value})} required />
           </div>
           <div className="form-group"><label>Email</label><input value={formData.mail} onChange={e=>setFormData({...formData, mail:e.target.value})} required /></div>
           <div className="form-group"><label>Teléfono</label><input value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} /></div>
           <div className="modal-actions">
             <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
             <button type="submit" className="btn-save">Guardar</button>
           </div>
        </form>
      </div>
    </div>
  )
};


export default EditClientModal;