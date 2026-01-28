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
import { ProductsPage } from "../modules/products/pages/ProductsPage";
import { AddProductPage } from "../modules/products/pages/AddProductPage";
import { EditProductPage } from "../modules/products/pages/EditProductPage";
import { CategoriesPage } from "../modules/products/pages/CategoriesPage";
import { SubcategoriesPage } from "../modules/products/pages/SubcategoriesPage";
import { CustomersPage } from "../modules/customers/pages/CustomersPage";
import { AddCustomerPage } from "../modules/customers/pages/AddCustomerPage";
import { EditCustomerPage } from "../modules/customers/pages/EditCustomerPage";
import { SalesBillsPage } from "../modules/bills/pages/SalesBillsPage";
import { PurchaseBillsPage } from "../modules/bills/pages/PurchaseBillsPage";
import { AddSalesBillPage } from "../modules/bills/pages/AddSalesBillPage";
import { AddPurchaseBillPage } from "../modules/bills/pages/AddPurchaseBillPage";
import { EditSalesBillPage } from "../modules/bills/pages/EditSalesBillPage";
import { EditPurchaseBillPage } from "../modules/bills/pages/EditPurchaseBillPage";
import { InventoryPage } from "../modules/inventory/pages/InventoryPage";

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
              <ProductsPage />
            </CompanyGuard>
          }
        />
        <Route
          path={`${APP_ROUTES.products}/add`}
          element={
            <CompanyGuard>
              <AddProductPage />
            </CompanyGuard>
          }
        />
        <Route
          path={`${APP_ROUTES.products}/edit/:id`}
          element={
            <CompanyGuard>
              <EditProductPage />
            </CompanyGuard>
          }
        />
        <Route
          path={APP_ROUTES.categories}
          element={
            <CompanyGuard>
              <CategoriesPage />
            </CompanyGuard>
          }
        />
        <Route
          path={APP_ROUTES.subcategories}
          element={
            <CompanyGuard>
              <SubcategoriesPage />
            </CompanyGuard>
          }
        />
        <Route
          path={APP_ROUTES.customers}
          element={
            <CompanyGuard>
              <CustomersPage />
            </CompanyGuard>
          }
        />
        <Route
          path={`${APP_ROUTES.customers}/add`}
          element={
            <CompanyGuard>
              <AddCustomerPage />
            </CompanyGuard>
          }
        />
        <Route
          path={`${APP_ROUTES.customers}/edit/:id`}
          element={
            <CompanyGuard>
              <EditCustomerPage />
            </CompanyGuard>
          }
        />
        <Route
          path={APP_ROUTES.billsSales}
          element={
            <CompanyGuard>
              <SalesBillsPage />
            </CompanyGuard>
          }
        />
        <Route
          path={`${APP_ROUTES.billsSales}/add`}
          element={
            <CompanyGuard>
              <AddSalesBillPage />
            </CompanyGuard>
          }
        />
        <Route
          path={`${APP_ROUTES.billsSales}/edit/:id`}
          element={
            <CompanyGuard>
              <EditSalesBillPage />
            </CompanyGuard>
          }
        />
        <Route
          path={APP_ROUTES.billsPurchase}
          element={
            <CompanyGuard>
              <PurchaseBillsPage />
            </CompanyGuard>
          }
        />
        <Route
          path={`${APP_ROUTES.billsPurchase}/add`}
          element={
            <CompanyGuard>
              <AddPurchaseBillPage />
            </CompanyGuard>
          }
        />
        <Route
          path={`${APP_ROUTES.billsPurchase}/edit/:id`}
          element={
            <CompanyGuard>
              <EditPurchaseBillPage />
            </CompanyGuard>
          }
        />
        <Route
          path={APP_ROUTES.inventory}
          element={
            <CompanyGuard>
              <InventoryPage />
            </CompanyGuard>
          }
        />
      </Route>
    </Routes>
  );
}
