import { useState } from "react";
import { Button, Card, List, Space, Typography, Tag, Empty } from "antd";
import { UserOutlined, UserAddOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/hooks";
import { InviteUserModal } from "../components/InviteUserModal";

const { Title, Text } = Typography;

type User = {
  email: string;
  name?: string | null;
  phone?: string | null;
};

export function UsersPage() {
  const { selectedCompany } = useAppSelector((state) => state.company);
  const [users] = useState<User[]>([]); // TODO: Fetch from API - setUsers will be used when API is implemented
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // TODO: Fetch users for the selected company
  // useEffect(() => {
  //   if (selectedCompany) {
  //     // Fetch users API call here
  //   }
  // }, [selectedCompany]);

  if (!selectedCompany) {
    return (
      <Card>
        <Empty
          description="No company selected. Please select a company to view users."
        />
      </Card>
    );
  }

  return (
    <Card>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <Title level={3}>Users</Title>
            <Text type="secondary">
              All users connected to {selectedCompany.name}
            </Text>
          </div>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setInviteModalOpen(true)}
          >
            Invite User
          </Button>
        </div>

        {users.length === 0 ? (
          <Card>
            <Empty
              description="No users found for this company."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <List
            dataSource={users}
            renderItem={(user) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<UserOutlined style={{ fontSize: 24 }} />}
                  title={
                    <Space>
                      <Text strong>{user.name || user.email}</Text>
                      {user.name && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {user.email}
                        </Text>
                      )}
                    </Space>
                  }
                  description={
                    <Space>
                      {user.phone && <Text type="secondary">{user.phone}</Text>}
                      <Tag color="blue">Member</Tag>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Space>

      <InviteUserModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => {
          // TODO: Reload users list when API is implemented
          setInviteModalOpen(false);
        }}
      />
    </Card>
  );
}
