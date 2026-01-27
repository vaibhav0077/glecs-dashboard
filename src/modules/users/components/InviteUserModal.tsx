import { useState } from "react";
import { Alert, Button, Form, Input, Modal, Select, message } from "antd";
import { useAppSelector } from "../../../store/hooks";
import { fetchAuthSession } from "aws-amplify/auth";
import awsExports from "../../../aws-exports";

type InviteUserModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type InviteUserFormValues = {
  email: string;
  name?: string;
  role: "ADMIN" | "SUPERADMIN" | "STAFF" | "VAIBHAV";
};

export function InviteUserModal({ open, onClose, onSuccess }: InviteUserModalProps) {
  const { selectedCompany } = useAppSelector((state) => state.company);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getApiUrl = (): string => {
    // Get REST API URL from aws-exports
    const apiConfig = (awsExports as any)?.aws_cloud_logic_custom?.find(
      (api: any) => api.name === "glecsrestapi"
    );
    
    if (apiConfig?.endpoint) {
      return `${apiConfig.endpoint}/auth/inviteUser`;
    }
    
    throw new Error("REST API endpoint not found in configuration");
  };

  const handleSubmit = async (values: InviteUserFormValues) => {
    if (!selectedCompany) {
      setError("No company selected");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Get API URL
      const apiUrl = getApiUrl();
      
      // Get authentication session to get ID token
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      
      if (!idToken) {
        throw new Error("No authentication token available. Please log in again.");
      }

      // Prepare the request
      const requestBody = {
        email: values.email.trim(),
        companyId: selectedCompany.id,
        name: values.name?.trim() || undefined,
        role: values.role,
      };

      // Make the API call with Cognito ID token
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API request failed with status ${response.status}`);
      }

      message.success("User invited successfully!");
      form.resetFields();
      onSuccess();
      onClose();
    } catch (err) {
      const messageText =
        err instanceof Error ? err.message : "Failed to invite user.";
      setError(messageText);
      console.error("Error inviting user:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setError(null);
    onClose();
  };

  if (!selectedCompany) {
    return null;
  }

  return (
    <Modal
      title="Invite User"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      {error ? (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
      ) : null}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        initialValues={{ role: "STAFF" }}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Email is required." },
            { type: "email", message: "Please enter a valid email address." },
          ]}
        >
          <Input placeholder="user@example.com" />
        </Form.Item>

        <Form.Item label="Name" name="name">
          <Input placeholder="User's full name (optional)" />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Role is required." }]}
        >
          <Select>
            <Select.Option value="STAFF">Staff</Select.Option>
            <Select.Option value="ADMIN">Admin</Select.Option>
            <Select.Option value="SUPERADMIN">Super Admin</Select.Option>
            <Select.Option value="VAIBHAV">Vaibhav</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={submitting}
            style={{ height: 44 }}
          >
            Invite User
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
