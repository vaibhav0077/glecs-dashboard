export const getProductQuery = /* GraphQL */ `
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
      category {
        id
        name
      }
      subcategory {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

export const productsByCompanyQuery = /* GraphQL */ `
  query ProductsByCompany(
    $companyId: ID!
    $name: ModelStringKeyConditionInput
    $filter: ModelProductFilterInput
    $limit: Int
    $nextToken: String
  ) {
    productsByCompany(
      companyId: $companyId
      name: $name
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
        category {
          id
          name
        }
        subcategory {
          id
          name
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const createProductMutation = /* GraphQL */ `
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
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
    }
  }
`;

export const updateProductMutation = /* GraphQL */ `
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
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
    }
  }
`;

export const deleteProductMutation = /* GraphQL */ `
  mutation DeleteProduct($input: DeleteProductInput!) {
    deleteProduct(input: $input) {
      id
    }
  }
`;

export const categoriesByCompanyQuery = /* GraphQL */ `
  query CategoriesByCompany(
    $companyId: ID!
    $name: ModelStringKeyConditionInput
    $filter: ModelCategoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    categoriesByCompany(
      companyId: $companyId
      name: $name
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
      }
      nextToken
    }
  }
`;

export const createCategoryMutation = /* GraphQL */ `
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      companyId
      name
      description
      createdAt
      updatedAt
    }
  }
`;

export const updateCategoryMutation = /* GraphQL */ `
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
      id
      companyId
      name
      description
      createdAt
      updatedAt
    }
  }
`;

export const deleteCategoryMutation = /* GraphQL */ `
  mutation DeleteCategory($input: DeleteCategoryInput!) {
    deleteCategory(input: $input) {
      id
    }
  }
`;

export const subcategoriesByCompanyQuery = /* GraphQL */ `
  query SubcategoriesByCompany(
    $companyId: ID!
    $name: ModelStringKeyConditionInput
    $filter: ModelSubcategoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    subcategoriesByCompany(
      companyId: $companyId
      name: $name
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
        category {
          id
          name
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const subcategoriesByCategoryQuery = /* GraphQL */ `
  query SubcategoriesByCategory(
    $categoryId: ID!
    $name: ModelStringKeyConditionInput
    $filter: ModelSubcategoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    subcategoriesByCategory(
      categoryId: $categoryId
      name: $name
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
      }
      nextToken
    }
  }
`;

export const createSubcategoryMutation = /* GraphQL */ `
  mutation CreateSubcategory($input: CreateSubcategoryInput!) {
    createSubcategory(input: $input) {
      id
      companyId
      categoryId
      name
      description
      createdAt
      updatedAt
    }
  }
`;

export const updateSubcategoryMutation = /* GraphQL */ `
  mutation UpdateSubcategory($input: UpdateSubcategoryInput!) {
    updateSubcategory(input: $input) {
      id
      companyId
      categoryId
      name
      description
      createdAt
      updatedAt
    }
  }
`;

export const deleteSubcategoryMutation = /* GraphQL */ `
  mutation DeleteSubcategory($input: DeleteSubcategoryInput!) {
    deleteSubcategory(input: $input) {
      id
    }
  }
`;
