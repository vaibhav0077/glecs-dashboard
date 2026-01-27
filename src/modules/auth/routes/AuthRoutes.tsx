import { Navigate, Route, Routes } from "react-router-dom";
import { AUTH_ROUTES } from "../../../constants/routes";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { LoginPage } from "../pages/LoginPage";
import { NewPasswordPage } from "../pages/NewPasswordPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";

export function AuthRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={AUTH_ROUTES.login} replace />} />
      <Route path={AUTH_ROUTES.login} element={<LoginPage />} />
      <Route path={AUTH_ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
      <Route path={AUTH_ROUTES.resetPassword} element={<ResetPasswordPage />} />
      <Route path={AUTH_ROUTES.newPassword} element={<NewPasswordPage />} />
      <Route path="*" element={<Navigate to={AUTH_ROUTES.login} replace />} />
    </Routes>
  );
}
