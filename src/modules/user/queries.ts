export const getUserProfileQuery = /* GraphQL */ `
  query GetUserProfile($email: AWSEmail!) {
    getUserProfile(email: $email) {
      email
      name
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
    }
  }
`;
