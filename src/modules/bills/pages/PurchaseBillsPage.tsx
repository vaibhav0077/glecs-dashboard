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
import { PlusOutlined, EditOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/hooks";
import { generateClient } from "aws-amplify/api";
import { billsByCompanyQuery } from "../queries";
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
  createdAt?: string | null;
  updatedAt?: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "default",
  ISSUED: "blue",
  PAID: "green",
  VOID: "red",
};

export function PurchaseBillsPage() {
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
          filter: { billType: { eq: "PURCHASE" } },
        },
        authMode: "userPool",
      })) as {
        data?: { billsByCompany?: { items: Bill[] } };
      };
      const items = res.data?.billsByCompany?.items ?? [];
      setBills(items);
    } catch (e) {
      console.error(e);
      message.error("Failed to load purchase bills");
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCompany) {
    return (
      <Card>
        <Empty description="Select a company to view purchase bills." />
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
            onClick={() => navigate(`${APP_ROUTES.billsPurchase}/edit/${r.id}`)}
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
              Purchase Bills
            </Title>
            <Text type="secondary">Create and manage purchase bills</Text>
          </Col>
          <Col xs={24} sm={24} md={12} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`${APP_ROUTES.billsPurchase}/add`)}
            >
              Add Purchase Bill
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
              image={<ShoppingCartOutlined style={{ fontSize: 48, color: "#bfbfbf" }} />}
              description="No purchase bills yet. Create one to get started."
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(`${APP_ROUTES.billsPurchase}/add`)}
              >
                Add Purchase Bill
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
