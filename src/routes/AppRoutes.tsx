import { Navigate, Route, Routes } from "react-router-dom";
import { Spin } from "antd";
import { AUTH_ROUTES, APP_ROUTES } from "../constants/routes";
import { AuthRoutes } from "../modules/auth";
import { useAuth } from "../modules/auth/hooks/useAuth";
import { DashboardPage } from "../modules/dashboard/pages/DashboardPage";
import { PlaceholderPage } from "../modules/pages/PlaceholderPage";
import { AppShell } from "../modules/layout/AppShell";

type GuardProps = {
  children: React.ReactNode;
};

function ProtectedRoute({ children }: GuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={AUTH_ROUTES.login} replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }: GuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={APP_ROUTES.dashboard} replace />;
  }

  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={APP_ROUTES.dashboard} replace />} />
      <Route
        path="/*"
        element={
          <PublicOnlyRoute>
            <AuthRoutes />
          </PublicOnlyRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path={APP_ROUTES.dashboard} element={<DashboardPage />} />
        <Route
          path={APP_ROUTES.products}
          element={<PlaceholderPage title="Products" />}
        />
        <Route
          path={APP_ROUTES.customers}
          element={<PlaceholderPage title="Customers" />}
        />
        <Route path={APP_ROUTES.bills} element={<PlaceholderPage title="Bills" />} />
        <Route
          path={APP_ROUTES.inventory}
          element={<PlaceholderPage title="Inventory" />}
        />
      </Route>
    </Routes>
  );
}
