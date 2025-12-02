import React, { useState, useEffect } from 'react';
import '../pages/ClientsPage.css';

// Why: Defining styles in JS objects keeps the modal self-contained and avoids external CSS conflicts, 
// ensuring consistent rendering regardless of the parent's stylesheet.
const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  title: {
    marginTop: 0,
    color: '#007bff',
    textAlign: 'center'
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box', 
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  btnCancel: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  btnSave: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};

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
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        {/* Why: Dynamic title provides immediate context to the user about whether they are modifying existing data or creating new data. */}
        <h2 style={styles.title}>
          {clientData ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>RUT</label>
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
                ...styles.input, 
                backgroundColor: clientData ? '#e9ecef' : 'white', 
                cursor: clientData ? 'not-allowed' : 'text' 
              }} 
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre Completo</label>
            <input 
              type="text" 
              value={formData.clientName || ''}
              onChange={e => setFormData({...formData, clientName: e.target.value})}
              required 
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input 
              type="email" 
              value={formData.mail || ''}
              onChange={e => setFormData({...formData, mail: e.target.value})}
              required 
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Teléfono</label>
            <input 
              type="text" 
              value={formData.phone || ''}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.modalActions}>
            <button type="button" style={styles.btnCancel} onClick={onClose}>Cancelar</button>
            <button type="submit" style={styles.btnSave}>Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClientModal;