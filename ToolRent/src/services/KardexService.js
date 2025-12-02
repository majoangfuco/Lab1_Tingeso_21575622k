import apiClient from "./http-common";

// Why: Private Helper Function. We keep this logic internal to the service to ensure consistent 
// date formatting across all reports without exposing this complexity to the React components.
const formatLocalTime = (dateString, isEnd = false) => {
    if (!dateString) return null;
    // Why: Temporal Precision fix. HTML5 datetime-local inputs often drop the seconds, 
    // but the backend SQL timestamp parser might reject strings without "SS". 
    // We explicitly append :00 (start) or :59 (end) to define the exact time window boundaries.
    if (dateString.length === 16) {
        return isEnd ? `${dateString}:59` : `${dateString}:00`;
    }
    return dateString;
};

const getAll = async () => {
    const response = await apiClient.get("/toolrent/kardex");
    return response.data;
};

/**
 * Why: Business Logic Layer. Instead of making the UI component responsible for 
 * constructing complex query parameters, we centralize that responsibility here.
 */
const searchKardex = async (rawStartDate, rawEndDate, toolId) => {
    // Why: Data Normalization. We preprocess the raw inputs immediately to ensure 
    // the API receives a perfectly formatted request, preventing 400 Bad Request errors.
    const params = {
        startDate: formatLocalTime(rawStartDate, false),
        endDate: formatLocalTime(rawEndDate, true)
    };

    // Why: Conditional Parameter Injection. We only attach the 'infoId' if a specific tool 
    // was actually selected, keeping the URL clean for general searches.
    if (toolId && toolId !== "") {
        // Why: Type Casting. We explicitly convert strings to numbers to match the backend DTO expected type.
        params.infoId = Number(toolId); 
    }

    // ENDPOINT QUERY: Executes the complex multi-criteria search (Date Range + Tool Type).
    const response = await apiClient.get("/toolrent/kardex/search", { params });
    return response.data;
};

const getToolRanking = async (rawStartDate, rawEndDate) => {
    // Why: Reusability. We use the exact same time formatting logic as the search function
    // to ensure that the statistics (Ranking) match the raw data (Kardex) exactly for the same period.
    const params = { 
        startDate: formatLocalTime(rawStartDate, false),
        endDate: formatLocalTime(rawEndDate, true)
    };
    
    // ENDPOINT REPORT: Fetches aggregated statistics (Top 5 used tools) for the dashboard.
    const response = await apiClient.get("/toolrent/kardex/ranking", { params });
    return response.data;
};

const getToolsByRentalId = async (rentalId) => {
    try {
        // ENDPOINT JOIN: Fetches the 'Many' side of the One-to-Many relationship (Rental -> Tools).
        const response = await apiClient.get(`/toolrent/kardex/rental/${rentalId}/tools`);
        return response.data;
    } catch (error) {
        console.error("Error fetching tools for rental:", error);
        throw error;
    }
};

const KardexService = {
    getAll,
    searchKardex,
    getToolRanking,
    getToolsByRentalId
};

export default KardexService;