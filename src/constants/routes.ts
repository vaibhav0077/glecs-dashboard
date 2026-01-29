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
  billsSales: "/bills/sales",
  billsPurchase: "/bills/purchase",
  inventory: "/inventory",
  companies: "/companies",
  users: "/users",
  profile: "/profile",
  noCompany: "/no-company",
} as const;
