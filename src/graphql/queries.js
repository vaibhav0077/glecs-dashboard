/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getCustomer = /* GraphQL */ `
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
      bills {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listCustomers = /* GraphQL */ `
  query ListCustomers(
    $filter: ModelCustomerFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCustomers(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getCompany = /* GraphQL */ `
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
      users {
        nextToken
        __typename
      }
      products {
        nextToken
        __typename
      }
      customers {
        nextToken
        __typename
      }
      categories {
        nextToken
        __typename
      }
      subcategories {
        nextToken
        __typename
      }
      bills {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listCompanies = /* GraphQL */ `
  query ListCompanies(
    $filter: ModelCompanyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCompanies(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getProduct = /* GraphQL */ `
  query GetProduct($id: ID!) {
    getProduct(id: $id) {
      id
      companyId
      categoryId
      subcategoryId
      name
      sku
      description
      unitPrice
      unitCost
      isActive
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
      billItems {
        nextToken
        __typename
      }
      category {
        id
        companyId
        name
        description
        createdAt
        updatedAt
        __typename
      }
      subcategory {
        id
        companyId
        categoryId
        name
        description
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listProducts = /* GraphQL */ `
  query ListProducts(
    $filter: ModelProductFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProducts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        companyId
        categoryId
        subcategoryId
        name
        sku
        description
        unitPrice
        unitCost
        isActive
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getCategory = /* GraphQL */ `
  query GetCategory($id: ID!) {
    getCategory(id: $id) {
      id
      companyId
      name
      description
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
      subcategories {
        nextToken
        __typename
      }
      products {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listCategories = /* GraphQL */ `
  query ListCategories(
    $filter: ModelCategoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCategories(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        companyId
        name
        description
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getSubcategory = /* GraphQL */ `
  query GetSubcategory($id: ID!) {
    getSubcategory(id: $id) {
      id
      companyId
      categoryId
      name
      description
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
      category {
        id
        companyId
        name
        description
        createdAt
        updatedAt
        __typename
      }
      products {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listSubcategories = /* GraphQL */ `
  query ListSubcategories(
    $filter: ModelSubcategoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSubcategories(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        companyId
        categoryId
        name
        description
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getBill = /* GraphQL */ `
  query GetBill($id: ID!) {
    getBill(id: $id) {
      id
      companyId
      billType
      billedAt
      status
      totalAmount
      customerId
      notes
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
      customer {
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
        __typename
      }
      items {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listBills = /* GraphQL */ `
  query ListBills(
    $filter: ModelBillFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listBills(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        companyId
        billType
        billedAt
        status
        totalAmount
        customerId
        notes
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getBillItem = /* GraphQL */ `
  query GetBillItem($id: ID!) {
    getBillItem(id: $id) {
      id
      billId
      lineNumber
      description
      productId
      quantity
      unitPrice
      lineTotal
      bill {
        id
        companyId
        billType
        billedAt
        status
        totalAmount
        customerId
        notes
        createdAt
        updatedAt
        __typename
      }
      product {
        id
        companyId
        categoryId
        subcategoryId
        name
        sku
        description
        unitPrice
        unitCost
        isActive
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listBillItems = /* GraphQL */ `
  query ListBillItems(
    $filter: ModelBillItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listBillItems(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const customersByCompany = /* GraphQL */ `
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
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const productsByCompany = /* GraphQL */ `
  query ProductsByCompany(
    $companyId: ID!
    $name: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelProductFilterInput
    $limit: Int
    $nextToken: String
  ) {
    productsByCompany(
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
        categoryId
        subcategoryId
        name
        sku
        description
        unitPrice
        unitCost
        isActive
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const productsByCategory = /* GraphQL */ `
  query ProductsByCategory(
    $categoryId: ID!
    $name: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelProductFilterInput
    $limit: Int
    $nextToken: String
  ) {
    productsByCategory(
      categoryId: $categoryId
      name: $name
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        companyId
        categoryId
        subcategoryId
        name
        sku
        description
        unitPrice
        unitCost
        isActive
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const productsBySubcategory = /* GraphQL */ `
  query ProductsBySubcategory(
    $subcategoryId: ID!
    $name: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelProductFilterInput
    $limit: Int
    $nextToken: String
  ) {
    productsBySubcategory(
      subcategoryId: $subcategoryId
      name: $name
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        companyId
        categoryId
        subcategoryId
        name
        sku
        description
        unitPrice
        unitCost
        isActive
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const categoriesByCompany = /* GraphQL */ `
  query CategoriesByCompany(
    $companyId: ID!
    $name: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelCategoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    categoriesByCompany(
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
        description
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const subcategoriesByCompany = /* GraphQL */ `
  query SubcategoriesByCompany(
    $companyId: ID!
    $name: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelSubcategoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    subcategoriesByCompany(
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
        categoryId
        name
        description
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const subcategoriesByCategory = /* GraphQL */ `
  query SubcategoriesByCategory(
    $categoryId: ID!
    $name: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelSubcategoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    subcategoriesByCategory(
      categoryId: $categoryId
      name: $name
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        companyId
        categoryId
        name
        description
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const billsByCompany = /* GraphQL */ `
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
        billType
        billedAt
        status
        totalAmount
        customerId
        notes
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const billsByCustomer = /* GraphQL */ `
  query BillsByCustomer(
    $customerId: ID!
    $billedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelBillFilterInput
    $limit: Int
    $nextToken: String
  ) {
    billsByCustomer(
      customerId: $customerId
      billedAt: $billedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        companyId
        billType
        billedAt
        status
        totalAmount
        customerId
        notes
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const billItemsByBill = /* GraphQL */ `
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
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const billItemsByProduct = /* GraphQL */ `
  query BillItemsByProduct(
    $productId: ID!
    $billId: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelBillItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    billItemsByProduct(
      productId: $productId
      billId: $billId
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
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getUserProfile = /* GraphQL */ `
  query GetUserProfile($email: AWSEmail!) {
    getUserProfile(email: $email) {
      email
      name
      phone
      companies {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listUserProfiles = /* GraphQL */ `
  query ListUserProfiles(
    $email: AWSEmail
    $filter: ModelUserProfileFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listUserProfiles(
      email: $email
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        email
        name
        phone
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getUserCompanyConnection = /* GraphQL */ `
  query GetUserCompanyConnection($id: ID!) {
    getUserCompanyConnection(id: $id) {
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
export const listUserCompanyConnections = /* GraphQL */ `
  query ListUserCompanyConnections(
    $filter: ModelUserCompanyConnectionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUserCompanyConnections(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userProfileEmail
        companyId
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
export const userCompanyConnectionsByUserProfileEmail = /* GraphQL */ `
  query UserCompanyConnectionsByUserProfileEmail(
    $userProfileEmail: AWSEmail!
    $sortDirection: ModelSortDirection
    $filter: ModelUserCompanyConnectionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    userCompanyConnectionsByUserProfileEmail(
      userProfileEmail: $userProfileEmail
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userProfileEmail
        companyId
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
export const userCompanyConnectionsByCompanyId = /* GraphQL */ `
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
