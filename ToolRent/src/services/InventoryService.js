import apiClient from "./http-common";

const InventoryService = {
  getAll: (keyword = '') => {
    // Why: Dynamic URL construction. This allows a single function to handle both 
    // the "Full Catalog" view and the "Search Results" view, reducing code duplication.
    const url = keyword ? `/toolrent/information-tool?keyword=${keyword}` : '/toolrent/information-tool';
    
    // ENDPOINT QUERY: Retrieves the list of abstract Tool Definitions (e.g., "Hammer", "Drill").
    return apiClient.get(url);
  },
  
  createType: (data) => {
    // ENDPOINT ACTION: Creates a new "Master" record (Category/Definition) in the system.
    return apiClient.post('/toolrent/information-tool', data);
  },
  
  getUnitsByTypeId: (typeId) =>{
    // ENDPOINT DATA: Traverses the database relationship to find all physical instances 
    // associated with a specific Definition ID (One-to-Many).
    return apiClient.get(`/toolrent/tool/${typeId}`)},
    
  createUnit: (infoId, data) => {
    // ENDPOINT ACTION: Adds a physical item to the inventory.
    // Why: We require the 'infoId' in the URL to establish the Foreign Key relationship 
    // immediately upon creation, ensuring no tool exists without a parent definition.
    return apiClient.post(`/toolrent/tool/${infoId}`, data);
  }
};

export default InventoryService;