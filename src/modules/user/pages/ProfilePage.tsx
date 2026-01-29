import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Space,
  Typography,
  Spin,
  message,
} from "antd";
import { useUserAccess } from "../hooks/useUserAccess";
import { generateClient } from "aws-amplify/api";
import { getUserProfileQuery, createUserProfileMutation, updateUserProfileMutation } from "../queries";

const { Title, Text } = Typography;

type ProfileFormValues = {
  email: string;
  name?: string;
  phone?: string;
};

export function ProfilePage() {
  const { email: currentUserEmail } = useUserAccess();
  const [form] = Form.useForm<ProfileFormValues>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    if (currentUserEmail) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [currentUserEmail]);

  const loadProfile = async () => {
    if (!currentUserEmail) return;

    setLoading(true);
    setError(null);
    try {
      const client = generateClient();
      const response = (await client.graphql({
        query: getUserProfileQuery,
        variables: { email: currentUserEmail },
        authMode: "userPool",
      })) as {
        data?: {
          getUserProfile?: {
            email: string;
            name?: string | null;
            phone?: string | null;
          } | null;
        };
      };

      const profile = response.data?.getUserProfile;
      if (profile) {
        setProfileExists(true);
        form.setFieldsValue({
          email: profile.email,
          name: profile.name ?? undefined,
          phone: profile.phone ?? undefined,
        });
      } else {
        // Profile might not exist yet (e.g. first login) - show email only
        setProfileExists(false);
        form.setFieldsValue({
          email: currentUserEmail,
          name: undefined,
          phone: undefined,
        });
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile.");
      form.setFieldsValue({
        email: currentUserEmail ?? "",
        name: undefined,
        phone: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: ProfileFormValues) => {
    if (!currentUserEmail) return;

    setSubmitting(true);
    setError(null);
    try {
      const client = generateClient();
      const input = {
        email: currentUserEmail,
        name: values.name?.trim() || null,
        phone: values.phone?.trim() || null,
      };

      if (profileExists) {
        await client.graphql({
          query: updateUserProfileMutation,
          variables: { input },
          authMode: "userPool",
        });
        message.success("Profile updated successfully.");
      } else {
        await client.graphql({
          query: createUserProfileMutation,
          variables: { input },
          authMode: "userPool",
        });
        setProfileExists(true);
        message.success("Profile created successfully.");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      const messageText =
        err instanceof Error ? err.message : "Failed to save profile.";
      setError(messageText);
      message.error(messageText);
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUserEmail) {
    return (
      <Card>
        <Alert
          type="warning"
          message="Not signed in"
          description="Please sign in to view and edit your profile."
          showIcon
        />
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Loading profile...</Text>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: "100%", maxWidth: 520 }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Profile
          </Title>
          <Text type="secondary">View and update your account details.</Text>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Email is required." }]}
          >
            <Input disabled placeholder="Your email" />
          </Form.Item>

          <Form.Item label="Name" name="name">
            <Input placeholder="Your full name" allowClear />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input placeholder="Your phone number" allowClear />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ height: 44 }}
            >
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
}
