import React from 'react';

const ToolRankingWidget = ({ rankingData }) => {
  // Why: Defensive coding. If the API fails or returns null/undefined instead of an array,
  // this fallback prevents the '.map()' function below from throwing an error and crashing the dashboard.
  const safeRanking = Array.isArray(rankingData) ? rankingData : [];

  if (safeRanking.length === 0) {
      return (
        // Why: Empty states should still occupy layout space to prevent the UI from "jumping" or collapsing 
        // unexpectedly, ensuring the dashboard grid remains stable even without data.
        <div className="card" style={{padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', color: '#888'}}>
            <h3 style={{marginTop: 0, color: '#333', textAlign: 'left'}}>Top Herramientas</h3>
            <p>No hay datos de ranking disponibles.</p>
        </div>
      );
  }

  return (
    <div className="card" style={{padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
      <h3 style={{marginTop: 0, color: '#333'}}>Top Herramientas</h3>
      <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
        {safeRanking.map((item, index) => {
            // ENDPOINT ADAPTATION: Data Normalization Layer.
            // Why: The backend DTO structure might vary (nested object vs flat properties) or change over time.
            // This logic standardizes the input so the UI remains robust regardless of minor API formatting discrepancies.
            
            // Case 1: Backend returns a full entity object nested inside.
            let toolName = item.tool?.nameTool; 
            
            // Case 2: Fallback for flat DTOs or unknown structures to avoid rendering blank text.
            if (!toolName) toolName = item.nameTool || item.toolCode || 'Herramienta Desconocida';

            const count = item.count || item.usageCount || 0;

            return (
              // Why: We use the index as a key here strictly because this is a static read-only list 
              // that won't be reordered or filtered interactively.
              <li key={index} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee'}}>
                <span style={{fontWeight: '500', color: '#555'}}>
                    {/* Why: Adding 'index + 1' visually reinforces the concept of a "Leaderboard" or Ranking (1st, 2nd, 3rd). */}
                    {index + 1}. <span style={{fontWeight:'700', color:'#333'}}>{toolName}</span>
                </span>
                <span style={{fontWeight: 'bold', color: '#007bff'}}>
                    {count} usos
                </span>
              </li>
            );
        })}
      </ul>
    </div>
  );
};

export default ToolRankingWidget;