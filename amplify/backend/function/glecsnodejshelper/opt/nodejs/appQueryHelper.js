require("isomorphic-fetch");
const AWS = require("aws-sdk");
const AWSAppSyncClient = require("aws-appsync").default;
const { AUTH_TYPE } = require("aws-appsync");
const gql = require("graphql-tag");
AWS.config.update({ region: process.env.REGION });
const appsyncUrl = process.env.API_TEMPLATEBUILDER_GRAPHQLAPIENDPOINTOUTPUT;

// graphql client.  We define it outside of the lambda function in order for it to be reused during subsequent calls
const appsyncClient = new AWSAppSyncClient({
  url: appsyncUrl,
  region: process.env.REGION,
  auth: {
    type: AUTH_TYPE.AWS_IAM,
    credentials: AWS.config.credentials,
  },
  disableOffline: true,
});

// generic app sync query function.  A way to quickly reuse query statements
async function executeQuery(query, variables) {
  try {
    const response = await appsyncClient.query({
      query: gql(query),
      variables,
      fetchPolicy: "network-only",
    });
    return response;
  } catch (err) {
    console.log("Error while trying to fetch data", err);
    throw JSON.stringify(err);
  }
}

// generic app sync mutation function.  A way to quickly reuse query statements
async function executeMutation(query, variables) {
  try {
    const response = await appsyncClient.mutate({
      mutation: gql(query),
      variables,
      fetchPolicy: "no-cache",
    });
    return response;
  } catch (err) {
    console.log("Error while trying to mutate data", err);
    throw JSON.stringify(err);
  }
}

module.exports = {
  executeQuery,
  executeMutation,
};
