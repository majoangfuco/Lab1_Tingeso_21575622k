import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const RentalHistoryTable = ({ rentals }) => {
  const navigate = useNavigate();

  // Why: Decouples the database integer values (0, 1, 2) from the visual presentation.
  // This Centralized Configuration pattern allows us to change labels or colors easily 
  // without hunting down every specific 'if/else' inside the render logic.
  const getStatusConfig = (status) => {
      switch(status) {
          case 0: return { label: 'ACTIVO', css: 'status-active' };
          case 1: return { label: 'ATRASADO', css: 'status-overdue' };
          case 2: return { label: 'DEVUELTO', css: 'status-returned' };
          default: return { label: 'DESC.', css: 'status-active' };
      }
  };

  return (
    <div className="table-container">
      <table className="rental-table">
        <thead>
          <tr>
            {/* Why: Explicit percentage widths prevent layout shifts (columns jumping around) 
                when the data loads or when window size changes. */}
            <th style={{width: '30%'}}>Fecha Inicio</th>
            <th style={{width: '30%'}}>Fecha Término</th>
            <th style={{width: '40%'}}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {/* Why: We must handle the empty state explicitly. Rendering nothing would confuse the user; 
              rendering an empty table header looks broken. */}
          {rentals && rentals.length > 0 ? (
            rentals.map((rental) => {
               const { label, css } = getStatusConfig(rental.rentalStatus);
               return (
                <tr 
                  key={rental.rentalId} 
                  // ENDPOINT FLOW: Navigates to the detailed view of a specific transaction.
                  // Why: Making the entire row clickable improves UX on mobile devices (larger touch target) 
                  // compared to forcing the user to find a small "View Details" button.
                  onClick={() => navigate(`/rental/${rental.rentalId}`)}
                  className="rental-row"
                >
                  <td>{new Date(rental.rentalDate).toLocaleDateString()}</td>
                  
                  {/* Why: Visual Alarm. We apply inline styling to highlight overdue dates immediately in red, 
                      drawing the user's attention to potential issues (business priority). */}
                  <td style={{ color: rental.rentalStatus === 1 ? '#d32f2f' : 'inherit' }}>
                      {new Date(rental.returnDate).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`table-badge ${css}`}>
                      {label}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            /* Why: Usage of colSpan="3" preserves the table grid structure even when empty, 
               ensuring borders and layout remain consistent with the rest of the UI. */
            <tr>
              <td colSpan="3" className="empty-state-cell">
                <div className="empty-state-content">
                    <span>No hay historial disponible</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

RentalHistoryTable.propTypes = {
  rentals: PropTypes.arrayOf(
    PropTypes.shape({
      rentalId: PropTypes.number.isRequired,
      rentalStatus: PropTypes.number.isRequired,
      rentalDate: PropTypes.string.isRequired,
      returnDate: PropTypes.string.isRequired
    })
  ).isRequired
};

export default RentalHistoryTable;