import apiClient from "./http-common";

// Why: Service Layer Pattern. This file centralizes all HTTP traffic related to 'Clients'.
// If the backend API URL changes from /toolrent/client to /api/v1/customers in the future,
// we only have to update this file, not every single React component (Separation of Concerns).

const getAll = (keyword = '', status = '') => {
  // ENDPOINT QUERY: Builds the filtering request (GET /toolrent/client?keyword=X&status=Y).
  // Why: We use the 'URLSearchParams' API instead of manual string concatenation (e.g., "?q=" + keyword).
  // This class automatically handles edge cases, like encoding spaces (%20) or special characters (like '&' or '@'),
  // ensuring the URL remains valid and safe regardless of user input.
  const params = new URLSearchParams();

  if (keyword) {
      params.append('keyword', keyword);
  }
  
  // Why: Clean Data Transmission. We strictly check for valid boolean/string values
  // to avoid sending "status=" (empty) or "status=undefined" to the server,
  // which could cause 400 Bad Request errors or unexpected filtering logic on the backend.
  if (status !== '' && status !== null && status !== undefined) {
      params.append('status', status);
  }

  // Why: Axios accepts a 'params' object and attaches it to the URL automatically.
  return apiClient.get('/toolrent/client', { params });
};

const getByRut = (rut) => {
  // ENDPOINT DATA: Fetches a single resource using its unique business key (RUT).
  return apiClient.get(`/toolrent/client/${rut}`);
};

const create = (data) => {
  // ENDPOINT ACTION: Submits the form payload to create a new database entry.
  return apiClient.post("/toolrent/client", data);
};

const update = (data) => {
  // ENDPOINT ACTION: Uses PUT to modify an existing resource.
  // Why: Idempotency. The backend typically expects the full object to replace the old one.
  return apiClient.put("/toolrent/client", data);
};

const getOverdue = () => {
  // ENDPOINT REPORT: A specialized business query to fetch only "problem clients" (late rentals).
  // This avoids filtering large lists on the frontend, shifting the workload to the database.
  return apiClient.get("/toolrent/client/overdue");
};

const verifyStatus = (rut) => {
  // ENDPOINT LOGIC: Trigger a server-side calculation to check if a client is eligible to rent.
  return apiClient.post(`/toolrent/client/${rut}/verify`);
};

const payDebt = (rut, amount) => {
    // ENDPOINT TRANSACTION: Processes a financial payment.
    // Why: We send the amount in the request body ({ amount }) rather than the URL 
    // because this is a state-changing operation (POST) and body payloads are cleaner/safer for transactional data.
    return apiClient.post(`/toolrent/client/${rut}/pay`, { amount });
};

const ClientService = {
  getAll,
  getByRut,
  create,
  update,
  getOverdue,
  verifyStatus,
  payDebt
};

export default ClientService;