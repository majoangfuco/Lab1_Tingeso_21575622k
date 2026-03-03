import React, { useState } from 'react';
import PropTypes from 'prop-types';

const KardexFilters = ({ onFilter, tools = [] }) => {
  // Why: We use local state to buffer user inputs. This prevents triggering a heavy database query 
  // on every single keystroke or selection change. The query only executes when the user explicitly clicks "Apply".
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedToolId, setSelectedToolId] = useState(''); 

  const handleFilter = () => {
    // Why: Basic client-side validation serves as a gatekeeper. It prevents sending incomplete 
    // requests to the backend, saving server resources and avoiding 400 Bad Request errors.
    if (!startDate || !endDate) {
        alert("Por favor selecciona un rango de fechas.");
        return;
    }

    // ENDPOINT TRIGGER: This callback acts as the bridge. It packages the filter criteria
    // and sends it to the parent component, which will construct the API request (e.g., GET /kardex?from=X&to=Y).
    onFilter({
      startDate,
      endDate,
      toolId: selectedToolId 
    });
  };

  // Why: Defensive coding. If the 'tools' prop arrives as null or undefined (e.g., due to an API lag/error),
  // this check ensures the app doesn't crash when trying to run .map() later.
  const toolsList = Array.isArray(tools) ? tools : [];

  return (
    <div className="card" style={{padding: '20px', marginBottom: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eee'}}>
      <h3 style={{marginTop: 0, color: '#333', marginBottom:'15px'}}>Filtrar Movimientos</h3>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end'}}>
        
        <div className="form-group">
            <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem', fontWeight:'600', color:'#555'}}>Desde:</label>
            <input 
                type="datetime-local" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px'}}
            />
        </div>

        <div className="form-group">
            <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem', fontWeight:'600', color:'#555'}}>Hasta:</label>
            <input 
                type="datetime-local" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px'}}
            />
        </div>

        <div className="form-group">
            <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem', fontWeight:'600', color:'#555'}}>Tipo de Herramienta:</label>
            <select 
                value={selectedToolId}
                onChange={(e) => setSelectedToolId(e.target.value)}
                style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: 'white'}}
            >
                <option value="">Todas las herramientas</option>
                
                {toolsList.map((type) => (
                    // Why: We bind the value to 'idInformationTool' (Type ID) rather than a specific item ID,
                    // allowing the backend to filter generally by category (e.g., "Show me all drill usage").
                    <option key={type.idInformationTool} value={type.idInformationTool}>
                        {type.nameTool}
                    </option>
                ))}
            </select>
        </div>

        <div>
            <button 
                onClick={handleFilter}
                style={{
                    backgroundColor: '#007bff', color: 'white', border: 'none', 
                    padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', width: '100%',
                    fontWeight: 'bold', fontSize: '0.95rem'
                }}
            >
                Aplicar Filtros
            </button>
        </div>

      </div>
    </div>
  );
};

KardexFilters.propTypes = {
  onFilter: PropTypes.func.isRequired,
  tools: PropTypes.arrayOf(
    PropTypes.shape({
      idInformationTool: PropTypes.number.isRequired,
      nameTool: PropTypes.string.isRequired,
    })
  ),
};

KardexFilters.defaultProps = {
  tools: [],
};

export default KardexFilters;