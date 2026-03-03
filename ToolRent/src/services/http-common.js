import axios from "axios";
import keycloak from "./keycloak";

// ENDPOINT CONFIGURATION: Creates a centralized HTTP client instance.
// Why: Instead of configuring headers and URLs in every single component, 
// we define the base rules here once. If the API URL changes, we update it in one place only.
const apiClient = axios.create({
  // ENDPOINT GATEWAY: Points to the central entry point (likely an API Gateway or Nginx Proxy)
  // that routes traffic to the specific microservices (Tool, Client, Rental) based on the path.
  baseURL: "http://localhost:8090/api", 
  headers: {
    "Content-type": "application/json",
  },
});

// Why: The Interceptor acts as a middleware "Middleware" for the frontend.
// It intercepts every single outgoing request before it leaves the browser to inject security protocols.
apiClient.interceptors.request.use(
  async (config) => {
    // Why: We only attach credentials if the user is actually logged in. 
    // Sending invalid/empty tokens might cause 401 errors on public endpoints.
    if (keycloak.authenticated && keycloak.token) {
      
      // ENDPOINT SECURITY: Token Rotation / Auto-Refresh logic.
      // Why: Access tokens are short-lived (e.g., 5 mins) for security. 
      // Before sending a request, we check if the token is about to die (minValidity = 5 seconds).
      // If it is, we silently exchange the Refresh Token for a new Access Token behind the scenes.
      try {
        await keycloak.updateToken(5);
      } catch (error) {
        console.error("Error al refrescar el token", error);
        // Why: Failsafe. If the Refresh Token is also expired (user was away for days), 
        // the session is dead. We force the user to log in again immediately.
        keycloak.login(); 
      }

      // ENDPOINT AUTH: Attaches the "Digital Passport" (JWT) to the request header.
      // The backend will inspect this 'Authorization' string to grant or deny access.
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;