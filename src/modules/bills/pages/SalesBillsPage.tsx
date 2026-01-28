import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Space,
  Typography,
  Empty,
  Spin,
  Table,
  Tag,
  message,
  Row,
  Col,
} from "antd";
import { PlusOutlined, EditOutlined, DollarOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/hooks";
import { generateClient } from "aws-amplify/api";
import { billsByCompanyQuery, deleteBillMutation } from "../queries";
import { APP_ROUTES } from "../../../constants/routes";

const { Title, Text } = Typography;

type Bill = {
  id: string;
  companyId: string;
  billType: string;
  billedAt: string;
  status: string;
  totalAmount: number;
  customerId?: string | null;
  notes?: string | null;
  customer?: { id: string; name: string; email?: string | null } | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "default",
  ISSUED: "blue",
  PAID: "green",
  VOID: "red",
};

export function SalesBillsPage() {
  const navigate = useNavigate();
  const { selectedCompany } = useAppSelector((state) => state.company);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCompany?.id) {
      loadBills();
    } else {
      setBills([]);
      setLoading(false);
    }
  }, [selectedCompany?.id]);

  const loadBills = async () => {
    if (!selectedCompany?.id) return;
    setLoading(true);
    try {
      const client = generateClient();
      const res = (await client.graphql({
        query: billsByCompanyQuery,
        variables: {
          companyId: selectedCompany.id,
          filter: { billType: { eq: "SALE" } },
        },
        authMode: "userPool",
      })) as {
        data?: { billsByCompany?: { items: Bill[] } };
      };
      const items = res.data?.billsByCompany?.items ?? [];
      setBills(items);
    } catch (e) {
      console.error(e);
      message.error("Failed to load sales bills");
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const client = generateClient();
      await client.graphql({
        query: deleteBillMutation,
        variables: { input: { id } },
        authMode: "userPool",
      });
      message.success("Bill deleted");
      loadBills();
    } catch (e) {
      console.error(e);
      message.error("Failed to delete bill");
    }
  };

  if (!selectedCompany) {
    return (
      <Card>
        <Empty description="Select a company to view sales bills." />
      </Card>
    );
  }

  const columns = [
    {
      title: "Date",
      dataIndex: "billedAt",
      key: "billedAt",
      render: (v: string) => (v ? new Date(v).toLocaleDateString() : "—"),
    },
    {
      title: "Customer",
      key: "customer",
      render: (_: unknown, r: Bill) =>
        r.customer?.name ?? (r.customerId ? "—" : "—"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v: string) => (
        <Tag color={STATUS_COLORS[v] ?? "default"}>{v}</Tag>
      ),
    },
    {
      title: "Total (₹)",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (v: number) => `₹${Number(v).toLocaleString("en-IN")}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, r: Bill) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`${APP_ROUTES.billsSales}/edit/${r.id}`)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} sm={24} md={12}>
            <Title level={3} style={{ margin: 0 }}>
              Sales Bills
            </Title>
            <Text type="secondary">Create and manage sales bills</Text>
          </Col>
          <Col xs={24} sm={24} md={12} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`${APP_ROUTES.billsSales}/add`)}
            >
              Add Sales Bill
            </Button>
          </Col>
        </Row>

        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <Spin size="large" />
          </div>
        ) : bills.length === 0 ? (
          <Card>
            <Empty
              image={<DollarOutlined style={{ fontSize: 48, color: "#bfbfbf" }} />}
              description="No sales bills yet. Create one to get started."
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(`${APP_ROUTES.billsSales}/add`)}
              >
                Add Sales Bill
              </Button>
            </Empty>
          </Card>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <Table
              rowKey="id"
              dataSource={bills}
              columns={columns}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              size="middle"
            />
          </div>
        )}
      </Space>
    </Card>
  );
}
