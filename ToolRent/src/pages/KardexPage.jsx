import React, { useState, useEffect } from 'react';
import ToolService from '../services/ToolService';
import KardexService from '../services/KardexService'; 
import ToolRankingWidget from '../components/ToolRankingWidget'; 
import KardexFilters from '../components/KardexFilters';
import InformationToolService from '../services/InformationToolService';

const tableStyles = { width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: 'white' };
const thStyles = { background: '#f8f9fa', padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' };
const tdStyles = { padding: '12px', borderBottom: '1px solid #eee' };

const KardexPage = () => {
  // Why: Centralized state for the two main data visualizations (Table + Ranking Widget).
  // Keeping them here ensures both views always reflect the same time period.
  const [kardexData, setKardexData] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
      setLoading(true);
      try {
        // ENDPOINT DATA: Fetches the list of tool types to populate the filter dropdown.
        const typesRes = await InformationToolService.getAll();
        setTools(Array.isArray(typesRes) ? typesRes : []);

        // Why: Business Logic. The default view is "Month-to-Date" (from the 1st to today).
        // This provides immediate value to the user without forcing them to manually select dates every time.
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        const startOfMonth = `${year}-${month}-01T00:00`;
        const endOfToday = `${year}-${month}-${day}T23:59`;

        // Why: Performance Optimization. We use Promise.all to fetch the Table Data and the Ranking Data 
        // in parallel (concurrently) rather than waiting for one to finish before starting the other.
        const [kardexRes, rankingRes] = await Promise.all([
            KardexService.searchKardex(startOfMonth, endOfToday, null),
            KardexService.getToolRanking(startOfMonth, endOfToday)
        ]);

        setKardexData(kardexRes || []);
        setRanking(rankingRes || []);

      } catch (error) {
        console.error("Error loading initial data:", error);
        setTools([]); 
      } finally {
        setLoading(false);
      }
    };

  // ENDPOINT TRIGGER: Updates the dashboard view based on user criteria.
  const handleFilter = async (filters) => {
    if (!filters.startDate || !filters.endDate) {
        alert("Por favor selecciona ambas fechas.");
        return;
    }

    setLoading(true);
    try {
      // Why: Logic Delegation. The component passes raw filter inputs to the Service layer.
      // The Service is responsible for URL construction and parameter formatting, keeping the View clean.
      const res = await KardexService.searchKardex(filters.startDate, filters.endDate, filters.toolId); 
      setKardexData(res || []);
      
      // Why: Synchronization. When the table updates, the ranking widget must also update 
      // to reflect the statistics of the newly selected time range.
      const rankRes = await KardexService.getToolRanking(filters.startDate, filters.endDate);
      setRanking(rankRes || []);

    } catch (error) {
      console.error("Error filtering:", error);
      alert("Error al filtrar datos.");
    } finally {
      setLoading(false);
    }
  };

  const getMovementLabel = (type) => {
      // Why: Visual Mapping. Converts abstract database integers (0, 1, 2...) into human-readable, 
      // color-coded status tags for the UI.
      const map = {
          0: { label: 'Registro Inicial', color: '#cf8de9ff' }, 
          1: { label: 'Devolución', color: '#28a745' },      
          2: { label: 'Baja (Eliminada)', color: '#dc3545' }, 
          3: { label: 'En Mantención', color: '#ffc107' },    
          4: { label: 'Préstamo', color: '#007bff' }          
      };
      
      const status = map[type] || { label: 'Desconocido', color: '#6c757d' };
      
      return (
          <span style={{
              backgroundColor: status.color, 
              color: 'white', 
              padding: '4px 10px', 
              borderRadius: '12px', 
              fontSize: '0.75rem', 
              fontWeight: 'bold',
              textTransform: 'uppercase'
          }}>
              {status.label}
          </span>
      );
  };

  return (
    <div style={{padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Segoe UI, sans-serif', background:'#f4f6f8', minHeight:'100vh'}}>
      <h1 style={{marginBottom: '30px', color: '#333', fontWeight:'800'}}>Kardex & Reportes</h1>
      
      {/* Why: Asymmetric Grid Layout (1fr 350px) gives priority to the detailed table (Left) 
          while keeping the summary widget fixed and visible on the side (Right). */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 350px', gap: '25px', alignItems: 'start'}}>
        
        {/* --- LEFT COLUMN: Filters & Table --- */}
        <div>
          <KardexFilters onFilter={handleFilter} tools={tools} />

          <div className="card" style={{padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #eee'}}>
            <h3 style={{marginTop: 0, marginBottom: '20px', color: '#444'}}>Movimientos Registrados</h3>
            
            {loading ? (
                <p style={{textAlign: 'center', color: '#888'}}>Cargando...</p>
            ) : (
                <div style={{overflowX: 'auto'}}>
                    <table style={tableStyles}>
                    <thead>
                        <tr>
                        <th style={thStyles}>Fecha</th>
                        <th style={thStyles}>Tipo Movimiento</th>
                        <th style={thStyles}>Herramienta</th>
                        <th style={thStyles}>Responsable</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kardexData.length > 0 ? (
                            kardexData.map(k => (
                                <tr key={k.kardexId} style={{transition: 'background 0.2s'}}>
                                    
                                    <td style={tdStyles}>
                                        {new Date(k.kardexDate).toLocaleString()}
                                    </td>
                                    
                                    <td style={tdStyles}>
                                        {getMovementLabel(k.kardexType)}
                                    </td>
                                    
                                    <td style={{...tdStyles, fontWeight:'600'}}>
                                        <div style={{fontSize:'0.95rem', color:'#333'}}>
                                            {/* Why: Safe Navigation Operator (?.) ensures the app doesn't crash 
                                                if the backend sends a movement record with missing tool details. */}
                                            {k.tool?.informationTool?.nameTool || 'Herramienta desconocida'}
                                        </div>
                                        <div style={{fontSize:'0.75rem', color:'#888', marginTop:'2px', fontFamily:'monospace'}}>
                                            Cód: {k.tool?.toolCode || `TAL-${k.tool?.toolId}`}
                                        </div>
                                    </td>
                                    
                                    <td style={tdStyles}>{k.createdByUserId}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{padding:'40px', textAlign:'center', color:'#999'}}>
                                    Sin resultados para este filtro.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    </table>
                </div>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: Widget --- */}
        <div>
          <ToolRankingWidget rankingData={ranking} />
        </div>

      </div>
    </div>
  );
};

export default KardexPage;