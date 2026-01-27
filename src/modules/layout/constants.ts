import type { ComponentType } from "react";
import {
    AppstoreOutlined,
    DashboardOutlined,
    TeamOutlined,
    ShoppingOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import { APP_ROUTES } from "../../constants/routes";

export type SidebarItem = {
    key: string;
    label: string;
    icon: ComponentType;
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        key: APP_ROUTES.dashboard,
        icon: DashboardOutlined,
        label: "Dashboard",
    },
    {
        key: APP_ROUTES.products,
        icon: AppstoreOutlined,
        label: "Products",
    },
    {
        key: APP_ROUTES.customers,
        icon: TeamOutlined,
        label: "Customers",
    },
    {
        key: APP_ROUTES.bills,
        icon: FileTextOutlined,
        label: "Bills",
    },
    {
        key: APP_ROUTES.inventory,
        icon: ShoppingOutlined,
        label: "Inventory",
    },
];
