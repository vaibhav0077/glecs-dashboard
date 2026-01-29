// Bill & BillItem Queries & Mutations

export const billsByCompanyQuery = /* GraphQL */ `
  query BillsByCompany(
    $companyId: ID!
    $billedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelBillFilterInput
    $limit: Int
    $nextToken: String
  ) {
    billsByCompany(
      companyId: $companyId
      billedAt: $billedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        companyId
        createdBy
        billType
        billedAt
        status
        totalAmount
        customerId
        notes
        customer {
          id
          name
          email
          phone
        }
        creator {
          email
          name
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const billsByCreatedByQuery = /* GraphQL */ `
  query BillsByCreatedBy(
    $createdBy: AWSEmail!
    $billedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelBillFilterInput
    $limit: Int
    $nextToken: String
  ) {
    billsByCreatedBy(
      createdBy: $createdBy
      billedAt: $billedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        companyId
        createdBy
        billType
        billedAt
        status
        totalAmount
        customerId
        notes
        customer {
          id
          name
          email
          phone
        }
        creator {
          email
          name
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getBillQuery = /* GraphQL */ `
  query GetBill($id: ID!) {
    getBill(id: $id) {
      id
      companyId
      createdBy
      billType
      billedAt
      status
      totalAmount
      customerId
      notes
      customer {
        id
        name
        email
        phone
      }
      creator {
        email
        name
      }
      createdAt
      updatedAt
    }
  }
`;

export const billItemsByBillQuery = /* GraphQL */ `
  query BillItemsByBill(
    $billId: ID!
    $lineNumber: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelBillItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    billItemsByBill(
      billId: $billId
      lineNumber: $lineNumber
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        billId
        lineNumber
        description
        productId
        quantity
        unitPrice
        lineTotal
        product {
          id
          name
          sku
          unitPrice
          unitCost
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const createBillMutation = /* GraphQL */ `
  mutation CreateBill($input: CreateBillInput!) {
    createBill(input: $input) {
      id
      companyId
      createdBy
      billType
      billedAt
      status
      totalAmount
      customerId
      notes
      createdAt
      updatedAt
    }
  }
`;

export const updateBillMutation = /* GraphQL */ `
  mutation UpdateBill($input: UpdateBillInput!) {
    updateBill(input: $input) {
      id
      companyId
      createdBy
      billType
      billedAt
      status
      totalAmount
      customerId
      notes
      createdAt
      updatedAt
    }
  }
`;

export const deleteBillMutation = /* GraphQL */ `
  mutation DeleteBill($input: DeleteBillInput!) {
    deleteBill(input: $input) {
      id
    }
  }
`;

export const createBillItemMutation = /* GraphQL */ `
  mutation CreateBillItem($input: CreateBillItemInput!) {
    createBillItem(input: $input) {
      id
      billId
      lineNumber
      description
      productId
      quantity
      unitPrice
      lineTotal
      createdAt
      updatedAt
    }
  }
`;

export const updateBillItemMutation = /* GraphQL */ `
  mutation UpdateBillItem($input: UpdateBillItemInput!) {
    updateBillItem(input: $input) {
      id
      billId
      lineNumber
      description
      productId
      quantity
      unitPrice
      lineTotal
      createdAt
      updatedAt
    }
  }
`;

export const deleteBillItemMutation = /* GraphQL */ `
  mutation DeleteBillItem($input: DeleteBillItemInput!) {
    deleteBillItem(input: $input) {
      id
    }
  }
`;
