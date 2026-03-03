import React from 'react';
import PropTypes from 'prop-types';
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

AddClientButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default AddClientButton;