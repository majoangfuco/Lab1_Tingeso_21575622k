import apiClient from "./http-common";

const register = (userData) => {
    // ENDPOINT ACTION: Submits the registration payload to the Identity Provider (Keycloak/DB).
    // Why: Centralizes the account creation logic, ensuring the frontend sends the exact JSON structure (DTO)
    // required by the backend to provision a new security principal (User).
    return apiClient.post("/toolrent/users/register", userData);
};

const getAll = () => {
    // ENDPOINT QUERY: Retrieves the full directory of system operators.
    // Why: Allows Administrators to audit who has access to the platform (Employees vs Admins) 
    // directly from the app UI, without needing technical access to the Keycloak console.
    return apiClient.get("/toolrent/users");
};

const UserService = {
    register,
    getAll
};

export default UserService;