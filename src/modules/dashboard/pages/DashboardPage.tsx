import { Card, Space, Typography } from "antd";

const { Title, Text } = Typography;

export function DashboardPage() {
  return (
    <Card>
      <Space orientation="vertical" size="middle">
        <Title level={3}>Dashboard</Title>
        <Text>Overview of sales, bills, inventory, and team activity.</Text>
      </Space>
    </Card>
  );
}
