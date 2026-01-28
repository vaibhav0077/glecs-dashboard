/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUserProfile = /* GraphQL */ `
  mutation CreateUserProfile(
    $input: CreateUserProfileInput!
    $condition: ModelUserProfileConditionInput
  ) {
    createUserProfile(input: $input, condition: $condition) {
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
export const updateUserProfile = /* GraphQL */ `
  mutation UpdateUserProfile(
    $input: UpdateUserProfileInput!
    $condition: ModelUserProfileConditionInput
  ) {
    updateUserProfile(input: $input, condition: $condition) {
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
export const deleteUserProfile = /* GraphQL */ `
  mutation DeleteUserProfile(
    $input: DeleteUserProfileInput!
    $condition: ModelUserProfileConditionInput
  ) {
    deleteUserProfile(input: $input, condition: $condition) {
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
export const createCustomer = /* GraphQL */ `
  mutation CreateCustomer(
    $input: CreateCustomerInput!
    $condition: ModelCustomerConditionInput
  ) {
    createCustomer(input: $input, condition: $condition) {
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
export const updateCustomer = /* GraphQL */ `
  mutation UpdateCustomer(
    $input: UpdateCustomerInput!
    $condition: ModelCustomerConditionInput
  ) {
    updateCustomer(input: $input, condition: $condition) {
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
export const deleteCustomer = /* GraphQL */ `
  mutation DeleteCustomer(
    $input: DeleteCustomerInput!
    $condition: ModelCustomerConditionInput
  ) {
    deleteCustomer(input: $input, condition: $condition) {
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
export const createCompany = /* GraphQL */ `
  mutation CreateCompany(
    $input: CreateCompanyInput!
    $condition: ModelCompanyConditionInput
  ) {
    createCompany(input: $input, condition: $condition) {
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
export const updateCompany = /* GraphQL */ `
  mutation UpdateCompany(
    $input: UpdateCompanyInput!
    $condition: ModelCompanyConditionInput
  ) {
    updateCompany(input: $input, condition: $condition) {
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
export const deleteCompany = /* GraphQL */ `
  mutation DeleteCompany(
    $input: DeleteCompanyInput!
    $condition: ModelCompanyConditionInput
  ) {
    deleteCompany(input: $input, condition: $condition) {
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
export const createProduct = /* GraphQL */ `
  mutation CreateProduct(
    $input: CreateProductInput!
    $condition: ModelProductConditionInput
  ) {
    createProduct(input: $input, condition: $condition) {
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
export const updateProduct = /* GraphQL */ `
  mutation UpdateProduct(
    $input: UpdateProductInput!
    $condition: ModelProductConditionInput
  ) {
    updateProduct(input: $input, condition: $condition) {
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
export const deleteProduct = /* GraphQL */ `
  mutation DeleteProduct(
    $input: DeleteProductInput!
    $condition: ModelProductConditionInput
  ) {
    deleteProduct(input: $input, condition: $condition) {
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
export const createCategory = /* GraphQL */ `
  mutation CreateCategory(
    $input: CreateCategoryInput!
    $condition: ModelCategoryConditionInput
  ) {
    createCategory(input: $input, condition: $condition) {
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
export const updateCategory = /* GraphQL */ `
  mutation UpdateCategory(
    $input: UpdateCategoryInput!
    $condition: ModelCategoryConditionInput
  ) {
    updateCategory(input: $input, condition: $condition) {
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
export const deleteCategory = /* GraphQL */ `
  mutation DeleteCategory(
    $input: DeleteCategoryInput!
    $condition: ModelCategoryConditionInput
  ) {
    deleteCategory(input: $input, condition: $condition) {
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
export const createSubcategory = /* GraphQL */ `
  mutation CreateSubcategory(
    $input: CreateSubcategoryInput!
    $condition: ModelSubcategoryConditionInput
  ) {
    createSubcategory(input: $input, condition: $condition) {
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
export const updateSubcategory = /* GraphQL */ `
  mutation UpdateSubcategory(
    $input: UpdateSubcategoryInput!
    $condition: ModelSubcategoryConditionInput
  ) {
    updateSubcategory(input: $input, condition: $condition) {
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
export const deleteSubcategory = /* GraphQL */ `
  mutation DeleteSubcategory(
    $input: DeleteSubcategoryInput!
    $condition: ModelSubcategoryConditionInput
  ) {
    deleteSubcategory(input: $input, condition: $condition) {
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
export const createBill = /* GraphQL */ `
  mutation CreateBill(
    $input: CreateBillInput!
    $condition: ModelBillConditionInput
  ) {
    createBill(input: $input, condition: $condition) {
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
export const updateBill = /* GraphQL */ `
  mutation UpdateBill(
    $input: UpdateBillInput!
    $condition: ModelBillConditionInput
  ) {
    updateBill(input: $input, condition: $condition) {
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
export const deleteBill = /* GraphQL */ `
  mutation DeleteBill(
    $input: DeleteBillInput!
    $condition: ModelBillConditionInput
  ) {
    deleteBill(input: $input, condition: $condition) {
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
export const createBillItem = /* GraphQL */ `
  mutation CreateBillItem(
    $input: CreateBillItemInput!
    $condition: ModelBillItemConditionInput
  ) {
    createBillItem(input: $input, condition: $condition) {
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
export const updateBillItem = /* GraphQL */ `
  mutation UpdateBillItem(
    $input: UpdateBillItemInput!
    $condition: ModelBillItemConditionInput
  ) {
    updateBillItem(input: $input, condition: $condition) {
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
export const deleteBillItem = /* GraphQL */ `
  mutation DeleteBillItem(
    $input: DeleteBillItemInput!
    $condition: ModelBillItemConditionInput
  ) {
    deleteBillItem(input: $input, condition: $condition) {
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
export const createUserCompanyConnection = /* GraphQL */ `
  mutation CreateUserCompanyConnection(
    $input: CreateUserCompanyConnectionInput!
    $condition: ModelUserCompanyConnectionConditionInput
  ) {
    createUserCompanyConnection(input: $input, condition: $condition) {
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
export const updateUserCompanyConnection = /* GraphQL */ `
  mutation UpdateUserCompanyConnection(
    $input: UpdateUserCompanyConnectionInput!
    $condition: ModelUserCompanyConnectionConditionInput
  ) {
    updateUserCompanyConnection(input: $input, condition: $condition) {
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
export const deleteUserCompanyConnection = /* GraphQL */ `
  mutation DeleteUserCompanyConnection(
    $input: DeleteUserCompanyConnectionInput!
    $condition: ModelUserCompanyConnectionConditionInput
  ) {
    deleteUserCompanyConnection(input: $input, condition: $condition) {
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
