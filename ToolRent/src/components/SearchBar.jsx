import React from 'react';
import PropTypes from 'prop-types';
import '../pages/ClientsPage.css';

// Why: This component is designed to be "stateless" (dumb). It doesn't decide what to do with the text; 
// it simply holds the input field and reports keystrokes back to the parent component via props.
const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <input 
      type="text" 
      placeholder="Buscar por RUT o nombre..." 
      className="search-input"
      // Why: Controlled Component Pattern. The input text is locked to the React state variable.
      // This ensures that what the user sees on screen is exactly what the code is processing in memory (Single Source of Truth).
      value={searchTerm}
      // ENDPOINT TRIGGER: This is the ignition key. Every single keystroke fires this event, 
      // updating the parent state immediately. This allows for "Real-Time Filtering" (the list shrinks as you type) 
      // rather than waiting for the user to press a "Search" button.
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
};

SearchBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired
};

export default SearchBar;