import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Spin,
  Empty,
} from "antd";
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/hooks";
import { generateClient } from "aws-amplify/api";
import {
  getBillQuery,
  billItemsByBillQuery,
  updateBillMutation,
  createBillItemMutation,
  updateBillItemMutation,
  deleteBillItemMutation,
} from "../queries";
import { productsByCompanyQuery } from "../../products/queries";
import { customersByCompanyQuery } from "../../customers/queries";
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

type Customer = {
  id: string;
  name: string;
  email?: string | null;
};

type BillItemForm = {
  id?: string;
  productId?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
  lineNumber?: number;
};

type BillItem = {
  id: string;
  productId?: string | null;
  description?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  lineTotal?: number | null;
  lineNumber: number;
};

export function EditSalesBillPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedCompany } = useAppSelector((state) => state.company);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<BillItemForm[]>([]);
  const [existingItemIds, setExistingItemIds] = useState<Set<string>>(new Set());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [productSelectOpenIndex, setProductSelectOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedCompany && id) {
      loadData();
    }
  }, [selectedCompany, id]);

  const loadData = async () => {
    if (!selectedCompany || !id) return;
    setLoading(true);
    try {
      const client = generateClient();
      await Promise.all([loadProducts(), loadCustomers(), loadBill()]);
    } catch (e) {
      console.error(e);
      message.error("Failed to load bill data");
    } finally {
      setLoading(false);
    }
  };

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

  const loadCustomers = async () => {
    if (!selectedCompany) return;
    try {
      const client = generateClient();
      const res = (await client.graphql({
        query: customersByCompanyQuery,
        variables: { companyId: selectedCompany.id },
        authMode: "userPool",
      })) as {
        data?: { customersByCompany?: { items: Customer[] } };
      };
      setCustomers(res.data?.customersByCompany?.items ?? []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadBill = async () => {
    if (!id) return;
    try {
      const client = generateClient();
      const [billRes, itemsRes] = await Promise.all([
        client.graphql({
          query: getBillQuery,
          variables: { id },
          authMode: "userPool",
        }) as Promise<{
          data?: {
            getBill?: {
              id: string;
              billedAt: string;
              customerId?: string | null;
              notes?: string | null;
            };
          };
        }>,
        client.graphql({
          query: billItemsByBillQuery,
          variables: { billId: id },
          authMode: "userPool",
        }) as Promise<{
          data?: { billItemsByBill?: { items: BillItem[] } };
        }>,
      ]);

      const bill = billRes.data?.getBill;
      if (!bill) {
        message.error("Bill not found");
        navigate(APP_ROUTES.billsSales);
        return;
      }

      form.setFieldsValue({
        billedAt: dayjs(bill.billedAt),
        customerId: bill.customerId,
        notes: bill.notes,
      });

      const lineItems = itemsRes.data?.billItemsByBill?.items ?? [];
      const formattedItems: BillItemForm[] = lineItems
        .sort((a, b) => a.lineNumber - b.lineNumber)
        .map((item) => ({
          id: item.id,
          productId: item.productId ?? undefined,
          description: item.description ?? undefined,
          quantity: item.quantity ?? undefined,
          unitPrice: item.unitPrice ?? undefined,
          lineTotal: item.lineTotal ?? undefined,
          lineNumber: item.lineNumber,
        }));

      setItems(formattedItems);
      setExistingItemIds(new Set(formattedItems.map((item) => item.id!).filter(Boolean)));
    } catch (e) {
      console.error(e);
      message.error("Failed to load bill");
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
        item.unitPrice = product.unitPrice ?? 0;
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
    customerId?: string;
    notes?: string;
  }) => {
    if (!selectedCompany || !id) return;
    if (items.length === 0) {
      message.error("Please add at least one item");
      return;
    }

    setSubmitting(true);
    try {
      const client = generateClient();

      const billInput: any = {
        id,
        companyId: selectedCompany.id,
        billType: "SALE",
        billedAt: values.billedAt.toISOString(),
        status: "DRAFT",
        totalAmount: totalAmount,
      };
      if (values.customerId) billInput.customerId = values.customerId;
      if (values.notes?.trim()) billInput.notes = values.notes.trim();

      await client.graphql({
        query: updateBillMutation,
        variables: { input: billInput },
        authMode: "userPool",
      });

      const itemsToDelete = new Set(existingItemIds);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.productId || !item.quantity || !item.unitPrice) continue;

        const itemInput: any = {
          billId: id,
          lineNumber: i + 1,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal ?? 0,
        };
        if (item.description?.trim()) itemInput.description = item.description.trim();

        if (item.id && existingItemIds.has(item.id)) {
          itemInput.id = item.id;
          await client.graphql({
            query: updateBillItemMutation,
            variables: { input: itemInput },
            authMode: "userPool",
          });
          itemsToDelete.delete(item.id);
        } else {
          await client.graphql({
            query: createBillItemMutation,
            variables: { input: itemInput },
            authMode: "userPool",
          });
        }
      }

      for (const itemId of itemsToDelete) {
        await client.graphql({
          query: deleteBillItemMutation,
          variables: { input: { id: itemId } },
          authMode: "userPool",
        });
      }

      message.success("Sales bill updated successfully");
      navigate(APP_ROUTES.billsSales);
    } catch (e: any) {
      console.error(e);
      message.error(e.message || "Failed to update sales bill");
    } finally {
      setSubmitting(false);
    }
  };

  const itemColumns = [
    {
      title: "Product",
      key: "product",
      render: (_: unknown, _item: unknown, index: number) => (
        <div data-row-index={index}>
          <Select
            style={{ width: "100%", minWidth: 200 }}
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
      width: 100,
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
      width: 130,
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
      width: 120,
      render: (_: unknown, _item: unknown, index: number) => (
        <Text strong>
          ₹{Number(items[index]?.lineTotal ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
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

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spin size="large" />
        </div>
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
              onClick={() => navigate(APP_ROUTES.billsSales)}
            >
              Back
            </Button>
          </Col>
          <Col flex={1}>
            <Title level={3} style={{ margin: 0 }}>
              Edit Sales Bill
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
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="customerId" label="Customer">
                <Select
                  placeholder="Select customer"
                  showSearch
                  optionFilterProp="label"
                  allowClear
                  open={customerSelectOpen}
                  onDropdownVisibleChange={setCustomerSelectOpen}
                  onFocus={() => setCustomerSelectOpen(true)}
                  options={customers.map((c) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Form.Item label="Total Amount">
                <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
                  ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Text>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Line Items</Divider>

          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div style={{ overflowX: "auto" }}>
              <Table
                dataSource={items}
                columns={itemColumns}
                pagination={false}
                rowKey={(_, index) => items[index ?? 0]?.id ?? (index ?? 0).toString()}
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
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addItem}
              block
            >
              Add Item
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
                Update Bill
              </Button>
              <Button onClick={() => navigate(APP_ROUTES.billsSales)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
}
