import apiClient from "./http-common";

// Why: Service Pattern. This module acts as a dedicated interface for fetching 
// "Catalog" data (General Tool Definitions) separate from specific physical inventory items.
const getAll = async () => {
    // ENDPOINT QUERY: Fetches the master list of tool types (e.g., "Drill", "Saw").
    // Why: We extract 'response.data' immediately so the UI components receive 
    // a clean JSON array instead of having to deal with the full Axios response object (headers, status, etc.).
    const response = await apiClient.get("/toolrent/information-tool/all"); 
    return response.data;
};

const InformationToolService = {
    getAll
};

export default InformationToolService;