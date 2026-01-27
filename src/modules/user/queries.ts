export const getUserProfileQuery = /* GraphQL */ `
  query GetUserProfile($email: AWSEmail!) {
    getUserProfile(email: $email) {
      email
      name
      companies {
        items {
          id
          name
          isActive
        }
        nextToken
      }
    }
  }
`;
