export const AUTH_ROUTES = {
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  newPassword: "/new-password",
} as const;

export const APP_ROUTES = {
  dashboard: "/dashboard",
  products: "/products",
  categories: "/categories",
  subcategories: "/subcategories",
  customers: "/customers",
  bills: "/bills",
  inventory: "/inventory",
  companies: "/companies",
  users: "/users",
  noCompany: "/no-company",
} as const;
