import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter } from "react-router-dom";

import { DataModeProvider } from "./data/dataMode";
import { SessionControlProvider } from "./data/sessionControl";
import { AppRouter } from "./router/AppRouter";
import { initializeTheme } from "./theme/themes";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

initializeTheme();

const PUBLIC_DEMO_MODE =
  import.meta.env.VITE_PUBLIC_DEMO === "1" || import.meta.env.VITE_PUBLIC_DEMO === "true";
const Router = PUBLIC_DEMO_MODE ? HashRouter : BrowserRouter;
const routerProps = PUBLIC_DEMO_MODE ? {} : { basename: import.meta.env.BASE_URL };

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DataModeProvider>
        <SessionControlProvider>
          <Router {...routerProps}>
            <AppRouter />
          </Router>
        </SessionControlProvider>
      </DataModeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
