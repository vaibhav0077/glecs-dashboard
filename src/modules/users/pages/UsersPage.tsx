import { useEffect, useState } from "react";
import { Button, Card, List, Space, Typography, Tag, Empty, Spin, message } from "antd";
import { UserOutlined, UserAddOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/hooks";
import { InviteUserModal } from "../components/InviteUserModal";
import { useUserAccess } from "../../user/hooks/useUserAccess";
import { generateClient } from "aws-amplify/api";
import { usersByCompanyQuery, type UserCompanyConnectionItem } from "../queries";

const { Title, Text } = Typography;

type User = {
  email: string;
  name?: string | null;
  phone?: string | null;
  connectionId: string;
};

function connectionToUser(item: UserCompanyConnectionItem): User {
  const email = item.userProfile?.email ?? item.userProfileEmail ?? item.email ?? "";
  return {
    email,
    name: item.userProfile?.name ?? null,
    phone: item.userProfile?.phone ?? null,
    connectionId: item.id,
  };
}

export function UsersPage() {
  const { selectedCompany } = useAppSelector((state) => state.company);
  const { email: currentUserEmail } = useUserAccess();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  useEffect(() => {
    if (!selectedCompany?.id) {
      setUsers([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    const client = generateClient();
    (async () => {
      try {
        const response = await client.graphql({
          query: usersByCompanyQuery,
          variables: { companyId: selectedCompany.id },
          authMode: "userPool",
        });
        const data = response as { data?: { userCompanyConnectionsByCompanyId?: { items: UserCompanyConnectionItem[] } } };
        const items = data.data?.userCompanyConnectionsByCompanyId?.items ?? [];
        if (active) {
          setUsers(items.map(connectionToUser));
          setLoading(false);
        }
      } catch (error: any) {
        console.error("Error loading users:", error);
        // If index doesn't exist, try fallback query
        if (error?.errors?.[0]?.message?.includes("index") || error?.errors?.[0]?.message?.includes("byCompany")) {
          console.warn("Index not found, using fallback query");
          // Fallback: use listUserCompanyConnections with filter
          try {
            const fallbackResponse = await client.graphql({
              query: `query ListUserCompanyConnections($filter: ModelUserCompanyConnectionFilterInput) {
                listUserCompanyConnections(filter: $filter) {
                  items {
                    id
                    userProfileEmail
                    companyId
                    userProfile {
                      email
                      name
                      phone
                    }
                    createdAt
                    updatedAt
                  }
                }
              }`,
              variables: {
                filter: { companyId: { eq: selectedCompany.id } },
              },
              authMode: "userPool",
            });
            const fallbackData = fallbackResponse as {
              data?: {
                listUserCompanyConnections?: { items: UserCompanyConnectionItem[] };
              };
            };
            const items =
              fallbackData.data?.listUserCompanyConnections?.items ?? [];
            if (active) {
              setUsers(items.map(connectionToUser));
              setLoading(false);
            }
          } catch (fallbackError: any) {
            console.error("Fallback query also failed:", fallbackError);
            if (active) {
              setUsers([]);
              setLoading(false);
              message.error("Failed to load users. Please run 'amplify push' to update the database schema.");
            }
          }
        } else {
          if (active) {
            setUsers([]);
            setLoading(false);
            message.error("Failed to load users");
          }
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [selectedCompany?.id]);

  const handleInviteSuccess = async () => {
    if (!selectedCompany?.id) return;
    setLoading(true);
    const client = generateClient();
    try {
      const response = await client.graphql({
        query: usersByCompanyQuery,
        variables: { companyId: selectedCompany.id },
        authMode: "userPool",
      });
      const data = response as { data?: { userCompanyConnectionsByCompanyId?: { items: UserCompanyConnectionItem[] } } };
      const items = data.data?.userCompanyConnectionsByCompanyId?.items ?? [];
      setUsers(items.map(connectionToUser));
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  };

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
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
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

        {loading ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin size="large" />
          </div>
        ) : users.length === 0 ? (
          <Card>
            <Empty
              description="No users found for this company."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <List
            dataSource={users}
            renderItem={(user) => {
              const isYou = Boolean(currentUserEmail && user.email?.toLowerCase() === currentUserEmail.toLowerCase());
              return (
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
                        {isYou && (
                          <Tag color="green">You</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Space>
                        {user.phone && <Text type="secondary">{user.phone}</Text>}
                        {!isYou && <Tag color="blue">Member</Tag>}
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Space>

      <InviteUserModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => {
          setInviteModalOpen(false);
          handleInviteSuccess();
        }}
      />
    </Card>
  );
}
