import type { ReactNode } from "react";
import { Card, Divider, Typography } from "antd";
import symbolGlecs from "../../../assets/SymbolGlecs.png";
import "../auth.css";

const { Title, Text } = Typography;

type AuthLayoutProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <Card className="auth-card" bordered={false}>
        <section className="auth-panel">
          <img
            src={symbolGlecs}
            alt="GLECS"
            className="auth-logo"
          />
          {title ? <Title level={3}>{title}</Title> : null}
          {subtitle ? <Text type="secondary">{subtitle}</Text> : null}
          {title || subtitle ? <Divider /> : null}
          {children}
        </section>
      </Card>
    </div>
  );
}
