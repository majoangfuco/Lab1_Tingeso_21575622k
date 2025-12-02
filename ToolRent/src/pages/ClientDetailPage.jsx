import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientService from '../services/ClientService';
import RentalService from '../services/RentalService';
import RentalHistoryTable from '../components/RentalHistoryTable';
import EditClientModal from '../components/NewClientModal';
import NewRentalModal from '../components/NewRentalModal';
import '../pages/ClientDetailPage.css';  

const ClientDetailsPage = () => {
  // Why: We capture the 'rut' from the URL to fetch the specific client context.
  const { rut } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Why: Filter state is managed in the parent to coordinate the data fetching trigger.
  const [historyFilter, setHistoryFilter] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false); 
  
  // ENDPOINT DATA: This function acts as the central data hub.
  // Why: Wrapped in 'useCallback' to ensure referential stability, allowing it to be safely added 
  // to the dependency array of useEffect without causing infinite re-render loops.
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const clientRes = await ClientService.getByRut(rut);
      const clientData = clientRes.data;
      setClient(clientData);

      // Why: We only fetch rentals if the client exists, avoiding 404 errors on the rental endpoint.
      if (clientData && clientData.idClient) {
        // ENDPOINT QUERY: Fetches history based on the current filter selection (Active, Overdue, etc.).
        const rentalRes = await RentalService.getByClientId(clientData.idClient, historyFilter);
        setRentals(rentalRes.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [rut, historyFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSaveClient = async (data) => {
    try {
      // ENDPOINT TRIGGER: Updates static client data (Phone, Email).
      await ClientService.update(data);
      // Why: Optimistic update (or immediate reflection) avoids a full page reload, improving perceived speed.
      setClient(data);
      setIsEditModalOpen(false);
      alert("Cliente actualizado.");
    } catch (err) { alert("Error al actualizar."); }
  };

  const handleCreateRental = async (rentalData) => {
    try {
      // Why: We enrich the payload with the context ID (clientRut) which the modal doesn't know about.
      const payload = { ...rentalData, clientRut: client.rut };
      
      // ENDPOINT TRIGGER: Initiates the rental transaction workflow.
      await RentalService.create(payload);
      setIsRentalModalOpen(false);
      
      // Why: UX Logic. If the user is currently filtering by "Returned" (Old items) and creates a "New" rental,
      // they wouldn't see it appear. We force the filter back to "All" or refresh to ensure the new item is visible.
      if (historyFilter !== 'all' && historyFilter !== '0') setHistoryFilter('all');
      else loadData();
      
      alert("¡Arriendo creado!");
    } catch (error) {
      const msg = error.response?.data?.error || "Error desconocido.";
      alert(`Error: ${msg}`);
    }
  };

  const handlePayment = async () => {
    // Why: Input validation prevents sending malformed requests to the payment gateway/service.
    if (!paymentAmount || parseInt(paymentAmount) <= 0) {
        alert("Ingresa un monto válido.");
        return;
    }

    // Why: Business Logic Rule. Preventing overpayment helps maintain accounting integrity 
    // and avoids complex refund processes later.
    if (parseInt(paymentAmount) > client.amountClient) {
        alert("No puedes pagar más de lo que debe.");
        return;
    }

    if (!window.confirm(`¿Confirmar pago de $${paymentAmount}?`)) return;

    setIsPaying(true);
    try {
        // ENDPOINT TRIGGER: Executes the financial transaction.
        const res = await ClientService.payDebt(client.rut, parseInt(paymentAmount));
        
        // Why: The backend returns the recalculated client state (new debt, updated status).
        // Using this response guarantees the UI matches the server's ledger exactly.
        setClient(res.data);
        setPaymentAmount(""); 
        alert("Pago realizado exitosamente. Estado actualizado.");
    } catch (error) {
        console.error(error);
        alert("Error al procesar el pago.");
    } finally {
        setIsPaying(false);
    }
  };

  if (isLoading && !client) return <div className="loading-text">Cargando...</div>;
  if (!client) return <div className="loading-text">Cliente no encontrado.</div>;

  return (
    <div className="details-container">
      
      <div className="details-header">
        <h1 className="details-title">Detalle del Cliente</h1>
        <button className="back-btn" onClick={() => navigate('/clientes')}>← Volver</button>
      </div>

      <div className="main-grid">

        {/* LEFT CARD: User Profile */}
        <div className="detail-card">
          <h2 className="section-title" style={{marginBottom:'20px'}}>Datos Personales</h2>
          <ul className="data-list">
             <li className="data-item status-item" style={{border:0, marginBottom:'20px'}}>
               <span className="label">Estado</span>
               {/* Why: Visual flagging allows operators to quickly identify problem clients. */}
               <span className={`status-badge ${client.clientStatus ? 'status-active' : 'status-restricted'}`}>
                 {client.clientStatus ? 'ACTIVO' : 'BLOQUEADO'}
               </span>
             </li>
             <li className="data-item"><span className="label">RUT</span><span className="value">{client.rut}</span></li>
             <li className="data-item"><span className="label">Nombre</span><span className="value">{client.clientName}</span></li>
             
             {/* DEBT & PAYMENT SECTION */}
             <li className="data-item" style={{display:'block'}}> 
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: client.amountClient > 0 ? '10px' : '0'}}>
                    <span className="label">Deuda Actual</span>
                    {/* Why: Color-coding financial data (Red for debt) draws immediate attention to outstanding balances. */}
                    <span className={`value ${client.amountClient > 0 ? 'text-danger' : 'text-success'}`} style={{fontSize:'1.2rem'}}>
                        ${client.amountClient}
                    </span>
                </div>

                {/* Why: Contextual UI. We hide the payment controls if there is no debt, 
                    decluttering the interface for clients in good standing. */}
                {client.amountClient > 0 && (
                    <div style={{
                        display:'flex', gap:'8px', marginTop:'10px', padding:'10px', 
                        background:'#f9fafb', borderRadius:'8px', border: '1px solid #eee'
                    }}>
                        <input 
                            type="number" 
                            placeholder="Monto"
                            className="input-payment"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            style={{ width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ccc' }}
                        />
                        <button 
                            onClick={handlePayment}
                            disabled={isPaying}
                            style={{
                                backgroundColor: '#28a745', color:'white', border:'none',
                                borderRadius:'6px', padding:'0 15px', fontWeight:'bold', cursor:'pointer', whiteSpace: 'nowrap'
                            }}
                        >
                            {isPaying ? '...' : 'Pagar'}
                        </button>
                    </div>
                )}
             </li>
              <li className="data-item"><span className="label">Teléfono</span><span className="value">{client.phone || '-'}</span></li>  
              <li className="data-item"><span className="label">Email</span><span className="value">{client.mail || '-'}</span></li>            
            </ul>
          <div style={{marginTop: 'auto'}}> 
            <button className="action-btn btn-edit w-full" onClick={() => setIsEditModalOpen(true)}>
                ✎ Editar Info
            </button>
          </div>
        </div>

        {/* RIGHT CARD: Transaction History */}
        <div className="detail-card">
          
          <div className="history-header">
            <h2 className="section-title">Historial</h2>
            
            <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
              {/* ENDPOINT TRIGGER: Changing this filter updates the 'historyFilter' state,
                  which triggers the useEffect to fetch fresh data from the backend. */}
              <select 
                    value={historyFilter} 
                    onChange={(e) => setHistoryFilter(e.target.value)} 
                    style={{padding:'6px', borderRadius:'4px', border:'1px solid #ddd'}}
                >
                    <option value="all">Todos</option>
                    <option value="0">En Curso</option>
                    <option value="1">Atrasados</option>
                    <option value="2">Devueltos</option>
                </select>
              
              {/* Why: Business Rule Enforcement. We strictly disable the creation of new rentals
                  if the client status is Blocked (false), preventing risk. */}
              <button 
                    className="btn-new-rental" 
                    onClick={() => setIsRentalModalOpen(true)} 
                    disabled={!client.clientStatus}
                    title={!client.clientStatus ? "Cliente bloqueado" : "Crear nuevo arriendo"}
                >
                    + Nuevo Arriendo
                </button>
            </div>
          </div>

          <div className="table-container">
            <RentalHistoryTable rentals={rentals} />
          </div>
        </div>
      </div>

      <EditClientModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} clientData={client} onSave={handleSaveClient} />
      <NewRentalModal isOpen={isRentalModalOpen} onClose={() => setIsRentalModalOpen(false)} clientName={client.clientName} onSave={handleCreateRental} />
    </div>
  );
};

export default ClientDetailsPage;