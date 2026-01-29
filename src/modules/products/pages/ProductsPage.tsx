import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Input,
  Modal,
  Row,
  Col,
  Space,
  Tag,
  Typography,
  Empty,
  Spin,
  Select,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined, SearchOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/hooks";
import { generateClient } from "aws-amplify/api";
import {
  productsByCompanyQuery,
  categoriesByCompanyQuery,
  subcategoriesByCategoryQuery,
  deleteProductMutation,
} from "../queries";
import { APP_ROUTES } from "../../../constants/routes";
import { useUserAccess } from "../../user/hooks/useUserAccess";

const { Title, Text } = Typography;
const { Search } = Input;

type Product = {
  id: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  unitPrice?: number | null;
  unitCost?: number | null;
  isActive: boolean;
  categoryId?: string | null;
  subcategoryId?: string | null;
  category?: { id: string; name: string } | null;
  subcategory?: { id: string; name: string } | null;
};

type Category = {
  id: string;
  name: string;
};

type Subcategory = {
  id: string;
  name: string;
  categoryId: string;
};

export function ProductsPage() {
  const navigate = useNavigate();
  const { selectedCompany } = useAppSelector((state) => state.company);
  const { canSeeProductPriceAndActions } = useUserAccess();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [subcategoryFilter, setSubcategoryFilter] = useState<string | undefined>();

  useEffect(() => {
    if (selectedCompany) {
      loadProducts();
      loadCategories();
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (categoryFilter) {
      loadSubcategories(categoryFilter);
    } else {
      setSubcategories([]);
      setSubcategoryFilter(undefined);
    }
  }, [categoryFilter]);

  const loadProducts = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const client = generateClient();
      const response = (await client.graphql({
        query: productsByCompanyQuery,
        variables: {
          companyId: selectedCompany.id,
        },
        authMode: "userPool",
      })) as {
        data?: {
          productsByCompany?: {
            items?: Product[] | null;
            nextToken?: string | null;
          } | null;
        };
      };

      const items = response.data?.productsByCompany?.items ?? [];
      setProducts(items);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    if (!selectedCompany) return;

    try {
      const client = generateClient();
      const response = (await client.graphql({
        query: categoriesByCompanyQuery,
        variables: {
          companyId: selectedCompany.id,
        },
        authMode: "userPool",
      })) as {
        data?: {
          categoriesByCompany?: {
            items?: Category[] | null;
          } | null;
        };
      };

      const items = response.data?.categoriesByCompany?.items ?? [];
      setCategories(items);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadSubcategories = async (categoryId: string) => {
    try {
      const client = generateClient();
      const response = (await client.graphql({
        query: subcategoriesByCategoryQuery,
        variables: {
          categoryId: categoryId,
        },
        authMode: "userPool",
      })) as {
        data?: {
          subcategoriesByCategory?: {
            items?: Subcategory[] | null;
          } | null;
        };
      };

      const items = response.data?.subcategoriesByCategory?.items ?? [];
      setSubcategories(items);
    } catch (error) {
      console.error("Error loading subcategories:", error);
    }
  };

  const handleDelete = (product: Product) => {
    Modal.confirm({
      title: "Delete Product",
      content: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const client = generateClient();
          await client.graphql({
            query: deleteProductMutation,
            variables: {
              input: { id: product.id },
            },
            authMode: "userPool",
          });
          message.success("Product deleted successfully");
          loadProducts(); // Refresh the list
        } catch (error) {
          console.error("Error deleting product:", error);
          message.error("Failed to delete product");
        }
      },
    });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && product.isActive) ||
      (statusFilter === "inactive" && !product.isActive);

    const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;

    const matchesSubcategory =
      !subcategoryFilter || product.subcategoryId === subcategoryFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesSubcategory;
  });

  if (!selectedCompany) {
    return (
      <Card>
        <Empty description="No company selected. Please select a company to view products." />
      </Card>
    );
  }

  return (
    <Card>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
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
              Products
            </Title>
            <Text type="secondary">Manage products for {selectedCompany.name}</Text>
          </div>
          {canSeeProductPriceAndActions && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`${APP_ROUTES.products}/add`)}
              style={{ flexShrink: 0 }}
            >
              Add Product
            </Button>
          )}
        </div>

        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Search
            placeholder="Search products by name, SKU, or description"
            allowClear
            style={{ width: "100%" }}
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={loadProducts}
          />
          <Space wrap style={{ width: "100%" }}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%", minWidth: 120 }}
              options={[
                { label: "All", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
            <Select
              value={categoryFilter}
              onChange={(value) => {
                setCategoryFilter(value);
                setSubcategoryFilter(undefined);
              }}
              placeholder="Filter by category"
              allowClear
              style={{ width: "100%", minWidth: 150 }}
              options={categories.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
            />
            <Select
              value={subcategoryFilter}
              onChange={setSubcategoryFilter}
              placeholder="Filter by subcategory"
              allowClear
              disabled={!categoryFilter}
              style={{ width: "100%", minWidth: 150 }}
              options={subcategories.map((subcat) => ({
                label: subcat.name,
                value: subcat.id,
              }))}
            />
          </Space>
        </Space>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <Empty
              description={
                products.length === 0
                  ? "No products found. Add your first product to get started."
                  : "No products match your filters."
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredProducts.map((product) => (
              <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card
                  hoverable
                  actions={
                    canSeeProductPriceAndActions
                      ? [
                          <Button
                            key="edit"
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`${APP_ROUTES.products}/edit/${product.id}`)}
                          >
                            Edit
                          </Button>,
                          <Popconfirm
                            key="delete"
                            title="Delete Product"
                            description={`Are you sure you want to delete "${product.name}"?`}
                            onConfirm={() => handleDelete(product)}
                            okText="Delete"
                            okType="danger"
                            cancelText="Cancel"
                          >
                            <Button
                              type="link"
                              danger
                              icon={<DeleteOutlined />}
                            >
                              Delete
                            </Button>
                          </Popconfirm>,
                        ]
                      : undefined
                  }
                >
                  <Card.Meta
                    title={
                      <Space>
                        <Text strong style={{ fontSize: 16 }}>{product.name}</Text>
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
                        {canSeeProductPriceAndActions &&
                          product.unitPrice !== null &&
                          product.unitPrice !== undefined && (
                            <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
                              ₹{product.unitPrice.toFixed(2)}
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
