import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Space,
  Typography,
  message,
  Spin,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store/hooks";
import { generateClient } from "aws-amplify/api";
import {
  getCustomerQuery,
  updateCustomerMutation,
} from "../queries";
import { APP_ROUTES } from "../../../constants/routes";

const { Title, Text } = Typography;

type Customer = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  notes?: string | null;
};

export function EditCustomerPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedCompany } = useAppSelector((state) => state.company);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && selectedCompany) {
      loadCustomer();
    }
  }, [id, selectedCompany]);

  const loadCustomer = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const client = generateClient();
      const response = (await client.graphql({
        query: getCustomerQuery,
        variables: { id },
        authMode: "userPool",
      })) as { data?: { getCustomer?: Customer | null } };

      const customer = response.data?.getCustomer;
      if (!customer) {
        message.error("Customer not found");
        navigate(APP_ROUTES.customers);
        return;
      }

      // Set form values
      form.setFieldsValue({
        name: customer.name,
        email: customer.email || undefined,
        phone: customer.phone || undefined,
        addressLine1: customer.addressLine1 || undefined,
        addressLine2: customer.addressLine2 || undefined,
        city: customer.city || undefined,
        state: customer.state || undefined,
        postalCode: customer.postalCode || undefined,
        country: customer.country || undefined,
        notes: customer.notes || undefined,
      });
    } catch (error) {
      console.error("Error loading customer:", error);
      message.error("Failed to load customer");
      navigate(APP_ROUTES.customers);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: {
    name: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    notes?: string;
  }) => {
    if (!selectedCompany || !id) return;

    setSubmitting(true);
    setError(null);

    try {
      const client = generateClient();
      
      // Build input object, only including fields with actual values
      const input: any = {
        id: id,
        companyId: selectedCompany.id,
        name: values.name,
      };

      // Only add optional fields if they have non-empty values
      if (values.email && values.email.trim()) {
        input.email = values.email.trim();
      }
      if (values.phone && values.phone.trim()) {
        input.phone = values.phone.trim();
      }
      if (values.addressLine1 && values.addressLine1.trim()) {
        input.addressLine1 = values.addressLine1.trim();
      }
      if (values.addressLine2 && values.addressLine2.trim()) {
        input.addressLine2 = values.addressLine2.trim();
      }
      if (values.city && values.city.trim()) {
        input.city = values.city.trim();
      }
      if (values.state && values.state.trim()) {
        input.state = values.state.trim();
      }
      if (values.postalCode && values.postalCode.trim()) {
        input.postalCode = values.postalCode.trim();
      }
      if (values.country && values.country.trim()) {
        input.country = values.country.trim();
      }
      if (values.notes && values.notes.trim()) {
        input.notes = values.notes.trim();
      }

      await client.graphql({
        query: updateCustomerMutation,
        variables: {
          input,
        },
        authMode: "userPool",
      });

      message.success("Customer updated successfully!");
      navigate(APP_ROUTES.customers);
    } catch (err) {
      const messageText =
        err instanceof Error ? err.message : "Failed to update customer.";
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
          description="Please select a company to edit customers."
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
            <Text>Loading customer...</Text>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(APP_ROUTES.customers)}
            style={{ marginBottom: 16 }}
          >
            Back to Customers
          </Button>
          <Title level={3}>Edit Customer</Title>
          <Text type="secondary">Update customer details for {selectedCompany.name}</Text>
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
            label="Customer Name"
            name="name"
            rules={[{ required: true, message: "Customer name is required." }]}
          >
            <Input placeholder="Enter customer name" />
          </Form.Item>

          <Space style={{ width: "100%" }} align="start">
            <Form.Item
              label="Email"
              name="email"
              rules={[{ type: "email", message: "Please enter a valid email." }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="customer@example.com (optional)" />
            </Form.Item>

            <Form.Item
              label="Phone"
              name="phone"
              style={{ flex: 1 }}
            >
              <Input placeholder="Enter phone number (optional)" />
            </Form.Item>
          </Space>

          <Form.Item label="Address Line 1" name="addressLine1">
            <Input placeholder="Enter address (optional)" />
          </Form.Item>

          <Form.Item label="Address Line 2" name="addressLine2">
            <Input placeholder="Enter address line 2 (optional)" />
          </Form.Item>

          <Space style={{ width: "100%" }} align="start">
            <Form.Item label="City" name="city" style={{ flex: 1 }}>
              <Input placeholder="Enter city (optional)" />
            </Form.Item>

            <Form.Item label="State" name="state" style={{ flex: 1 }}>
              <Input placeholder="Enter state (optional)" />
            </Form.Item>
          </Space>

          <Space style={{ width: "100%" }} align="start">
            <Form.Item label="Postal Code" name="postalCode" style={{ flex: 1 }}>
              <Input placeholder="Enter postal code (optional)" />
            </Form.Item>

            <Form.Item label="Country" name="country" style={{ flex: 1 }}>
              <Input placeholder="Enter country (optional)" />
            </Form.Item>
          </Space>

          <Form.Item label="Notes" name="notes">
            <Input.TextArea
              rows={3}
              placeholder="Enter any additional notes about the customer (optional)"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                style={{ height: 44 }}
              >
                Update Customer
              </Button>
              <Button onClick={() => navigate(APP_ROUTES.customers)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
}
