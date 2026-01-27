import { useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "aws-amplify/auth";
import { Avatar, Button, Drawer, Dropdown, Layout, Menu, Space, Typography } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from "@ant-design/icons";
import { AUTH_ROUTES } from "../../constants/routes";
import { SIDEBAR_ITEMS } from "./constants";
import "./layout.css";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedKey = useMemo(() => {
    const match = SIDEBAR_ITEMS.find((item) =>
      typeof item?.key === "string" ? location.pathname.startsWith(item.key) : false
    );
    return match?.key ? [String(match.key)] : [];
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate(AUTH_ROUTES.login, { replace: true });
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
      items={SIDEBAR_ITEMS.map((item) => ({
        key: item.key,
        icon: <item.icon />,
        label: <Link to={item.key}>{item.label}</Link>,
      }))}
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
