import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=4df4ebe7"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=4df4ebe7"; const StrictMode = __vite__cjsImport1_react["StrictMode"];
import __vite__cjsImport2_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=4df4ebe7"; const createRoot = __vite__cjsImport2_reactDom_client["createRoot"];
import "/src/index.css";
import App from "/src/App.jsx?t=1763795967812";
import { ReactKeycloakProvider } from "/node_modules/.vite/deps/@react-keycloak_web.js?v=4df4ebe7";
import keycloak from "/src/services/keycloak.js";
createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxDEV(StrictMode, { children: /* @__PURE__ */ jsxDEV(
    ReactKeycloakProvider,
    {
      authClient: keycloak,
      initOptions: { onLoad: "check-sso" },
      LoadingComponent: /* @__PURE__ */ jsxDEV("div", { children: "Loading, please wait..." }, void 0, false, {
        fileName: "/home/maria-fuentes/Escritorio/Usach/Tingeso/Lab1_Tingeso_21575622k/ToolRent/src/main.jsx",
        lineNumber: 16,
        columnNumber: 25
      }, this),
      children: /* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
        fileName: "/home/maria-fuentes/Escritorio/Usach/Tingeso/Lab1_Tingeso_21575622k/ToolRent/src/main.jsx",
        lineNumber: 18,
        columnNumber: 5
      }, this)
    },
    void 0,
    false,
    {
      fileName: "/home/maria-fuentes/Escritorio/Usach/Tingeso/Lab1_Tingeso_21575622k/ToolRent/src/main.jsx",
      lineNumber: 13,
      columnNumber: 5
    },
    this
  ) }, void 0, false, {
    fileName: "/home/maria-fuentes/Escritorio/Usach/Tingeso/Lab1_Tingeso_21575622k/ToolRent/src/main.jsx",
    lineNumber: 11,
    columnNumber: 3
  }, this)
);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBZXdCO0FBZnhCLFNBQVNBLGtCQUFrQjtBQUMzQixTQUFTQyxrQkFBa0I7QUFDM0IsT0FBTztBQUNQLE9BQU9DLFNBQVM7QUFHaEIsU0FBU0MsNkJBQTZCO0FBQ3RDLE9BQU9DLGNBQWM7QUFFckJILFdBQVdJLFNBQVNDLGVBQWUsTUFBTSxDQUFDLEVBQUVDO0FBQUFBLEVBQzFDLHVCQUFDLGNBRUM7QUFBQSxJQUFDO0FBQUE7QUFBQSxNQUNDLFlBQVlIO0FBQUFBLE1BQ1osYUFBYSxFQUFFSSxRQUFRLFlBQVk7QUFBQSxNQUNuQyxrQkFBa0IsdUJBQUMsU0FBSSx1Q0FBTDtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBQTRCO0FBQUEsTUFFaEQsaUNBQUMsU0FBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBQUk7QUFBQTtBQUFBLElBTEo7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTUEsS0FSRjtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBU0E7QUFDRiIsIm5hbWVzIjpbIlN0cmljdE1vZGUiLCJjcmVhdGVSb290IiwiQXBwIiwiUmVhY3RLZXljbG9ha1Byb3ZpZGVyIiwia2V5Y2xvYWsiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwicmVuZGVyIiwib25Mb2FkIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbIm1haW4uanN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN0cmljdE1vZGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGNyZWF0ZVJvb3QgfSBmcm9tICdyZWFjdC1kb20vY2xpZW50J1xuaW1wb3J0ICcuL2luZGV4LmNzcydcbmltcG9ydCBBcHAgZnJvbSAnLi9BcHAuanN4J1xuXG4vLyBpbXBvcnQgb2YgS2V5Y2xvYWtcbmltcG9ydCB7IFJlYWN0S2V5Y2xvYWtQcm92aWRlciB9IGZyb20gJ0ByZWFjdC1rZXljbG9hay93ZWInO1xuaW1wb3J0IGtleWNsb2FrIGZyb20gJy4vc2VydmljZXMva2V5Y2xvYWsuanMnO1xuXG5jcmVhdGVSb290KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290JykpLnJlbmRlcihcbiAgPFN0cmljdE1vZGU+XG4gICAgXG4gICAgPFJlYWN0S2V5Y2xvYWtQcm92aWRlclxuICAgICAgYXV0aENsaWVudD17a2V5Y2xvYWt9XG4gICAgICBpbml0T3B0aW9ucz17eyBvbkxvYWQ6ICdjaGVjay1zc28nIH19XG4gICAgICBMb2FkaW5nQ29tcG9uZW50PXs8ZGl2PkxvYWRpbmcsIHBsZWFzZSB3YWl0Li4uPC9kaXY+fVxuICAgID5cbiAgICA8QXBwIC8+XG4gICAgPC9SZWFjdEtleWNsb2FrUHJvdmlkZXI+XG4gIDwvU3RyaWN0TW9kZT4sXG4pXG5cbiJdLCJmaWxlIjoiL2hvbWUvbWFyaWEtZnVlbnRlcy9Fc2NyaXRvcmlvL1VzYWNoL1Rpbmdlc28vTGFiMV9UaW5nZXNvXzIxNTc1NjIyay9Ub29sUmVudC9zcmMvbWFpbi5qc3gifQ==