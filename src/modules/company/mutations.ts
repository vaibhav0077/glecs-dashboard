export const createCompanyMutation = /* GraphQL */ `
  mutation CreateCompany($input: CreateCompanyInput!) {
    createCompany(input: $input) {
      id
      name
      legalName
      description
      website
      phone
      addressLine1
      addressLine2
      city
      state
      postalCode
      country
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const createUserCompanyConnectionMutation = /* GraphQL */ `
  mutation CreateUserCompanyConnection($input: CreateUserCompanyConnectionInput!) {
    createUserCompanyConnection(input: $input) {
      id
      userProfileEmail
      companyId
      company {
        id
        name
        isActive
      }
      createdAt
      updatedAt
    }
  }
`;
