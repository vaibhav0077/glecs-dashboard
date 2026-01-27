import { Button, Card, Space, Typography } from "antd";
import { useUserAccess } from "../../user/hooks/useUserAccess";

const { Title, Text } = Typography;

export function DashboardPage() {
  const { isAdmin, companies, isLoading, error } = useUserAccess();

  if (isLoading) {
    return (
      <Card>
        <Text>Loading your dashboard...</Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Text type="danger">{error}</Text>
      </Card>
    );
  }

  if (!isAdmin && companies.length === 0) {
    return (
      <Card>
        <Space direction="vertical" size="middle">
          <Title level={3}>No company assigned</Title>
          <Text>
            You are not part of any company yet. Please ask your administrator to
            invite you.
          </Text>
        </Space>
      </Card>
    );
  }

  return (
    <Card>
      <Space direction="vertical" size="middle">
        <Title level={3}>Dashboard</Title>
        <Text>Overview of sales, bills, inventory, and team activity.</Text>
        {isAdmin ? <Button type="primary">Create company</Button> : null}
      </Space>
    </Card>
  );
}
