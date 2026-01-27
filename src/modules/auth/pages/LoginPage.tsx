import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "aws-amplify/auth";
import { Alert, Button, Checkbox, Divider, Form, Input, Typography, message } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { AuthLayout } from "../components/AuthLayout";
import { AUTH_COPY } from "../constants";
import { APP_ROUTES, AUTH_ROUTES } from "../../../constants/routes";

const { Text } = Typography;

export function LoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await signIn({
        username: values.email.trim(),
        password: values.password,
      });
      if (response.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        navigate(AUTH_ROUTES.newPassword, { state: { email: values.email.trim() } });
        return;
      }
      message.success("Login successful.");
      navigate(APP_ROUTES.dashboard, { replace: true });
    } catch (err) {
      const messageText =
        err instanceof Error ? err.message : "Unable to login. Please try again.";
      setError(messageText);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      {error ? <Alert type="error" message={error} showIcon /> : null}
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
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
          label="Password"
          name="password"
          rules={[{ required: true, message: "Enter your password." }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
        </Form.Item>
        <div className="auth-row">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <Link to={AUTH_ROUTES.forgotPassword}>Forgot password?</Link>
        </div>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={submitting}
          className="auth-submit"
        >
          Log in
        </Button>
      </Form>
      <Divider />
      <Text type="secondary">{AUTH_COPY.supportNote}</Text>
    </AuthLayout>
  );
}
