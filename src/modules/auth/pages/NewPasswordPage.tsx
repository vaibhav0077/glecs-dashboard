import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { confirmSignIn } from "aws-amplify/auth";
import { Alert, Button, Form, Input, message } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { AuthLayout } from "../components/AuthLayout";
import { APP_ROUTES } from "../../../constants/routes";

export function NewPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = useMemo(() => {
    if (location.state && typeof location.state === "object") {
      const state = location.state as { email?: string };
      return state.email ?? "";
    }
    return "";
  }, [location.state]);

  const onFinish = async (values: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await confirmSignIn({ challengeResponse: values.password });
      message.success("Password updated. You are logged in.");
      navigate(APP_ROUTES.dashboard, { replace: true });
    } catch (err) {
      const messageText =
        err instanceof Error ? err.message : "Unable to set a new password.";
      setError(messageText);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      {error ? <Alert type="error" message={error} showIcon /> : null}
      <Form
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{ email: initialEmail }}
      >
        <Form.Item label="Email" name="email">
          <Input prefix={<MailOutlined />} disabled />
        </Form.Item>
        <Form.Item
          label="New password"
          name="password"
          rules={[
            { required: true, message: "Enter a new password." },
            { min: 8, message: "Use at least 8 characters." },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
        </Form.Item>
        <Form.Item
          label="Confirm password"
          name="confirmPassword"
          dependencies={["password"]}
          rules={[{ required: true, message: "Confirm your new password." }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={submitting}>
          Update password
        </Button>
      </Form>
    </AuthLayout>
  );
}
