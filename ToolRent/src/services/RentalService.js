import apiClient from "./http-common";

const RentalService = {
  getAll: () => {
    // ENDPOINT QUERY: Fetches the complete ledger of all rentals ever made.
    // Why: Used for administrative reporting or global history views to analyze overall business performance.
    return apiClient.get("/toolrent/rental");
  },

  getById : (id) => {
      // ENDPOINT QUERY: Retrieves the full context of a single transaction (Client + Tools + Dates).
      // Why: Necessary for the "Detail View" page where we need deep nested data not available in the summary list.
      return apiClient.get(`/toolrent/rental/${id}`); 
  },
  
  /**
   * Obtiene los arriendos de un cliente.
   * @param {number} idClient 
   * @param {string|number} status 
   */
  getByClientId: (idClient, status = 'all') => {
    // Why: Defensive coding. We explicitly cast to String to prevent type mismatch errors 
    // if the UI passes a raw number (e.g., status 0) while we compare against string 'all'.
    const statusStr = String(status);

    // Why: API Routing Strategy. The backend exposes two distinct paths (one for full history, one for filtered).
    // We handle this branching logic here so the UI component doesn't need to know about URL structures.
    if (statusStr === 'all' || !statusStr) {
        // ENDPOINT QUERY: Path A - Full History.
        return apiClient.get(`/toolrent/rental/client/${idClient}`);
    }

    // ENDPOINT QUERY: Path B - Filtered Subset (e.g., only "Active" or "Overdue").
    return apiClient.get(`/toolrent/rental/client/${idClient}/status/${status}`);
  },

  create: (data) => {
    // ENDPOINT ACTION: Submits the rental agreement to reserve stock and create financial debt.
    return apiClient.post("/toolrent/rental", data);
  },
  
  returnRental : (id, payload) => {
    // ENDPOINT TRANSACTION: Closes the lifecycle of the rental.
    // Why: We pass a complex payload (extra charges + condition of every tool) because this single action 
    // triggers multiple side effects on the server (Final Invoicing + Stock Restocking + Tool Status Updates).
    return apiClient.post(`/toolrent/rental/${id}/return`, payload);
  }
};

export default RentalService;