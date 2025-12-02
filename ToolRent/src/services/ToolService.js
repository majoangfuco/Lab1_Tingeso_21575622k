import apiClient from "./http-common";

// Base URL: /api/toolrent/tool

const getAll = async () => {
    // ENDPOINT QUERY: Fetches the complete list of physical tool instances.
    // Why: We unwrap 'response.data' here to abstract away the HTTP layer (Axios). 
    // The UI components should only interact with clean JSON arrays, not raw network response objects containing headers/status codes.
    const response = await apiClient.get("/toolrent/tool");
    return response.data; 
};

const getRanking = async () => {
    // ENDPOINT FALLBACK: Re-uses the general fetch because a dedicated statistics endpoint is missing.
    // Why: Architectural Trade-off. Ideally, the database should calculate rankings (via SQL COUNT/GROUP BY) for performance. 
    // Since that endpoint doesn't exist yet, we fetch raw data here and force the frontend CPU to do the math (Client-Side Processing).
    const response = await apiClient.get("/toolrent/tool"); 
    return response.data;
};

const ToolService = {
    getAll,
    getRanking,
};

export default ToolService;