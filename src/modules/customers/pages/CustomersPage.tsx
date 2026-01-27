import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Input,
  Row,
  Col,
  Space,
  Typography,
  Empty,
  Spin,
  message,
  Popconfirm,
  Modal,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../../../store/hooks";
import { generateClient } from "aws-amplify/api";
import {
  customersByCompanyQuery,
  deleteCustomerMutation,
} from "../queries";
import { APP_ROUTES } from "../../../constants/routes";

const { Title, Text } = Typography;
const { Search } = Input;

type Customer = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  notes?: string | null;
};

export function CustomersPage() {
  const navigate = useNavigate();
  const { selectedCompany } = useAppSelector((state) => state.company);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (selectedCompany) {
      loadCustomers();
    }
  }, [selectedCompany]);

  const loadCustomers = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const client = generateClient();
      const filter: any = searchTerm
        ? {
            or: [
              { name: { contains: searchTerm } },
              { email: { contains: searchTerm } },
              { phone: { contains: searchTerm } },
            ],
          }
        : undefined;

      const response = (await client.graphql({
        query: customersByCompanyQuery,
        variables: {
          companyId: selectedCompany.id,
          filter: filter,
        },
        authMode: "userPool",
      })) as {
        data?: {
          customersByCompany?: {
            items?: Customer[] | null;
            nextToken?: string | null;
          } | null;
        };
      };

      const items = response.data?.customersByCompany?.items ?? [];
      setCustomers(items);
    } catch (error) {
      console.error("Error loading customers:", error);
      message.error("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadCustomers();
  };

  const handleDelete = (customer: Customer) => {
    Modal.confirm({
      title: "Delete Customer",
      content: `Are you sure you want to delete "${customer.name}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const client = generateClient();
          await client.graphql({
            query: deleteCustomerMutation,
            variables: {
              input: { id: customer.id },
            },
            authMode: "userPool",
          });
          message.success("Customer deleted successfully!");
          loadCustomers();
        } catch (error) {
          console.error("Error deleting customer:", error);
          message.error("Failed to delete customer.");
        }
      },
    });
  };

  if (!selectedCompany) {
    return (
      <Card>
        <Empty description="No company selected. Please select a company to view customers." />
      </Card>
    );
  }

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              Customers
            </Title>
            <Text type="secondary">Manage customers for {selectedCompany.name}</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`${APP_ROUTES.customers}/add`)}
            style={{ flexShrink: 0 }}
          >
            Add Customer
          </Button>
        </div>

        <Search
          placeholder="Search customers by name, email, or phone"
          allowClear
          style={{ width: "100%" }}
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSearch={handleSearch}
          enterButton
        />

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : customers.length === 0 ? (
          <Card>
            <Empty
              description={
                searchTerm
                  ? "No customers match your search."
                  : "No customers found. Add your first customer to get started."
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {customers.map((customer) => (
              <Col key={customer.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card
                  hoverable
                  actions={[
                    <Button
                      key="edit"
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => navigate(`${APP_ROUTES.customers}/edit/${customer.id}`)}
                    >
                      Edit
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title="Delete Customer"
                      description={`Are you sure you want to delete "${customer.name}"?`}
                      onConfirm={() => handleDelete(customer)}
                      okText="Delete"
                      okType="danger"
                      cancelText="Cancel"
                    >
                      <Button type="link" danger icon={<DeleteOutlined />}>
                        Delete
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    avatar={<UserOutlined style={{ fontSize: 24, color: "#1890ff" }} />}
                    title={
                      <Text strong style={{ fontSize: 16 }}>
                        {customer.name}
                      </Text>
                    }
                    description={
                      <Space direction="vertical" size="small" style={{ width: "100%", marginTop: 8 }}>
                        {customer.email && (
                          <Space size="small">
                            <MailOutlined style={{ color: "#8c8c8c" }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {customer.email}
                            </Text>
                          </Space>
                        )}
                        {customer.phone && (
                          <Space size="small">
                            <PhoneOutlined style={{ color: "#8c8c8c" }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {customer.phone}
                            </Text>
                          </Space>
                        )}
                        {(customer.city || customer.state || customer.country) && (
                          <Space size="small" wrap>
                            <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {[customer.city, customer.state, customer.country]
                                .filter(Boolean)
                                .join(", ")}
                            </Text>
                          </Space>
                        )}
                        {customer.notes && (
                          <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                            {customer.notes}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Space>
    </Card>
  );
}
