import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RentalService from '../services/RentalService';
import KardexService from '../services/KardexService';
import ReturnRentalModal from '../components/ReturnRentalModal';
import PageLayout from '../components/PageLayout';
import { tutorialContent } from '../tutorials/tutorialContent';
import './RentalDetailPage.css'; 

const RentalDetailPage = () => {
    // Why: We capture the ID from the URL (e.g., /rental/15) to know which specific transaction to load.
    const { id } = useParams();
    const navigate = useNavigate();

    const [rental, setRental] = useState(null);
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

    const handleReturnSuccess = () => {
        // ENDPOINT REFRESH: Hard reload ensures the application state is perfectly synced 
        // with the backend after a complex transaction (Returning items + Financial Calculation + Stock Update).
        window.location.reload(); 
    };
    

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // ENDPOINT DATA: Performance Optimization. 
                // Why: We use Promise.all to fetch the Header (Rental Info) and the Details (Tools List) 
                // concurrently (in parallel), reducing the total wait time for the user.
                const [rentalRes, toolsRes] = await Promise.all([
                    RentalService.getById(id),
                    KardexService.getToolsByRentalId(id)
                ]);

                // Why: Fallback for different API response structures (sometimes it's data.data, sometimes just data).
                const rentalData = rentalRes.data ? rentalRes.data : rentalRes;
                setRental(rentalData);

                // Why: Defensive Coding. The API response structure might vary (direct array vs wrapped object).
                // This logic normalizes it to ensure 'finalTools' is always a valid array, preventing render crashes.
                let finalTools = [];
                if (Array.isArray(toolsRes)) finalTools = toolsRes;
                else if (toolsRes && Array.isArray(toolsRes.data)) finalTools = toolsRes.data;
                
                setTools(finalTools);
                
                // VALIDATION: Show alert if rental has already been returned
                if (rentalData && rentalData.rentalStatus === 2) {
                  alert("Este arriendo ya fue devuelto. La informacion mostrada es historica.");
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    if (loading) return <div className="p-10 text-center text-gray-500">Cargando...</div>;
    if (!rental) return <div className="p-10 text-center">Arriendo no encontrado.</div>;

    const getStatusInfo = (status) => {
        // Why: Visual Logic Separation. Maps database integer codes (0, 1, 2) to UI styles.
        // Centralizing this here makes it easy to update colors or labels without hunting through HTML.
        switch(status) {
            case 0: return { label: 'ACTIVO', css: 'pill-active' };
            case 1: return { label: 'ATRASADO', css: 'pill-overdue' };
            case 2: return { label: 'DEVUELTO', css: 'pill-returned' };
            default: return { label: 'DESC.', css: 'pill-active' };
        }
    };
    const statusInfo = getStatusInfo(rental.rentalStatus);

    return (
        <PageLayout tutorialData={tutorialContent.rentalDetail}>
            <div className="details-container">
            
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Arriendo #{rental.rentalId}</h1>
                <button className="btn-back" onClick={() => navigate(-1)}>
                    ← Volver
                </button>
            </div>

            {/* Info Card */}
            <div className="rental-card">
                <div className="card-header-row">
                    <h2 className="card-title">Información General</h2>
                    <span className={`status-pill ${statusInfo.css}`}>
                        {statusInfo.label}
                    </span>
                </div>
                
                <div className="info-grid">
                    <div className="info-group">
                        <span className="label-text">Cliente</span>
                        <span className="value-text text-highlight">
                            {/* Why: Safe Navigation (?.) prevents crashes if the 'client' object is missing from the response. */}
                            {rental.client?.clientName}
                        </span>
                    </div>

                    <div className="info-group">
                        <span className="label-text">Costo de arriendo</span>
                        <span className="value-text text-price">
                           ${rental.amountDue || 0}
                        </span>
                    </div>

                    <div className="info-group">
                        <span className="label-text">Rentador</span>
                        <span className="value-text">
                            {rental.createdByUserId || 'N/A'}
                        </span>
                    </div>

                    <div className="info-group"></div> {/* Spacer for grid alignment */}

                    <div className="info-group">
                        <span className="label-text">Fecha Inicio</span>
                        <span className="value-text">
                            {new Date(rental.rentalDate).toLocaleString()}
                        </span>
                    </div>

                    <div className="info-group">
                        <span className="label-text">Fecha Término</span>
                        {/* Why: Visual Alert. If the status implies 'Late' (1), we color the text red 
                            to draw attention to the deadline violation. */}
                        <span className={`value-text ${rental.rentalStatus === 1 ? 'text-red-600' : ''}`}>
                            {new Date(rental.returnDate).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tools Card */}
            <div className="rental-card">
                <div className="card-header-row">
                    <div style={{display:'flex', alignItems:'baseline'}}>
                        <h2 className="card-title">Herramientas Arrendadas</h2>
                        <span className="total-items">Total ítems: {tools.length}</span>
                    </div>
                    
                    {/* Why: Business Logic Rule. The 'Return' action is only visible/possible 
                        if the transaction is still open (Status != 2). Once returned, the history is immutable. */}
                    {rental.rentalStatus !== 2 && (
                        <button 
                            className="btn-action-yellow"
                            onClick={() => setIsReturnModalOpen(true)} 
                        >
                            Devolver arriendo
                        </button>
                    )}
                </div>

                {tools.length > 0 ? (
                    <div style={{overflowX: 'auto'}}>
                        <table className="clean-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Código (Etiqueta)</th>
                                    <th>Categoría</th> 
                                    <th>Precio de Renta Diaria</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tools.map((tool) => (
                                    <tr key={tool.toolId}>
                                        <td style={{fontWeight: '600'}}>{tool.informationTool?.nameTool}</td>
                                        
                                        {/* Why: Pseudo-ID Generation. If the backend doesn't provide a formatted barcode string, 
                                            we generate a consistent visual identifier (TAL-00X) on the fly for the user. */}
                                        <td style={{fontFamily:'monospace', color:'#666'}}>
                                            TAL-{tool.toolId.toString().padStart(3, '0')} 
                                        </td>
                                        
                                        <td>
                                            {tool.informationTool?.categoryTool || 'Sin Categoría'}
                                        </td>
                                        
                                        <td className="text-price">
                                            ${tool.informationTool?.rentPrice}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{padding:'40px', textAlign:'center', color:'#999', fontStyle:'italic'}}>
                        No hay herramientas registradas en este arriendo.
                    </div>
                )}
            </div>
            <ReturnRentalModal
                isOpen={isReturnModalOpen}
                onClose={() => setIsReturnModalOpen(false)}
                rentalId={rental?.rentalId}
                tools={tools}
                onSuccess={handleReturnSuccess}
            />
            </div>
        </PageLayout>
    );
};

export default RentalDetailPage;