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
  Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, ShoppingCartOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/hooks";
import { useUserAccess } from "../../user/hooks/useUserAccess";
import { generateClient } from "aws-amplify/api";
import { billsByCompanyQuery, billsByCreatedByQuery, billItemsByBillQuery, deleteBillItemMutation, deleteBillMutation } from "../queries";
import { APP_ROUTES } from "../../../constants/routes";

const { Title, Text } = Typography;

type Bill = {
  id: string;
  companyId: string;
  createdBy?: string | null;
  billType: string;
  billedAt: string;
  status: string;
  totalAmount: number;
  customerId?: string | null;
  notes?: string | null;
  creator?: { email: string; name?: string | null } | null;
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
  const { canViewAllBills, email: currentUserEmail } = useUserAccess();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCompany?.id && (canViewAllBills || currentUserEmail)) {
      loadBills();
    } else {
      setBills([]);
      setLoading(false);
    }
  }, [selectedCompany?.id, canViewAllBills, currentUserEmail]);

  const loadBills = async () => {
    if (!selectedCompany?.id) return;
    if (!canViewAllBills && !currentUserEmail) return;
    setLoading(true);
    try {
      const client = generateClient();
      if (canViewAllBills) {
        const res = (await client.graphql({
          query: billsByCompanyQuery,
          variables: {
            companyId: selectedCompany.id,
            filter: { billType: { eq: "PURCHASE" } },
          },
          authMode: "userPool",
        })) as { data?: { billsByCompany?: { items: Bill[] } } };
        setBills(res.data?.billsByCompany?.items ?? []);
      } else {
        const res = (await client.graphql({
          query: billsByCreatedByQuery,
          variables: {
            createdBy: currentUserEmail!,
            filter: {
              companyId: { eq: selectedCompany.id },
              billType: { eq: "PURCHASE" },
            },
          },
          authMode: "userPool",
        })) as { data?: { billsByCreatedBy?: { items: Bill[] } } };
        setBills(res.data?.billsByCreatedBy?.items ?? []);
      }
    } catch (e) {
      console.error(e);
      message.error("Failed to load purchase bills");
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = async (bill: Bill) => {
    if (!selectedCompany?.id) return;
    setDeletingBillId(bill.id);
    try {
      const client = generateClient();
      // 1. Fetch all bill items for this bill
      const itemsRes = (await client.graphql({
        query: billItemsByBillQuery,
        variables: { billId: bill.id },
        authMode: "userPool",
      })) as { data?: { billItemsByBill?: { items: { id: string }[] } } };
      const items = itemsRes.data?.billItemsByBill?.items ?? [];
      // 2. Delete each bill item
      for (const item of items) {
        await client.graphql({
          query: deleteBillItemMutation,
          variables: { input: { id: item.id } },
          authMode: "userPool",
        });
      }
      // 3. Delete the bill
      await client.graphql({
        query: deleteBillMutation,
        variables: { input: { id: bill.id } },
        authMode: "userPool",
      });
      message.success("Bill deleted successfully.");
      await loadBills();
    } catch (e) {
      console.error(e);
      message.error("Failed to delete bill.");
    } finally {
      setDeletingBillId(null);
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
      title: "Created By",
      key: "createdBy",
      render: (_: unknown, r: Bill) =>
        r.creator?.name?.trim() || r.creator?.email || r.createdBy || "—",
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
          <Popconfirm
            title="Delete bill"
            description="Delete this bill and all its line items? This cannot be undone."
            onConfirm={() => handleDeleteBill(r)}
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deletingBillId === r.id}
            >
              Delete
            </Button>
          </Popconfirm>
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
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <Table
              rowKey="id"
              dataSource={bills}
              columns={columns}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              size="middle"
              scroll={{ x: 580 }}
            />
          </div>
        )}
      </Space>
    </Card>
  );
}
