/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUserCompanyConnection = /* GraphQL */ `
  subscription OnCreateUserCompanyConnection(
    $filter: ModelSubscriptionUserCompanyConnectionFilterInput
    $email: String
  ) {
    onCreateUserCompanyConnection(filter: $filter, email: $email) {
      id
      userProfileEmail
      companyId
      userProfile {
        email
        name
        phone
        createdAt
        updatedAt
        __typename
      }
      company {
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
        __typename
      }
      createdAt
      updatedAt
      email
      __typename
    }
  }
`;
export const onUpdateUserCompanyConnection = /* GraphQL */ `
  subscription OnUpdateUserCompanyConnection(
    $filter: ModelSubscriptionUserCompanyConnectionFilterInput
    $email: String
  ) {
    onUpdateUserCompanyConnection(filter: $filter, email: $email) {
      id
      userProfileEmail
      companyId
      userProfile {
        email
        name
        phone
        createdAt
        updatedAt
        __typename
      }
      company {
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
        __typename
      }
      createdAt
      updatedAt
      email
      __typename
    }
  }
`;
export const onDeleteUserCompanyConnection = /* GraphQL */ `
  subscription OnDeleteUserCompanyConnection(
    $filter: ModelSubscriptionUserCompanyConnectionFilterInput
    $email: String
  ) {
    onDeleteUserCompanyConnection(filter: $filter, email: $email) {
      id
      userProfileEmail
      companyId
      userProfile {
        email
        name
        phone
        createdAt
        updatedAt
        __typename
      }
      company {
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
        __typename
      }
      createdAt
      updatedAt
      email
      __typename
    }
  }
`;
