import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import { Router } from "@/routes/router";
import { config } from "@/shared/utils/config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <GoogleOAuthProvider clientId={config.googleClientId}>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155" },
          }}
        />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
