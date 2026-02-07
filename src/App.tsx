import { Navbar } from "@/components/navbar";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { CampaignsPage } from "./pages/CampaignsPage";
import { UsersPage } from "./pages/UsersPage";
import { PageLayout } from "@/components/PageLayout"; // Import PageLayout // Import UsersPage

// Placeholder for the main authenticated content
const HomePage = () => {
  return (
    <PageLayout>
      <h1 className="text-3xl font-bold text-center">Welcome to Circular Democracy!</h1>
    </PageLayout>
  );
};

// Component for protected routes (requires authentication)
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading authentication...</p>; // Or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Component for public routes (accessible to unauthenticated users)
const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading authentication...</p>; // Or a loading spinner
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export function App() {
  const { loading: authLoading } = useAuth();
  
  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading application...</div>;
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/users" element={<UsersPage />} />
          {/* Add other protected routes here */}
        </Route>

        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Catch all - 404 Not Found, or redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
export default App;