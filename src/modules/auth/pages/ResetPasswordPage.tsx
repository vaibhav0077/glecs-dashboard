import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { confirmResetPassword } from "aws-amplify/auth";
import { Alert, Button, Divider, Form, Input, message } from "antd";
import { KeyOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { AuthLayout } from "../components/AuthLayout";
import { AUTH_ROUTES } from "../../../constants/routes";

export function ResetPasswordPage() {
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
    code: string;
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
      await confirmResetPassword({
        username: values.email.trim(),
        confirmationCode: values.code.trim(),
        newPassword: values.password,
      });
      message.success("Password updated. You can log in now.");
      navigate(AUTH_ROUTES.login);
    } catch (err) {
      const messageText =
        err instanceof Error ? err.message : "Unable to reset password.";
      setError(messageText);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter the verification code and set a new password."
    >
      {error ? <Alert type="error" message={error} showIcon /> : null}
      <Form
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{ email: initialEmail }}
      >
        <Form.Item
          label="Work email"
          name="email"
          rules={[
            { required: true, message: "Enter your email." },
            { type: "email", message: "Use a valid email." },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="name@company.com" />
        </Form.Item>
        <Form.Item
          label="Verification code"
          name="code"
          rules={[{ required: true, message: "Enter the code from email." }]}
        >
          <Input prefix={<KeyOutlined />} placeholder="123456" />
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
      <Divider />
      <Link to={AUTH_ROUTES.login}>Back to login</Link>
    </AuthLayout>
  );
}
