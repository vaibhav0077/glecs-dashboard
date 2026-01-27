import { Navigate, Route, Routes } from "react-router-dom";
import { Spin } from "antd";
import { AUTH_ROUTES, APP_ROUTES } from "../constants/routes";
import { AuthRoutes } from "../modules/auth";
import { useAuth } from "../modules/auth/hooks/useAuth";
import { useUserAccess } from "../modules/user/hooks/useUserAccess";
import { DashboardPage } from "../modules/dashboard/pages/DashboardPage";
import { PlaceholderPage } from "../modules/pages/PlaceholderPage";
import { NoCompanyPage } from "../modules/pages/NoCompanyPage";
import { AppShell } from "../modules/layout/AppShell";
import { CompaniesPage } from "../modules/company/pages/CompaniesPage";
import { UsersPage } from "../modules/users/pages/UsersPage";

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

type CompanyGuardProps = GuardProps & { allowNoCompany?: boolean };

function CompanyGuard({ children, allowNoCompany = false }: CompanyGuardProps) {
  const { isLoading, error, companies } = useUserAccess();

  if (isLoading) {
    return (
      <div className="app-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-loading">
        <span>{error}</span>
      </div>
    );
  }

  const hasCompany = companies.length > 0;

  if (!hasCompany) {
    return allowNoCompany ? children : <Navigate to={APP_ROUTES.noCompany} replace />;
  }

  if (allowNoCompany) {
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
        path={APP_ROUTES.noCompany}
        element={
          <ProtectedRoute>
            <CompanyGuard allowNoCompany>
              <NoCompanyPage />
            </CompanyGuard>
          </ProtectedRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route
          path={APP_ROUTES.dashboard}
          element={
            <CompanyGuard>
              <DashboardPage />
            </CompanyGuard>
          }
        />
        <Route
          path={APP_ROUTES.companies}
          element={
            <CompanyGuard>
              <CompaniesPage />
            </CompanyGuard>
          }
        />
        <Route
          path={APP_ROUTES.users}
          element={
            <CompanyGuard>
              <UsersPage />
            </CompanyGuard>
          }
        />
        <Route
          path={APP_ROUTES.products}
          element={
            <CompanyGuard>
              <PlaceholderPage title="Products" />
            </CompanyGuard>
          }
        />
        <Route
          path={APP_ROUTES.customers}
          element={
            <CompanyGuard>
              <PlaceholderPage title="Customers" />
            </CompanyGuard>
          }
        />
        <Route
          path={APP_ROUTES.bills}
          element={
            <CompanyGuard>
              <PlaceholderPage title="Bills" />
            </CompanyGuard>
          }
        />
        <Route
          path={APP_ROUTES.inventory}
          element={
            <CompanyGuard>
              <PlaceholderPage title="Inventory" />
            </CompanyGuard>
          }
        />
      </Route>
    </Routes>
  );
}
