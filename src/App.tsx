import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Navbar } from "@/components/navbar";
import { PageLayout } from "@/components/PageLayout";
import { useAuth } from "@/contexts/AuthContext";

const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })));
const CampaignMessagesPage = lazy(() => import("./pages/CampaignMessagesPage").then((m) => ({ default: m.CampaignMessagesPage })));
const CampaignsPage = lazy(() => import("./pages/CampaignsPage").then((m) => ({ default: m.CampaignsPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const PoliticianPage = lazy(() => import("./pages/PoliticianPage").then((m) => ({ default: m.PoliticianPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const MessagePage = lazy(() => import("./pages/MessagePage").then((m) => ({ default: m.MessagePage })));
const TemplatesPage = lazy(() => import("./pages/TemplatesPage").then((m) => ({ default: m.TemplatesPage })));
const UnclassifiedPage = lazy(() => import("./pages/UnclassifiedPage").then((m) => ({ default: m.UnclassifiedPage })));
const UsersPage = lazy(() => import("./pages/UsersPage").then((m) => ({ default: m.UsersPage })));
// A simple spinner component for fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
  </div>
);

// Component for protected routes (requires authentication)
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <PageLayout centerContent={true}>
        <LoadingSpinner />
      </PageLayout>
    ); // Or a loading spinner
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
    return (
      <PageLayout centerContent={true}>
        <LoadingSpinner />
      </PageLayout>
    ); // Or a loading spinner
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export function App() {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <PageLayout centerContent={true}>
        <LoadingSpinner />
      </PageLayout>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <Suspense
                fallback={
                  <PageLayout centerContent={true}>
                    <LoadingSpinner />
                  </PageLayout>
                }
              >
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="/politician"
            element={
              <Suspense
                fallback={
                  <PageLayout centerContent={true}>
                    <LoadingSpinner />
                  </PageLayout>
                }
              >
                <PoliticianPage />
              </Suspense>
            }
          />
          <Route
            path="/profile"
            element={
              <Suspense
                fallback={
                  <PageLayout centerContent={true}>
                    <LoadingSpinner />
                  </PageLayout>
                }
              >
                <ProfilePage />
              </Suspense>
            }
          />
          <Route
            path="/campaigns"
            element={
              <Suspense
                fallback={
                  <PageLayout centerContent={true}>
                    <LoadingSpinner />
                  </PageLayout>
                }
              >
                <CampaignsPage />
              </Suspense>
            }
          />
          <Route
            path="/campaigns/:id"
            element={
              <Suspense
                fallback={
                  <PageLayout centerContent={true}>
                    <LoadingSpinner />
                  </PageLayout>
                }
              >
                <CampaignMessagesPage />
              </Suspense>
            }
          />
          <Route
            path="/users"
            element={
              <Suspense
                fallback={
                  <PageLayout centerContent={true}>
                    <LoadingSpinner />
                  </PageLayout>
                }
              >
                <UsersPage />
              </Suspense>
            }
          />
          <Route
            path="/templates"
            element={
              <Suspense
                fallback={
                  <PageLayout centerContent={true}>
                    <LoadingSpinner />
                  </PageLayout>
                }
              >
                <TemplatesPage />
              </Suspense>
            }
          />
          <Route
            path="/unclassified"
            element={
              <Suspense
                fallback={
                  <PageLayout centerContent={true}>
                    <LoadingSpinner />
                  </PageLayout>
                }
              >
                <UnclassifiedPage />
              </Suspense>
            }
          />
          <Route
            path="/analytics"
            element={
              <Suspense
                fallback={
                  <PageLayout centerContent={true}>
                    <LoadingSpinner />
                  </PageLayout>
                }
              >
                <AnalyticsPage />
              </Suspense>
            }
          />
          <Route
            path="/message/:messageId"
            element={
              <Suspense
                fallback={
                  <PageLayout centerContent={true}>
                    <LoadingSpinner />
                  </PageLayout>
                }
              >
                <MessagePage />
              </Suspense>
            }
          />
        </Route>

        <Route element={<PublicRoute />}>
          <Route
            path="/login"
            element={
              <Suspense
                fallback={
                  <PageLayout centerContent={true}>
                    <LoadingSpinner />
                  </PageLayout>
                }
              >
                <LoginPage />
              </Suspense>
            }
          />
          <Route
            path="/register"
            element={
              <Suspense
                fallback={
                  <PageLayout centerContent={true}>
                    <LoadingSpinner />
                  </PageLayout>
                }
              >
                <RegisterPage />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
export default App;
