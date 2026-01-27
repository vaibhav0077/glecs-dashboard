import { Card, List, Space, Typography, Tag } from "antd";
import { useAppSelector } from "../../../store/hooks";
import { BankOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export function CompaniesPage() {
  const { companies } = useAppSelector((state) => state.company);

  return (
    <Card>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={3}>Companies</Title>
          <Text type="secondary">
            All companies connected to your account
          </Text>
        </div>

        {companies.length === 0 ? (
          <Card>
            <Text type="secondary">No companies found.</Text>
          </Card>
        ) : (
          <List
            dataSource={companies}
            renderItem={(company) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<BankOutlined style={{ fontSize: 24 }} />}
                  title={
                    <Space>
                      <Text strong>{company.name}</Text>
                      {company.isActive ? (
                        <Tag color="green">Active</Tag>
                      ) : (
                        <Tag color="red">Inactive</Tag>
                      )}
                    </Space>
                  }
                  description={`Company ID: ${company.id}`}
                />
              </List.Item>
            )}
          />
        )}
      </Space>
    </Card>
  );
}
