import React from 'react';
import '../pages/ClientsPage.css';

const AddClientButton = ({ onClick }) => {
  return (
    // ENDPOINT START: Triggers the "Add Client" flow.
    // Why: Logic is delegated to the parent to keep this component stateless.
    <button className="add-btn" onClick={onClick}>
      <span>+</span> Nuevo Cliente
    </button>
  );
};

export default AddClientButton;