import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resetPassword } from "aws-amplify/auth";
import { Alert, Button, Divider, Form, Input, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { AuthLayout } from "../components/AuthLayout";
import { AUTH_ROUTES } from "../../../constants/routes";

export function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string }) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await resetPassword({ username: values.email.trim() });
      if (response.nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") {
        message.success("Verification code sent. Check your email.");
        navigate(AUTH_ROUTES.resetPassword, { state: { email: values.email.trim() } });
      } else {
        message.info("Follow the instructions sent to your email.");
      }
    } catch (err) {
      const messageText =
        err instanceof Error ? err.message : "Unable to send reset code.";
      setError(messageText);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="We will send a verification code to reset your password."
    >
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
        <Button type="primary" htmlType="submit" block loading={submitting}>
          Send reset code
        </Button>
      </Form>
      <Divider />
      <Link to={AUTH_ROUTES.login}>Back to login</Link>
    </AuthLayout>
  );
}
