import type { ComponentType } from "react";
import {
    AppstoreOutlined,
    DashboardOutlined,
    TeamOutlined,
    ShoppingOutlined,
    FileTextOutlined,
    UserOutlined,
    DollarOutlined,
    ShoppingCartOutlined,
} from "@ant-design/icons";
import { APP_ROUTES } from "../../constants/routes";

export type SidebarItem = {
    key: string;
    label: string;
    icon: ComponentType;
    children?: SidebarItem[];
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        key: APP_ROUTES.dashboard,
        icon: DashboardOutlined,
        label: "Dashboard",
    },
    {
        key: APP_ROUTES.users,
        icon: UserOutlined,
        label: "Users",
    },
    {
        key: "products-menu",
        icon: AppstoreOutlined,
        label: "Products",
        children: [
            {
                key: APP_ROUTES.products,
                icon: AppstoreOutlined,
                label: "Products",
            },
            {
                key: APP_ROUTES.categories,
                icon: AppstoreOutlined,
                label: "Categories",
            },
            {
                key: APP_ROUTES.subcategories,
                icon: AppstoreOutlined,
                label: "Subcategories",
            },
        ],
    },
    {
        key: APP_ROUTES.customers,
        icon: TeamOutlined,
        label: "Customers",
    },
    {
        key: "bills-menu",
        icon: FileTextOutlined,
        label: "Bills",
        children: [
            {
                key: APP_ROUTES.billsSales,
                icon: DollarOutlined,
                label: "Sales Bill",
            },
            {
                key: APP_ROUTES.billsPurchase,
                icon: ShoppingCartOutlined,
                label: "Purchase Bill",
            },
        ],
    },
    {
        key: APP_ROUTES.inventory,
        icon: ShoppingOutlined,
        label: "Inventory",
    },
];
