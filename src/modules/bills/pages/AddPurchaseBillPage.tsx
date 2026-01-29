import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Typography,
  Row,
  Col,
  message,
  Divider,
  Empty,
} from "antd";
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/hooks";
import { useUserAccess } from "../../user/hooks/useUserAccess";
import { generateClient } from "aws-amplify/api";
import {
  createBillMutation,
  createBillItemMutation,
} from "../queries";
import { productsByCompanyQuery } from "../../products/queries";
import { APP_ROUTES } from "../../../constants/routes";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

type Product = {
  id: string;
  name: string;
  sku?: string | null;
  unitPrice?: number | null;
  unitCost?: number | null;
  isActive: boolean;
};

type BillItemForm = {
  productId?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
};

export function AddPurchaseBillPage() {
  const navigate = useNavigate();
  const { selectedCompany } = useAppSelector((state) => state.company);
  const { email: currentUserEmail } = useUserAccess();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<BillItemForm[]>([]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [productSelectOpenIndex, setProductSelectOpenIndex] = useState<number | null>(null);
  const addItemButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedCompany) {
      loadProducts();
      form.setFieldsValue({ billedAt: dayjs() });
    }
  }, [selectedCompany]);

  const loadProducts = async () => {
    if (!selectedCompany) return;
    try {
      const client = generateClient();
      const res = (await client.graphql({
        query: productsByCompanyQuery,
        variables: {
          companyId: selectedCompany.id,
          filter: { isActive: { eq: true } },
        },
        authMode: "userPool",
      })) as {
        data?: { productsByCompany?: { items: Product[] } };
      };
      setProducts(res.data?.productsByCompany?.items ?? []);
    } catch (e) {
      console.error(e);
    }
  };

  const addItem = () => {
    const newIndex = items.length;
    setItems([...items, {}]);
    setTimeout(() => {
      setProductSelectOpenIndex(newIndex);
      const container = document.querySelector(`[data-row-index="${newIndex}"]`);
      const selectInput = container?.querySelector(".ant-select-selector");
      if (selectInput instanceof HTMLElement) {
        selectInput.focus();
      }
    }, 80);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof BillItemForm, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    item[field] = value;

    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        item.unitPrice = product.unitCost ?? product.unitPrice ?? 0;
        if (!item.quantity) item.quantity = 1;
      }
    }

    if (field === "quantity" || field === "unitPrice") {
      const qty = item.quantity ?? 0;
      const price = item.unitPrice ?? 0;
      item.lineTotal = qty * price;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0);

  const handleSubmit = async (values: {
    billedAt: Dayjs;
    notes?: string;
  }) => {
    if (!selectedCompany) return;
    if (items.length === 0) {
      message.error("Please add at least one item");
      return;
    }

    setSubmitting(true);
    try {
      const client = generateClient();

      const billInput: any = {
        companyId: selectedCompany.id,
        billType: "PURCHASE",
        billedAt: values.billedAt.toISOString(),
        status: "DRAFT",
        totalAmount: totalAmount,
      };
      if (currentUserEmail) billInput.createdBy = currentUserEmail;
      if (values.notes?.trim()) billInput.notes = values.notes.trim();

      const billRes = (await client.graphql({
        query: createBillMutation,
        variables: { input: billInput },
        authMode: "userPool",
      })) as { data?: { createBill?: { id: string } } };

      const billId = billRes.data?.createBill?.id;
      if (!billId) throw new Error("Failed to create bill");

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.productId || !item.quantity || !item.unitPrice) continue;

        const itemInput: any = {
          billId,
          lineNumber: i + 1,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal ?? 0,
        };
        if (item.description?.trim()) itemInput.description = item.description.trim();

        await client.graphql({
          query: createBillItemMutation,
          variables: { input: itemInput },
          authMode: "userPool",
        });
      }

      message.success("Purchase bill created successfully");
      navigate(APP_ROUTES.billsPurchase);
    } catch (e: any) {
      console.error(e);
      message.error(e.message || "Failed to create purchase bill");
    } finally {
      setSubmitting(false);
    }
  };

  const itemColumns = [
    {
      title: "Product",
      key: "product",
      minWidth: 180,
      render: (_: unknown, _item: unknown, index: number) => (
        <div data-row-index={index}>
          <Select
            style={{ width: "100%", minWidth: 180 }}
            placeholder="Select product"
            showSearch
            optionFilterProp="label"
            value={items[index]?.productId}
            onChange={(v) => {
              updateItem(index, "productId", v);
              setProductSelectOpenIndex(null);
            }}
            onFocus={() => setProductSelectOpenIndex(index)}
            onBlur={() => setProductSelectOpenIndex(null)}
            open={productSelectOpenIndex === index}
            onDropdownVisibleChange={(open) => !open && setProductSelectOpenIndex(null)}
            options={products.map((p) => ({
              label: `${p.name}${p.sku ? ` (${p.sku})` : ""}`,
              value: p.id,
            }))}
          />
        </div>
      ),
    },
    {
      title: "Description",
      key: "description",
      minWidth: 120,
      render: (_: unknown, _item: unknown, index: number) => (
        <Input
          placeholder="Optional"
          value={items[index]?.description}
          onChange={(e) => updateItem(index, "description", e.target.value)}
        />
      ),
    },
    {
      title: "Qty",
      key: "quantity",
      width: 90,
      minWidth: 90,
      render: (_: unknown, _item: unknown, index: number) => (
        <InputNumber
          min={1}
          style={{ width: "100%" }}
          value={items[index]?.quantity}
          onChange={(v) => updateItem(index, "quantity", v ?? 1)}
        />
      ),
    },
    {
      title: "Unit Price (₹)",
      key: "unitPrice",
      width: 120,
      minWidth: 120,
      render: (_: unknown, _item: unknown, index: number) => (
        <InputNumber
          min={0}
          precision={2}
          style={{ width: "100%" }}
          value={items[index]?.unitPrice}
          onChange={(v) => updateItem(index, "unitPrice", v ?? 0)}
        />
      ),
    },
    {
      title: "Total (₹)",
      key: "lineTotal",
      width: 110,
      minWidth: 110,
      render: (_: unknown, _item: unknown, index: number) => (
        <Text strong>₹{Number(items[index]?.lineTotal ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 70,
      minWidth: 70,
      render: (_: unknown, _item: unknown, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(index)}
        />
      ),
    },
  ];

  if (!selectedCompany) {
    return (
      <Card>
        <Empty description="Please select a company" />
      </Card>
    );
  }

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(APP_ROUTES.billsPurchase)}
            >
              Back
            </Button>
          </Col>
          <Col flex={1}>
            <Title level={3} style={{ margin: 0 }}>
              Add Purchase Bill
            </Title>
          </Col>
        </Row>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="billedAt"
                label="Bill Date"
                rules={[{ required: true, message: "Please select bill date" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  open={datePickerOpen}
                  onOpenChange={setDatePickerOpen}
                  onFocus={() => setDatePickerOpen(true)}
                  autoFocus
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Total Amount">
                <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
                  ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Text>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Line Items</Divider>

          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <Table
                dataSource={items}
                columns={itemColumns}
                pagination={false}
                scroll={{ x: 720 }}
                rowKey={(_, index) => (index ?? 0).toString()}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4} align="right">
                        <Text strong>Grand Total:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                          ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} />
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>

            <Button
              ref={addItemButtonRef}
              type="primary"
              icon={<PlusOutlined />}
              onClick={addItem}
              block
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            >
              Add Product
            </Button>
          </Space>

          <Form.Item name="notes" label="Notes" style={{ marginTop: 24 }}>
            <TextArea rows={3} placeholder="Optional notes" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={items.length === 0}
              >
                Create Bill
              </Button>
              <Button onClick={() => navigate(APP_ROUTES.billsPurchase)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
}
