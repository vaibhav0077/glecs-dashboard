export const getCompanyQuery = /* GraphQL */ `
  query GetCompany($id: ID!) {
    getCompany(id: $id) {
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
