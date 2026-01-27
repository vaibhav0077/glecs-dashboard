import { useState } from "react";
import { Alert, Button, Form, Input, Modal, message } from "antd";
import { generateClient } from "aws-amplify/api";
import { fetchUserAttributes } from "aws-amplify/auth";
import {
    createCompanyMutation,
    createUserCompanyConnectionMutation,
} from "../mutations";

type CreateCompanyModalProps = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export function CreateCompanyModal({
    open,
    onClose,
    onSuccess,
}: CreateCompanyModalProps) {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const client = generateClient();

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
    }) => {
        setSubmitting(true);
        setError(null);

        try {
            // Get user email
            const attributes = await fetchUserAttributes();
            const email = attributes.email;

            if (!email) {
                throw new Error("User email not found.");
            }

            // Create company
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
                        isActive: true,
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
            form.resetFields();
            onSuccess();
            onClose();
        } catch (err) {
            const messageText =
                err instanceof Error ? err.message : "Failed to create company.";
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
            title="Create Company"
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

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={submitting}
                        style={{ height: 44 }}
                    >
                        Create Company
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}
