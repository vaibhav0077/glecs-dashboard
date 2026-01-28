export type UserCompanyConnectionItem = {
  id: string;
  userProfileEmail: string;
  companyId: string;
  userProfile?: {
    email: string;
    name?: string | null;
    phone?: string | null;
    __typename?: string;
  } | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  email?: string | null;
  __typename?: string;
};

export type UsersByCompanyResult = {
  userCompanyConnectionsByCompanyId?: {
    items: UserCompanyConnectionItem[];
    nextToken?: string | null;
    __typename?: string;
  } | null;
};

export const usersByCompanyQuery = /* GraphQL */ `
  query UserCompanyConnectionsByCompanyId(
    $companyId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelUserCompanyConnectionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    userCompanyConnectionsByCompanyId(
      companyId: $companyId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userProfileEmail
        companyId
        userProfile {
          email
          name
          phone
          __typename
        }
        createdAt
        updatedAt
        email
        __typename
      }
      nextToken
      __typename
    }
  }
`;
