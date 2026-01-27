import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  List,
  Modal,
  Space,
  Typography,
  Empty,
  Spin,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/hooks";
import { generateClient } from "aws-amplify/api";
import {
  categoriesByCompanyQuery,
  createCategoryMutation,
  updateCategoryMutation,
  deleteCategoryMutation,
} from "../queries";

const { Title, Text } = Typography;

type Category = {
  id: string;
  name: string;
  description?: string | null;
};

export function CategoriesPage() {
  const { selectedCompany } = useAppSelector((state) => state.company);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedCompany) {
      loadCategories();
    }
  }, [selectedCompany]);

  const loadCategories = async () => {
    if (!selectedCompany) return;

    setLoading(true);
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
            nextToken?: string | null;
          } | null;
        };
      };

      const items = response.data?.categoriesByCompany?.items ?? [];
      setCategories(items);
    } catch (error) {
      console.error("Error loading categories:", error);
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { name: string; description?: string }) => {
    if (!selectedCompany) return;

    try {
      const client = generateClient();
      if (editingCategory) {
        await client.graphql({
          query: updateCategoryMutation,
          variables: {
            input: {
              id: editingCategory.id,
              name: values.name,
              description: values.description || undefined,
            },
          },
          authMode: "userPool",
        });
        message.success("Category updated successfully");
      } else {
        await client.graphql({
          query: createCategoryMutation,
          variables: {
            input: {
              companyId: selectedCompany.id,
              name: values.name,
              description: values.description || undefined,
            },
          },
          authMode: "userPool",
        });
        message.success("Category created successfully");
      }
      setModalOpen(false);
      form.resetFields();
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      message.error("Failed to save category");
    }
  };

  const handleDelete = async (category: Category) => {
    try {
      const client = generateClient();
      await client.graphql({
        query: deleteCategoryMutation,
        variables: {
          input: { id: category.id },
        },
        authMode: "userPool",
      });
      message.success("Category deleted successfully");
      loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      message.error("Failed to delete category");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
    });
    setModalOpen(true);
  };

  if (!selectedCompany) {
    return (
      <Card>
        <Empty description="No company selected. Please select a company to view categories." />
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <Title level={3}>Categories</Title>
              <Text type="secondary">Manage categories for {selectedCompany.name}</Text>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingCategory(null);
                form.resetFields();
                setModalOpen(true);
              }}
            >
              Add Category
            </Button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
            </div>
          ) : categories.length === 0 ? (
            <Card>
              <Empty
                description="No categories found. Add your first category to get started."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          ) : (
            <List
              dataSource={categories}
              renderItem={(category) => (
                <List.Item
                  actions={[
                    <Button key="edit" type="link" onClick={() => handleEdit(category)}>
                      Edit
                    </Button>,
                    <Button
                      key="delete"
                      type="link"
                      danger
                      onClick={() => handleDelete(category)}
                    >
                      Delete
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={<Text strong>{category.name}</Text>}
                    description={category.description || "No description"}
                  />
                </List.Item>
              )}
            />
          )}
        </Space>
      </Card>

      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setEditingCategory(null);
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Category Name"
            name="name"
            rules={[{ required: true, message: "Category name is required." }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              rows={3}
              placeholder="Enter category description (optional)"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCategory ? "Update" : "Create"}
              </Button>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  form.resetFields();
                  setEditingCategory(null);
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
