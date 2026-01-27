import { Button, Card, Space, Typography } from "antd";
import { signOut } from "aws-amplify/auth";

const { Title, Text } = Typography;

export function DashboardPage() {
  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-page">
      <Card>
        <Space direction="vertical" size="middle">
          <Title level={3}>Dashboard</Title>
          <Text>Welcome back. You are logged in.</Text>
          <Button onClick={handleSignOut}>Sign out</Button>
        </Space>
      </Card>
    </div>
  );
}
