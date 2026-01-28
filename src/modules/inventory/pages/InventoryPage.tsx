import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Space,
  Typography,
  Tag,
  Empty,
  Spin,
  Input,
  Divider,
} from "antd";
import { SearchOutlined, ShoppingOutlined, EditOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/hooks";
import { generateClient } from "aws-amplify/api";
import { productsByCompanyQuery } from "../../products/queries";
import { billsByCompanyQuery, billItemsByBillQuery } from "../../bills/queries";
import { APP_ROUTES } from "../../../constants/routes";

const { Title, Text } = Typography;
const { Search } = Input;

type Product = {
  id: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  unitPrice?: number | null;
  unitCost?: number | null;
  stockQuantity?: number | null;
  isActive: boolean;
  category?: { id: string; name: string } | null;
  subcategory?: { id: string; name: string } | null;
};

type BillItem = {
  productId?: string | null;
  quantity?: number | null;
};

export function InventoryPage() {
  const navigate = useNavigate();
  const { selectedCompany } = useAppSelector((state) => state.company);
  const [products, setProducts] = useState<Product[]>([]);
  const [soldByProductId, setSoldByProductId] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (selectedCompany?.id) {
      loadInventory();
    } else {
      setProducts([]);
      setSoldByProductId({});
      setLoading(false);
    }
  }, [selectedCompany?.id]);

  const loadInventory = async () => {
    if (!selectedCompany?.id) return;
    setLoading(true);
    try {
      const client = generateClient();

      const [productsRes, saleBillsRes] = await Promise.all([
        client.graphql({
          query: productsByCompanyQuery,
          variables: { companyId: selectedCompany.id },
          authMode: "userPool",
        }) as Promise<{ data?: { productsByCompany?: { items: Product[] } } }>,
        client.graphql({
          query: billsByCompanyQuery,
          variables: {
            companyId: selectedCompany.id,
            filter: { billType: { eq: "SALE" } },
            limit: 500,
          },
          authMode: "userPool",
        }) as Promise<{ data?: { billsByCompany?: { items: { id: string }[] } } }>,
      ]);

      const items = productsRes.data?.productsByCompany?.items ?? [];
      setProducts(items);

      const saleBills = saleBillsRes.data?.billsByCompany?.items ?? [];
      const sold: Record<string, number> = {};

      if (saleBills.length > 0) {
        const itemResults = await Promise.all(
          saleBills.map((bill) =>
            client.graphql({
              query: billItemsByBillQuery,
              variables: { billId: bill.id },
              authMode: "userPool",
            }) as Promise<{
              data?: { billItemsByBill?: { items: BillItem[] } };
            }>
          )
        );

        itemResults.forEach((res) => {
          const lineItems = res.data?.billItemsByBill?.items ?? [];
          lineItems.forEach((item) => {
            if (item.productId && item.quantity != null) {
              sold[item.productId] = (sold[item.productId] ?? 0) + item.quantity;
            }
          });
        });
      }

      setSoldByProductId(sold);
    } catch (e) {
      console.error(e);
      setProducts([]);
      setSoldByProductId({});
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      product.name.toLowerCase().includes(term) ||
      product.sku?.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term)
    );
  });

  if (!selectedCompany) {
    return (
      <Card>
        <Empty description="Select a company to view inventory." />
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
              Inventory
            </Title>
            <Text type="secondary">
              Stock and sales overview for {selectedCompany.name}
            </Text>
          </div>
        </div>

        <Search
          placeholder="Search by name, SKU, or description"
          allowClear
          prefix={<SearchOutlined />}
          style={{ maxWidth: 400 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <Spin size="large" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <Empty
              image={<ShoppingOutlined style={{ fontSize: 48, color: "#bfbfbf" }} />}
              description={
                products.length === 0
                  ? "No products yet. Add products to see inventory."
                  : "No products match your search."
              }
              imageStyle={{ height: 64 }}
            />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredProducts.map((product) => {
              const sold = soldByProductId[product.id] ?? 0;
              const stock = product.stockQuantity ?? 0;
              return (
                <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card
                    hoverable
                    actions={[
                      <span
                        key="edit"
                        onClick={() => navigate(`${APP_ROUTES.products}/edit/${product.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <EditOutlined /> Edit
                      </span>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Space>
                          <Text strong style={{ fontSize: 16 }}>
                            {product.name}
                          </Text>
                          {product.isActive ? (
                            <Tag color="green">Active</Tag>
                          ) : (
                            <Tag color="red">Inactive</Tag>
                          )}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small" style={{ width: "100%", marginTop: 8 }}>
                          {product.sku && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              SKU: {product.sku}
                            </Text>
                          )}
                          {product.description && (
                            <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                              {product.description}
                            </Text>
                          )}
                          <Space wrap>
                            {product.category && (
                              <Tag color="blue">{product.category.name}</Tag>
                            )}
                            {product.subcategory && (
                              <Tag color="cyan">{product.subcategory.name}</Tag>
                            )}
                          </Space>
                          <Divider style={{ margin: "8px 0", borderColor: "#f0f0f0" }} />
                          <Space direction="vertical" size={4} style={{ width: "100%" }}>
                            <Space>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Stock:
                              </Text>
                              <Text strong style={{ fontSize: 15, color: "#1890ff" }}>
                                {stock}
                              </Text>
                            </Space>
                            <Space>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Sold:
                              </Text>
                              <Text style={{ fontSize: 14 }}>{sold}</Text>
                            </Space>
                            {(product.unitPrice != null || product.unitCost != null) && (
                              <Space wrap>
                                {product.unitPrice != null && (
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    Price: ₹{Number(product.unitPrice).toFixed(2)}
                                  </Text>
                                )}
                                {product.unitCost != null && (
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    Cost: ₹{Number(product.unitCost).toFixed(2)}
                                  </Text>
                                )}
                              </Space>
                            )}
                          </Space>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Space>
    </Card>
  );
}

