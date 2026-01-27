import { useState } from "react";
import { Button, Card, Space, Typography } from "antd";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { useUserAccess } from "../user/hooks/useUserAccess";
import { CreateCompanyModal } from "../company/components/CreateCompanyModal";
import { APP_ROUTES } from "../../constants/routes";
import { useAppDispatch } from "../../store/hooks";
import { clearCompany } from "../../store/slices/companySlice";

const { Title, Text } = Typography;

export function NoCompanyPage() {
    const dispatch = useAppDispatch();
    const { isAdmin } = useUserAccess();
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);

    const handleCompanyCreated = () => {
        // Refresh the page to reload user data and redirect to dashboard
        window.location.href = APP_ROUTES.dashboard;
    };

    return (
        <>
            <Card>
                <Title level={3}>No company assigned</Title>
                <Text>
                    You are not part of any company yet. Please ask your administrator to
                    invite you.
                </Text>
                <Space style={{ marginTop: 16 }}>
                    {isAdmin ? (
                        <Button type="primary" onClick={() => setModalOpen(true)}>
                            Create company
                        </Button>
                    ) : null}
                    <Button
                        onClick={async () => {
                            dispatch(clearCompany());
                            await signOut();
                            navigate("/login", { replace: true });
                        }}
                    >
                        Logout
                    </Button>
                </Space>
            </Card>
            {isAdmin ? (
                <CreateCompanyModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSuccess={handleCompanyCreated}
                />
            ) : null}
        </>
    );
}
