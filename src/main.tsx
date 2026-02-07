import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { getSupabaseError } from './lib/supabase.ts' // Import getSupabaseError
import { BrowserRouter } from 'react-router-dom' // Import BrowserRouter
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // Import QueryClient and QueryClientProvider
import { ReactQueryDevtools } from '@tanstack/react-query-devtools' // Import ReactQueryDevtools

const supabaseInitializationError = getSupabaseError();
const queryClient = new QueryClient(); // Create a QueryClient instance // Create a QueryClient instance

if (supabaseInitializationError) {
  createRoot(document.getElementById('root')!).render(
    <div style={{ padding: '20px', color: 'red', backgroundColor: '#fee', border: '1px solid red' }}>
      <h1>Configuration Error</h1>
      <p>{supabaseInitializationError}</p>
      <p>Please set your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.</p>
    </div>
  );
} else {
  // Only render the app if Supabase initialized successfully
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter> {/* Wrap AuthProvider with BrowserRouter */}
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>,
  );
}
