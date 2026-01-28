import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Typography,
  message,
  Spin,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/hooks";
import { generateClient } from "aws-amplify/api";
import {
  updateProductMutation,
  getProductQuery,
  categoriesByCompanyQuery,
  subcategoriesByCategoryQuery,
} from "../queries";
import { APP_ROUTES } from "../../../constants/routes";

const { Title, Text } = Typography;

type Category = {
  id: string;
  name: string;
};

type Subcategory = {
  id: string;
  name: string;
  categoryId: string;
};

type Product = {
  id: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  unitPrice?: number | null;
  unitCost?: number | null;
  stockQuantity?: number | null;
  isActive: boolean;
  categoryId?: string | null;
  subcategoryId?: string | null;
};

export function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedCompany } = useAppSelector((state) => state.company);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();

  useEffect(() => {
    if (selectedCompany) {
      loadCategories();
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (id && selectedCompany) {
      loadProduct();
    }
  }, [id, selectedCompany]);

  useEffect(() => {
    if (selectedCategoryId) {
      loadSubcategories(selectedCategoryId);
    } else {
      setSubcategories([]);
      form.setFieldsValue({ subcategoryId: undefined });
    }
  }, [selectedCategoryId]);

  const loadProduct = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const client = generateClient();
      const response = (await client.graphql({
        query: getProductQuery,
        variables: { id },
        authMode: "userPool",
      })) as { data?: { getProduct?: Product | null } };

      const product = response.data?.getProduct;
      if (!product) {
        message.error("Product not found");
        navigate(APP_ROUTES.products);
        return;
      }

      // Set form values
      form.setFieldsValue({
        name: product.name,
        sku: product.sku || undefined,
        description: product.description || undefined,
        unitPrice: product.unitPrice ?? 0,
        unitCost: product.unitCost || undefined,
        stockQuantity: product.stockQuantity || undefined,
        categoryId: product.categoryId || undefined,
        subcategoryId: product.subcategoryId || undefined,
        isActive: product.isActive ?? true,
      });

      if (product.categoryId) {
        setSelectedCategoryId(product.categoryId);
      }
    } catch (error) {
      console.error("Error loading product:", error);
      message.error("Failed to load product");
      navigate(APP_ROUTES.products);
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

  const handleSubmit = async (values: {
    name: string;
    sku?: string;
    description?: string;
    unitPrice?: number;
    unitCost?: number;
    stockQuantity?: number;
    isActive: boolean;
    categoryId?: string;
    subcategoryId?: string;
  }) => {
    if (!selectedCompany || !id) return;

    setSubmitting(true);
    setError(null);

    try {
      const client = generateClient();
      await client.graphql({
        query: updateProductMutation,
        variables: {
          input: {
            id: id,
            companyId: selectedCompany.id,
            name: values.name,
            sku: values.sku || undefined,
            description: values.description || undefined,
            unitPrice: values.unitPrice ?? 0,
            unitCost: values.unitCost || undefined,
            stockQuantity: values.stockQuantity || undefined,
            isActive: values.isActive ?? true,
            categoryId: values.categoryId || undefined,
            subcategoryId: values.subcategoryId || undefined,
          },
        },
        authMode: "userPool",
      });

      message.success("Product updated successfully!");
      navigate(APP_ROUTES.products);
    } catch (err) {
      const messageText =
        err instanceof Error ? err.message : "Failed to update product.";
      setError(messageText);
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedCompany) {
    return (
      <Card>
        <Alert
          message="No company selected"
          description="Please select a company to edit products."
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Loading product...</Text>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(APP_ROUTES.products)}
            style={{ marginBottom: 16 }}
          >
            Back to Products
          </Button>
          <Title level={3}>Edit Product</Title>
          <Text type="secondary">Update product details for {selectedCompany.name}</Text>
        </div>

        {error ? (
          <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
        ) : null}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            label="Product Name"
            name="name"
            rules={[{ required: true, message: "Product name is required." }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item label="SKU" name="sku">
            <Input placeholder="Enter SKU (optional)" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              rows={3}
              placeholder="Enter product description (optional)"
            />
          </Form.Item>

          <Space style={{ width: "100%" }}>
            <Form.Item
              label="Unit Price"
              name="unitPrice"
              rules={[{ required: true, message: "Unit price is required." }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                step={0.01}
                prefix="₹"
                style={{ width: "100%" }}
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item label="Unit Cost" name="unitCost" style={{ flex: 1 }}>
              <InputNumber
                min={0}
                step={0.01}
                prefix="₹"
                style={{ width: "100%" }}
                placeholder="0.00 (optional)"
              />
            </Form.Item>
          </Space>

          <Form.Item label="Stock Quantity" name="stockQuantity">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Enter stock quantity (optional)"
            />
          </Form.Item>

          <Form.Item
            label="Category"
            name="categoryId"
            tooltip="Optional: Select a category"
          >
            <Select
              placeholder="Select a category (optional)"
              allowClear
              onChange={(value) => {
                setSelectedCategoryId(value);
                form.setFieldsValue({ subcategoryId: undefined });
              }}
            >
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Subcategory"
            name="subcategoryId"
            tooltip="Optional: Select a subcategory (requires category)"
          >
            <Select
              placeholder={
                selectedCategoryId
                  ? "Select a subcategory (optional)"
                  : "Select a category first"
              }
              allowClear
              disabled={!selectedCategoryId}
            >
              {subcategories.map((subcat) => (
                <Select.Option key={subcat.id} value={subcat.id}>
                  {subcat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Status"
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                style={{ height: 44 }}
              >
                Update Product
              </Button>
              <Button onClick={() => navigate(APP_ROUTES.products)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
}
