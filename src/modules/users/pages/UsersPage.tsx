import { useEffect, useState } from "react";
import { Button, Card, List, Space, Typography, Tag, Empty, Spin, message, Popconfirm } from "antd";
import { UserOutlined, UserAddOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/hooks";
import { InviteUserModal } from "../components/InviteUserModal";
import { useUserAccess } from "../../user/hooks/useUserAccess";
import { generateClient } from "aws-amplify/api";
import { usersByCompanyQuery, type UserCompanyConnectionItem } from "../queries";
import { fetchAuthSession } from "aws-amplify/auth";
import awsExports from "../../../aws-exports";

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
  const { email: currentUserEmail, isAdmin, canInviteUser } = useUserAccess();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

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

  const getApiUrl = (): string => {
    const apiConfig = (awsExports as any)?.aws_cloud_logic_custom?.find(
      (api: any) => api.name === "glecsrestapi"
    );
    if (apiConfig?.endpoint) {
      return `${apiConfig.endpoint}/auth/removeUser`;
    }
    throw new Error("REST API endpoint not found in configuration");
  };

  const handleRemoveUser = async (user: User) => {
    if (!selectedCompany?.id) return;

    setRemovingUserId(user.connectionId);
    try {
      const apiUrl = getApiUrl();
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (!idToken) {
        throw new Error("No authentication token available. Please log in again.");
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email: user.email,
          companyId: selectedCompany.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to remove user: ${response.status}`);
      }

      message.success(`User ${user.email} removed from company successfully`);
      // Reload users list
      await handleInviteSuccess();
    } catch (err) {
      const messageText =
        err instanceof Error ? err.message : "Failed to remove user.";
      message.error(messageText);
      console.error("Error removing user:", err);
    } finally {
      setRemovingUserId(null);
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
          {canInviteUser && (
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setInviteModalOpen(true)}
            >
              Invite User
            </Button>
          )}
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
              const canRemove = isAdmin && !isYou;
              return (
                <List.Item
                  actions={
                    canRemove
                      ? [
                          <Popconfirm
                            title="Remove user from company"
                            description={`Are you sure you want to remove ${user.email} from this company?`}
                            onConfirm={() => handleRemoveUser(user)}
                            okText="Yes, Remove"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                            key="remove"
                          >
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              loading={removingUserId === user.connectionId}
                              size="small"
                            >
                              Remove
                            </Button>
                          </Popconfirm>,
                        ]
                      : undefined
                  }
                >
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
        existingUsers={users}
      />
    </Card>
  );
}
