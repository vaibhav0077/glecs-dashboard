export const getUserProfileQuery = /* GraphQL */ `
  query GetUserProfile($email: AWSEmail!) {
    getUserProfile(email: $email) {
      email
      name
      phone
      companies {
        items {
          company {
            id
            name
            isActive
          }
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;

export const createUserProfileMutation = /* GraphQL */ `
  mutation CreateUserProfile($input: CreateUserProfileInput!, $condition: ModelUserProfileConditionInput) {
    createUserProfile(input: $input, condition: $condition) {
      email
      name
      phone
      createdAt
      updatedAt
    }
  }
`;

export const updateUserProfileMutation = /* GraphQL */ `
  mutation UpdateUserProfile($input: UpdateUserProfileInput!, $condition: ModelUserProfileConditionInput) {
    updateUserProfile(input: $input, condition: $condition) {
      email
      name
      phone
      createdAt
      updatedAt
    }
  }
`;
