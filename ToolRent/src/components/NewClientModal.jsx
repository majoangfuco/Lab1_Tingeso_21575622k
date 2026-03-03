import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../pages/ClientsPage.css';
import './NewClientModal.css';

const NewClientModal = ({ isOpen, onClose, onSave, clientData }) => {
  const [formData, setFormData] = useState({
    rut: '',
    clientName: '',
    mail: '',
    phone: ''
  });

  // Why: This effect acts as a reset/initialization mechanism. It determines whether to populate 
  // fields for editing or clear them for a fresh entry whenever the modal opens.
  useEffect(() => {
    if (isOpen) {
      if (clientData) {
        setFormData(clientData);
      } else {
        setFormData({ rut: '', clientName: '', mail: '', phone: '' });
      }
    }
  }, [isOpen, clientData]);

  // Why: Conditional rendering at the top level prevents unnecessary DOM node creation when the modal is hidden.
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // ENDPOINT TRIGGER: Submits the payload to the parent container to handle the actual API request (POST/PUT).
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Why: Dynamic title provides immediate context to the user about whether they are modifying existing data or creating new data. */}
        <h2 className="modal-title">
          {clientData ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>RUT</label>
            <input 
              type="text" 
              placeholder="Ej: 12345678-9"
              // Why: Using logical OR (|| '') ensures the input never becomes 'uncontrolled' (undefined) if the state value is null.
              value={formData.rut || ''} 
              onChange={e => setFormData({...formData, rut: e.target.value})}
              // Why: The RUT is the primary key/unique identifier. Changing it in the backend is complex or forbidden, 
              // so we lock this field during edits to maintain data integrity.
              disabled={!!clientData} 
              style={{ 
                backgroundColor: clientData ? '#e9ecef' : 'white', 
                cursor: clientData ? 'not-allowed' : 'text' 
              }} 
            />
          </div>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input 
              type="text" 
              value={formData.clientName || ''}
              onChange={e => setFormData({...formData, clientName: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              value={formData.mail || ''}
              onChange={e => setFormData({...formData, mail: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input 
              type="text" 
              value={formData.phone || ''}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

NewClientModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  clientData: PropTypes.shape({
    rut: PropTypes.string,
    clientName: PropTypes.string,
    mail: PropTypes.string,
    phone: PropTypes.string,
  }),
};

NewClientModal.defaultProps = {
  clientData: null,
};

export default NewClientModal;