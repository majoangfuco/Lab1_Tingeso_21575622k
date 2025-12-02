import React, { useState } from 'react';
import RentalService from '../services/RentalService';
import './ReturnRentalModal.css';

const ReturnRentalModal = ({ isOpen, onClose, rentalId, tools, onSuccess }) => {
    const [extraCharge, setExtraCharge] = useState(0);
    
    // Why: We use a key-value map object { toolId: status } instead of an array.
    // This makes looking up and updating specific tool statuses instant (O(1) complexity)
    // and avoids complex array manipulation logic during rendering.
    const [toolStatuses, setToolStatuses] = useState({});
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleStatusChange = (toolId, newStatus) => {
        // Why: React state is immutable. We spread (...prev) the existing checklist 
        // so we don't lose the decisions made for other tools when updating the current one.
        setToolStatuses(prev => ({
            ...prev,
            [toolId]: parseInt(newStatus)
        }));
    };

    const handleSubmit = async () => {
        // Why: This action (closing a rental) is usually irreversible in the database. 
        // A native browser confirmation acts as a "safety valve" against accidental clicks.
        if (!window.confirm("¿Confirmar devolución y cerrar arriendo?")) return;

        setLoading(true);
        try {
            const payload = {
                extraCharge: parseInt(extraCharge) || 0,
                // ENDPOINT DATA: The backend likely expects a map or list of checks 
                // to audit the condition of every single item returning to the warehouse.
                toolStatuses: toolStatuses
            };

            // ENDPOINT TRIGGER: The final handshake. We send the money info and the tool conditions 
            // to the server to calculate the final invoice and unlock the inventory.
            await RentalService.returnRental(rentalId, payload);
            alert("¡Arriendo devuelto exitosamente!");
            
            // Why: Critical Step. The modal is a child component. Once it finishes, 
            // it MUST tell the parent ("ClientsPage" or "RentalsPage") to refresh the main list.
            // Otherwise, the user would still see this rental as "Active" in the background.
            onSuccess(); 
            onClose();   
        } catch (error) {
            console.error(error);
            alert("Hubo un error al procesar la devolución.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                
                <div className="modal-header">
                    <h2 className="modal-title">Devolver Arriendo #{rentalId}</h2>
                </div>

                <div className="tools-list-container">
                    <p style={{fontSize:'0.85rem', color:'#666', marginBottom:'10px'}}>
                        Confirma el estado de cada herramienta:
                    </p>
                    {tools.map(tool => (
                        <div key={tool.toolId} className="tool-item-row">
                            <div className="tool-info">
                                {/* Why: Safe navigation (?.) guards against rendering crashes if the joined tool data is incomplete. */}
                                <h4>{tool.informationTool?.nameTool}</h4>
                                <span>ID: {tool.toolId}</span>
                            </div>
                            <select
                                className="status-select"
                                // Why: Default to '0' (Good) if no decision has been made yet.
                                // This assumes the "Happy Path" (most tools return fine), saving user clicks.
                                value={toolStatuses[tool.toolId] !== undefined ? toolStatuses[tool.toolId] : 0}
                                onChange={(e) => handleStatusChange(tool.toolId, e.target.value)}
                            >
                                <option value="0">✅ Buen Estado</option>
                                <option value="3">❌ Dañada / Perdida</option>
                                <option value="2">🔧 A Mantención</option>
                            </select>
                        </div>
                    ))}
                </div>

                <div className="extra-charge-group">
                    <label>Multas / Cargos Extra ($)</label>
                    <input
                        type="number"
                        className="input-money"
                        placeholder="Ej: 5000"
                        value={extraCharge}
                        onChange={(e) => setExtraCharge(e.target.value)}
                        min="0"
                    />
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose} disabled={loading}>
                        Cancelar
                    </button>
                    {/* Why: We disable the submit button while loading to prevent "Double Submission" 
                        (charging the customer twice because they clicked impatiently). */}
                    <button className="btn-confirm" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Procesando...' : 'Confirmar Devolución'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ReturnRentalModal;