import { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Modal, Switch, message } from "antd";
import { generateClient } from "aws-amplify/api";
import { fetchUserAttributes } from "aws-amplify/auth";
import {
    createCompanyMutation,
    createUserCompanyConnectionMutation,
    updateCompanyMutation,
} from "../mutations";

type Company = {
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

type CreateCompanyModalProps = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    company?: Company | null; // If provided, modal is in edit mode
};

export function CreateCompanyModal({
    open,
    onClose,
    onSuccess,
    company,
}: CreateCompanyModalProps) {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const client = generateClient();
    const isEditMode = !!company;

    useEffect(() => {
        if (open && company) {
            form.setFieldsValue({
                name: company.name,
                legalName: company.legalName || undefined,
                description: company.description || undefined,
                website: company.website || undefined,
                phone: company.phone || undefined,
                addressLine1: company.addressLine1 || undefined,
                addressLine2: company.addressLine2 || undefined,
                city: company.city || undefined,
                state: company.state || undefined,
                postalCode: company.postalCode || undefined,
                country: company.country || undefined,
                isActive: company.isActive ?? true,
            });
        } else if (open && !company) {
            form.resetFields();
        }
    }, [open, company, form]);

    const handleSubmit = async (values: {
        name: string;
        legalName?: string;
        description?: string;
        website?: string;
        phone?: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
        isActive?: boolean;
    }) => {
        setSubmitting(true);
        setError(null);

        try {
            if (isEditMode && company) {
                // Update existing company
                await client.graphql({
                    query: updateCompanyMutation,
                    variables: {
                        input: {
                            id: company.id,
                            name: values.name,
                            legalName: values.legalName || undefined,
                            description: values.description || undefined,
                            website: values.website || undefined,
                            phone: values.phone || undefined,
                            addressLine1: values.addressLine1 || undefined,
                            addressLine2: values.addressLine2 || undefined,
                            city: values.city || undefined,
                            state: values.state || undefined,
                            postalCode: values.postalCode || undefined,
                            country: values.country || undefined,
                            isActive: values.isActive ?? true,
                        },
                    },
                    authMode: "userPool",
                });

                message.success("Company updated successfully!");
            } else {
                // Create new company
                const attributes = await fetchUserAttributes();
                const email = attributes.email;

                if (!email) {
                    throw new Error("User email not found.");
                }

                const createCompanyResponse = (await client.graphql({
                    query: createCompanyMutation,
                    variables: {
                        input: {
                            name: values.name,
                            legalName: values.legalName || undefined,
                            description: values.description || undefined,
                            website: values.website || undefined,
                            phone: values.phone || undefined,
                            addressLine1: values.addressLine1 || undefined,
                            addressLine2: values.addressLine2 || undefined,
                            city: values.city || undefined,
                            state: values.state || undefined,
                            postalCode: values.postalCode || undefined,
                            country: values.country || undefined,
                            isActive: values.isActive ?? true,
                        },
                    },
                    authMode: "userPool",
                })) as { data?: { createCompany?: { id: string } } };

                const companyId = createCompanyResponse.data?.createCompany?.id;

                if (!companyId) {
                    throw new Error("Failed to create company.");
                }

                // Link user to company
                await client.graphql({
                    query: createUserCompanyConnectionMutation,
                    variables: {
                        input: {
                            userProfileEmail: email,
                            companyId: companyId,
                        },
                    },
                    authMode: "userPool",
                });

                message.success("Company created and linked successfully!");
            }

            form.resetFields();
            onSuccess();
            onClose();
        } catch (err) {
            const messageText =
                err instanceof Error
                    ? err.message
                    : isEditMode
                      ? "Failed to update company."
                      : "Failed to create company.";
            setError(messageText);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setError(null);
        onClose();
    };

    return (
        <Modal
            title={isEditMode ? "Edit Company" : "Create Company"}
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
            >
                <Form.Item
                    label="Company Name"
                    name="name"
                    rules={[{ required: true, message: "Company name is required." }]}
                >
                    <Input placeholder="Enter company name" />
                </Form.Item>

                <Form.Item label="Legal Name" name="legalName">
                    <Input placeholder="Enter legal name (optional)" />
                </Form.Item>

                <Form.Item label="Description" name="description">
                    <Input.TextArea
                        rows={3}
                        placeholder="Enter company description (optional)"
                    />
                </Form.Item>

                <Form.Item label="Website" name="website">
                    <Input placeholder="https://example.com (optional)" />
                </Form.Item>

                <Form.Item label="Phone" name="phone">
                    <Input placeholder="Enter phone number (optional)" />
                </Form.Item>

                <Form.Item label="Address Line 1" name="addressLine1">
                    <Input placeholder="Enter address (optional)" />
                </Form.Item>

                <Form.Item label="Address Line 2" name="addressLine2">
                    <Input placeholder="Enter address line 2 (optional)" />
                </Form.Item>

                <Form.Item label="City" name="city">
                    <Input placeholder="Enter city (optional)" />
                </Form.Item>

                <Form.Item label="State" name="state">
                    <Input placeholder="Enter state (optional)" />
                </Form.Item>

                <Form.Item label="Postal Code" name="postalCode">
                    <Input placeholder="Enter postal code (optional)" />
                </Form.Item>

                <Form.Item label="Country" name="country">
                    <Input placeholder="Enter country (optional)" />
                </Form.Item>

                {isEditMode && (
                    <Form.Item
                        label="Status"
                        name="isActive"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                )}

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={submitting}
                        style={{ height: 44 }}
                    >
                        {isEditMode ? "Update Company" : "Create Company"}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}
