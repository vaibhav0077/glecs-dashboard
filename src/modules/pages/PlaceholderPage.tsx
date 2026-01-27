import { Card, Typography } from "antd";

const { Title, Text } = Typography;

type PlaceholderPageProps = {
  title: string;
  description?: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Card>
      <Title level={3}>{title}</Title>
      <Text type="secondary">
        {description ?? "This section is ready for your project data."}
      </Text>
    </Card>
  );
}
