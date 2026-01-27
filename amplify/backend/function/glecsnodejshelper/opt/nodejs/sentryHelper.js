/**
 * @fileoverview Helper module for Sentry error tracking integration with AWS Lambda
 * @module sentryHelper
 * @requires @sentry/aws-serverless
 * @requires aws-sdk
 */

const Sentry = require("@sentry/aws-serverless");
const AWS = require("aws-sdk");

AWS.config.update({ region: process.env.REGION });
const secretsManager = new AWS.SecretsManager();

let sentryInitialized = false;

/**
 * Retrieves a secret value from AWS Secrets Manager
 * @async
 * @param {string} secretName - The name/ID of the secret to retrieve
 * @returns {Promise<Object>} The parsed secret value as an object
 * @throws {Error} When secret retrieval fails
 */
async function getSecretValue(secretName) {
  try {
    // if secretName is not present, return empty
    if (!secretName) {
      console.warn("Secret name must be provided.");
      return "";
    }

    // obtain sentry dsn value based on key `sentry_dsn`
    const response = await secretsManager
      .getSecretValue({ SecretId: secretName })
      .promise();
    const secrets = JSON.parse(response.SecretString || "{}");

    return secrets;
  } catch (err) {
    console.warn(`Failed to retrieve secret "${secretName}":`, err.message);
    return "";
  }
}

/**
 * Initialize Sentry SDK for AWS Lambda.
 * Only runs once, even if imported multiple times.
 */
async function initSentry() {
  // Sentry disabled for backend lambdas.
  return;
}

/**
 * Wrap the Lambda handler with Sentry monitoring.
 * @param {Function} handler - The Lambda handler function to wrap
 * @returns {Function} Wrapped handler with Sentry monitoring
 */
const wrapHandler = (handler) => {
  return async (event, context) => handler(event, context);
};

/**
 * Manually capture errors.
 */
const captureError = (error) => {
  // Sentry disabled for backend lambdas.
  return;
};

module.exports = { wrapHandler, captureError };
