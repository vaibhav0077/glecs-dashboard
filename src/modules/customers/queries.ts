// Customer Queries & Mutations
export const customersByCompanyQuery = /* GraphQL */ `
  query CustomersByCompany(
    $companyId: ID!
    $name: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCustomerFilterInput
    $limit: Int
    $nextToken: String
  ) {
    customersByCompany(
      companyId: $companyId
      name: $name
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        companyId
        name
        email
        phone
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
        notes
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getCustomerQuery = /* GraphQL */ `
  query GetCustomer($id: ID!) {
    getCustomer(id: $id) {
      id
      companyId
      name
      email
      phone
      addressLine1
      addressLine2
      city
      state
      postalCode
      country
      notes
      createdAt
      updatedAt
    }
  }
`;

export const createCustomerMutation = /* GraphQL */ `
  mutation CreateCustomer($input: CreateCustomerInput!) {
    createCustomer(input: $input) {
      id
      companyId
      name
      email
      phone
      addressLine1
      addressLine2
      city
      state
      postalCode
      country
      notes
      createdAt
      updatedAt
    }
  }
`;

export const updateCustomerMutation = /* GraphQL */ `
  mutation UpdateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      id
      companyId
      name
      email
      phone
      addressLine1
      addressLine2
      city
      state
      postalCode
      country
      notes
      createdAt
      updatedAt
    }
  }
`;

export const deleteCustomerMutation = /* GraphQL */ `
  mutation DeleteCustomer($input: DeleteCustomerInput!) {
    deleteCustomer(input: $input) {
      id
    }
  }
`;
