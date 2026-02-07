import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { getSupabaseError } from './lib/supabase.ts' // Import getSupabaseError

const supabaseInitializationError = getSupabaseError();

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
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>,
  );
}
