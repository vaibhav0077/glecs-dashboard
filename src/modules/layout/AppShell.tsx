import { useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "aws-amplify/auth";
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Layout,
  Menu,
  Select,
  Space,
  Typography,
} from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from "@ant-design/icons";
import { AUTH_ROUTES } from "../../constants/routes";
import { SIDEBAR_ITEMS } from "./constants";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { selectCompanyById, clearCompany } from "../../store/slices/companySlice";
import "./layout.css";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { selectedCompany, companies } = useAppSelector((state) => state.company);

  const selectedKey = useMemo(() => {
    // Check all items including children
    for (const item of SIDEBAR_ITEMS) {
      if (item.children) {
        const childMatch = item.children.find((child) =>
          location.pathname.startsWith(child.key)
        );
        if (childMatch) {
          return [childMatch.key];
        }
      } else if (location.pathname.startsWith(item.key)) {
        return [item.key];
      }
    }
    return [];
  }, [location.pathname]);

  const handleLogout = async () => {
    dispatch(clearCompany());
    await signOut();
    navigate(AUTH_ROUTES.login, { replace: true });
  };

  const handleCompanyChange = (companyId: string) => {
    dispatch(selectCompanyById(companyId));
  };

  const profileMenu = {
    items: [
      {
        key: "profile",
        label: <Link to="/profile">Profile</Link>,
      },
      {
        type: "divider" as const,
      },
      {
        key: "logout",
        label: "Logout",
        onClick: handleLogout,
      },
    ],
  };

  const sidebarMenu = (
    <Menu
      mode="inline"
      selectedKeys={selectedKey}
      items={SIDEBAR_ITEMS.map((item) => {
        if (item.children) {
          return {
            key: item.key,
            icon: <item.icon />,
            label: item.label,
            children: item.children.map((child) => ({
              key: child.key,
              icon: <child.icon />,
              label: <Link to={child.key}>{child.label}</Link>,
            })),
          };
        }
        return {
          key: item.key,
          icon: <item.icon />,
          label: <Link to={item.key}>{item.label}</Link>,
        };
      })}
      className="app-menu"
    />
  );

  return (
    <Layout className="app-shell">
      <Sider
        width={240}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="app-sider"
        breakpoint="lg"
        collapsedWidth={80}
      >
        <div className="app-logo">
          <Text className="app-logo-text">{collapsed ? "G" : "GLECS"}</Text>
        </div>
        {sidebarMenu}
      </Sider>

      <Layout className="app-content">
        <Header className="app-header">
          <Space>
            <Button
              className="mobile-toggle"
              type="text"
              icon={mobileOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              onClick={() => setMobileOpen((open) => !open)}
            />
            <Text className="header-title">Company Management</Text>
          </Space>
          <Space size="middle">
            {selectedCompany && companies.length > 0 && (
              <>
                {companies.length > 1 ? (
                  <Select
                    value={selectedCompany.id}
                    onChange={handleCompanyChange}
                    style={{ minWidth: 200 }}
                    options={companies.map((company) => ({
                      label: company.name,
                      value: company.id,
                    }))}
                  />
                ) : (
                  <Text strong style={{ color: "#111827" }}>
                    {selectedCompany.name}
                  </Text>
                )}
              </>
            )}
            <Dropdown menu={profileMenu} trigger={["click"]} placement="bottomRight">
              <span>
                <Button type="text" className="profile-button">
                  <Space>
                    <Avatar icon={<UserOutlined />} />
                    <Text>Profile</Text>
                  </Space>
                </Button>
              </span>
            </Dropdown>
          </Space>
        </Header>

        <Content className="app-main">
          <Outlet />
        </Content>
      </Layout>

      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        className="mobile-drawer"
        size="default"
        title="Menu"
      >
        {sidebarMenu}
      </Drawer>
    </Layout>
  );
}
