export type AmplifyDependentResourcesAttributes = {
  "api": {
    "glecs": {
      "GraphQLAPIEndpointOutput": "string",
      "GraphQLAPIIdOutput": "string"
    },
    "glecsrestapi": {
      "ApiId": "string",
      "ApiName": "string",
      "RootUrl": "string"
    }
  },
  "auth": {
    "glecsauth": {
      "AppClientID": "string",
      "AppClientIDWeb": "string",
      "IdentityPoolId": "string",
      "IdentityPoolName": "string",
      "UserPoolArn": "string",
      "UserPoolId": "string",
      "UserPoolName": "string"
    },
    "userPoolGroups": {
      "ADMINGroupRole": "string",
      "STAFFGroupRole": "string",
      "SUPERADMINGroupRole": "string",
      "VAIBHAVGroupRole": "string"
    }
  },
  "function": {
    "auth": {
      "Arn": "string",
      "LambdaExecutionRole": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    },
    "glecsnodejshelper": {
      "Arn": "string"
    },
    "glecspythonhelper": {
      "Arn": "string"
    }
  }
}