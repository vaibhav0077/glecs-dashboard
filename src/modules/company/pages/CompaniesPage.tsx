import { useState } from "react";
import { Button, Card, List, Space, Typography, Tag, message } from "antd";
import { BankOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { selectCompanyById } from "../../../store/slices/companySlice";
import { CreateCompanyModal } from "../components/CreateCompanyModal";
import { generateClient } from "aws-amplify/api";
import { getCompanyQuery } from "../queries";
import { useUserAccess } from "../../user/hooks/useUserAccess";

const { Title, Text } = Typography;

type CompanyDetails = {
  id: string;
  name: string;
  legalName?: string | null;
  description?: string | null;
  website?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  isActive?: boolean | null;
};

export function CompaniesPage() {
  const dispatch = useAppDispatch();
  const { companies, selectedCompany } = useAppSelector((state) => state.company);
  const { isAdmin } = useUserAccess();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyDetails | null>(null);
  const [loadingCompany, setLoadingCompany] = useState<string | null>(null);

  const handleSwitchCompany = (companyId: string) => {
    dispatch(selectCompanyById(companyId));
    message.success("Company switched successfully");
  };

  const handleEdit = async (companyId: string) => {
    setLoadingCompany(companyId);
    try {
      const client = generateClient();
      const response = (await client.graphql({
        query: getCompanyQuery,
        variables: { id: companyId },
        authMode: "userPool",
      })) as { data?: { getCompany?: CompanyDetails | null } };

      const company = response.data?.getCompany;
      if (company) {
        setEditingCompany(company);
        setModalOpen(true);
      } else {
        message.error("Company not found");
      }
    } catch (error) {
      console.error("Error loading company:", error);
      message.error("Failed to load company details");
    } finally {
      setLoadingCompany(null);
    }
  };

  const handleAddCompany = () => {
    setEditingCompany(null);
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    // Refresh companies list by reloading user access
    window.location.reload(); // Simple approach - could be improved with proper state refresh
  };

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
              <Title level={3}>Companies</Title>
              <Text type="secondary">
                All companies connected to your account
              </Text>
            </div>
            {isAdmin && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddCompany}
              >
                Add Company
              </Button>
            )}
          </div>

          {companies.length === 0 ? (
            <Card>
              <Text type="secondary">No companies found.</Text>
            </Card>
          ) : (
            <List
              dataSource={companies}
              renderItem={(company) => (
                <List.Item
                  actions={[
                    <Button
                      key="switch"
                      type={selectedCompany?.id === company.id ? "primary" : "default"}
                      onClick={() => handleSwitchCompany(company.id)}
                      disabled={selectedCompany?.id === company.id}
                    >
                      {selectedCompany?.id === company.id ? "Current" : "Switch"}
                    </Button>,
                    isAdmin && (
                      <Button
                        key="edit"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(company.id)}
                        loading={loadingCompany === company.id}
                      >
                        Edit
                      </Button>
                    ),
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={<BankOutlined style={{ fontSize: 24 }} />}
                    title={
                      <Space>
                        <Text strong>{company.name}</Text>
                        {selectedCompany?.id === company.id && (
                          <Tag color="blue">Selected</Tag>
                        )}
                        {company.isActive ? (
                          <Tag color="green">Active</Tag>
                        ) : (
                          <Tag color="red">Inactive</Tag>
                        )}
                      </Space>
                    }
                    description={`Company ID: ${company.id}`}
                  />
                </List.Item>
              )}
            />
          )}
        </Space>
      </Card>

      <CreateCompanyModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCompany(null);
        }}
        onSuccess={handleModalSuccess}
        company={editingCompany}
      />
    </>
  );
}
