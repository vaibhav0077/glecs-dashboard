import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  List,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  Empty,
  Spin,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/hooks";
import { generateClient } from "aws-amplify/api";
import {
  subcategoriesByCompanyQuery,
  categoriesByCompanyQuery,
  createSubcategoryMutation,
  updateSubcategoryMutation,
  deleteSubcategoryMutation,
} from "../queries";

const { Title, Text } = Typography;

type Category = {
  id: string;
  name: string;
};

type Subcategory = {
  id: string;
  name: string;
  description?: string | null;
  categoryId: string;
  category?: { id: string; name: string } | null;
};

export function SubcategoriesPage() {
  const { selectedCompany } = useAppSelector((state) => state.company);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedCompany) {
      loadCategories();
      loadSubcategories();
    }
  }, [selectedCompany]);

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

  const loadSubcategories = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const client = generateClient();
      const response = (await client.graphql({
        query: subcategoriesByCompanyQuery,
        variables: {
          companyId: selectedCompany.id,
        },
        authMode: "userPool",
      })) as {
        data?: {
          subcategoriesByCompany?: {
            items?: Subcategory[] | null;
            nextToken?: string | null;
          } | null;
        };
      };

      const items = response.data?.subcategoriesByCompany?.items ?? [];
      setSubcategories(items);
    } catch (error) {
      console.error("Error loading subcategories:", error);
      message.error("Failed to load subcategories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: {
    name: string;
    description?: string;
    categoryId: string;
  }) => {
    if (!selectedCompany) return;

    try {
      const client = generateClient();
      if (editingSubcategory) {
        await client.graphql({
          query: updateSubcategoryMutation,
          variables: {
            input: {
              id: editingSubcategory.id,
              name: values.name,
              description: values.description || undefined,
              categoryId: values.categoryId,
            },
          },
          authMode: "userPool",
        });
        message.success("Subcategory updated successfully");
      } else {
        await client.graphql({
          query: createSubcategoryMutation,
          variables: {
            input: {
              companyId: selectedCompany.id,
              categoryId: values.categoryId,
              name: values.name,
              description: values.description || undefined,
            },
          },
          authMode: "userPool",
        });
        message.success("Subcategory created successfully");
      }
      setModalOpen(false);
      form.resetFields();
      setEditingSubcategory(null);
      loadSubcategories();
    } catch (error) {
      console.error("Error saving subcategory:", error);
      message.error("Failed to save subcategory");
    }
  };

  const handleDelete = async (subcategory: Subcategory) => {
    try {
      const client = generateClient();
      await client.graphql({
        query: deleteSubcategoryMutation,
        variables: {
          input: { id: subcategory.id },
        },
        authMode: "userPool",
      });
      message.success("Subcategory deleted successfully");
      loadSubcategories();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      message.error("Failed to delete subcategory");
    }
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    form.setFieldsValue({
      name: subcategory.name,
      description: subcategory.description,
      categoryId: subcategory.categoryId,
    });
    setModalOpen(true);
  };

  if (!selectedCompany) {
    return (
      <Card>
        <Empty description="No company selected. Please select a company to view subcategories." />
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
              <Title level={3}>Subcategories</Title>
              <Text type="secondary">Manage subcategories for {selectedCompany.name}</Text>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                if (categories.length === 0) {
                  message.warning("Please create a category first");
                  return;
                }
                setEditingSubcategory(null);
                form.resetFields();
                setModalOpen(true);
              }}
            >
              Add Subcategory
            </Button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
            </div>
          ) : subcategories.length === 0 ? (
            <Card>
              <Empty
                description="No subcategories found. Add your first subcategory to get started."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          ) : (
            <List
              dataSource={subcategories}
              renderItem={(subcategory) => (
                <List.Item
                  actions={[
                    <Button
                      key="edit"
                      type="link"
                      onClick={() => handleEdit(subcategory)}
                    >
                      Edit
                    </Button>,
                    <Button
                      key="delete"
                      type="link"
                      danger
                      onClick={() => handleDelete(subcategory)}
                    >
                      Delete
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{subcategory.name}</Text>
                        {subcategory.category && (
                          <Tag>{subcategory.category.name}</Tag>
                        )}
                      </Space>
                    }
                    description={subcategory.description || "No description"}
                  />
                </List.Item>
              )}
            />
          )}
        </Space>
      </Card>

      <Modal
        title={editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setEditingSubcategory(null);
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Category"
            name="categoryId"
            rules={[{ required: true, message: "Category is required." }]}
          >
            <Select placeholder="Select a category">
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Subcategory Name"
            name="name"
            rules={[{ required: true, message: "Subcategory name is required." }]}
          >
            <Input placeholder="Enter subcategory name" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              rows={3}
              placeholder="Enter subcategory description (optional)"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingSubcategory ? "Update" : "Create"}
              </Button>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  form.resetFields();
                  setEditingSubcategory(null);
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
