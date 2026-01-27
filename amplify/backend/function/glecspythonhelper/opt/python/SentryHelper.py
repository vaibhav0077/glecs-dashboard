"""
SentryHelper: AWS Lambda Sentry Integration Module

This module configures Sentry error tracking for AWS Lambda functions.
It handles the initialization of Sentry SDK with proper configuration
from AWS Secrets Manager and environment variables.
"""

# Standard Library Imports
import os
import re

# Third-Party Library Imports
import sentry_sdk
from sentry_sdk.integrations.aws_lambda import AwsLambdaIntegration

# Local Imports
from AppSyncHelper import get_secret

PATTERNS = {
    "gql": [
        r"(?i)__\s*(schema|type)\b",  # introspection fields
        r"\{[^{}]*\{\s*",  # deep‐nest DoS (`{…{`)
        r"(?i)\$\.?(?:regex|gte|lte|ne|in)\b",  # embedded JSON/NoSQL ops
    ],
    "dynamodb": [
        # over‐broad ComparisonOperator
        r"\"ComparisonOperator\"\s*:\s*\"(?:GT|LT|GE|LE|NE|BETWEEN|CONTAINS|NOT_CONTAINS|BEGINS_WITH)\"",
        r"\"\\*\"",  # wildcard `"*"`
        r"\"\\s*\"",  # blank‐string scan
        r"(?i)\b(?:OR|AND)\b.*AttributeValueList",  # boolean logic in filters
    ],
}


def fetch_sentry_config():
    """
    Retrieve the Sentry DSN from secrets manager.
    Returns:
        str: dsn
    """
    secrets = get_secret()  # Obtaining secrets from secret manager

    dsn = secrets.get("sentry_dsn", "")  # Fetching value of sentry_dsn

    return dsn


def before_send(event, hint):
    """
    Middleware for Sentry Initialization to avoid reporting GQL handled error logs and timeout warnings
    Args:
        event: The event data that Sentry captures.
        hint: Additional context or metadata about the event, including exception information.
    Returns:
        dict or None: The modified event data to be sent to Sentry, or `None` to drop the event.
    """
    try:
        pass
        # Filter out timeout warnings
        message = event.get("message", "")
        if message:
            message_str = str(message).lower()
            if "function is expected to get timed out" in message_str or "serverlesstimeoutwarning" in message_str:
                return None  # Drop the timeout warning event

        # Check exception values for timeout warnings
        exception_values = event.get("exception", {}).get("values", [])
        if exception_values:
            for exc_value in exception_values:
                exc_type = exc_value.get("type", "")
                exc_value_str = exc_value.get("value", "")
                mechanism = exc_value.get("mechanism", {})

                # Check for timeout warning pattern
                if ("ServerlessTimeoutWarning" in exc_type or
                    "timeout" in exc_type.lower() or
                        "function is expected to get timed out" in exc_value_str.lower()):
                    return None  # Drop the timeout warning event

                # Check mechanism type for threading-based timeout warnings
                if mechanism.get("type") == "threading" and "timeout" in exc_value_str.lower():
                    return None  # Drop the timeout warning event
    except Exception as e:
        return None
    # If the error is from gql library, ignore it
    exception = hint.get("exc_info")
    if exception:
        _, exc_value, _ = exception
        if exc_value.__class__.__module__.startswith("gql"):
            return None  # Drop the event
    return event


def before_send_transaction(event, hint):
    """
    Filter out HTTP spans for AppSync GraphQL API calls to reduce noise in Sentry traces.
    Args:
        event: The transaction event data that Sentry captures.
        hint: Additional context or metadata about the transaction.
    Returns:
        dict or None: The modified transaction data to be sent to Sentry, or `None` to drop the transaction.
    """
    try:
        # Get spans from the transaction (spans can be in different locations)
        spans = event.get("spans", [])

        # Also check in contexts if spans are nested there
        contexts = event.get("contexts", {})
        if not spans and "trace" in contexts:
            spans = contexts.get("trace", {}).get("spans", [])

        if spans:
            # Filter out HTTP spans for AppSync GraphQL endpoints
            filtered_spans = []
            for span in spans:
                op = span.get("op", "")
                description = str(span.get("description", "")).lower()

                # Skip HTTP spans for AppSync GraphQL API calls
                # Check for AppSync API endpoints in the description
                if op == "http.client":
                    # Match AppSync GraphQL endpoints
                    if "appsync-api" in description or "appsync" in description:
                        continue  # Skip this span

                filtered_spans.append(span)

            # Update the event with filtered spans
            event["spans"] = filtered_spans

        return event
    except Exception as e:
        # If filtering fails, return the original event
        print(f"Error in before_send_transaction: {str(e)}")
        return event


def initialize_sentry():
    """
    Initialize Sentry with the fetched DSN and environment.
    """
    # Sentry disabled for backend lambdas.
    return


def sentry_capture_error(error):
    """
    Function to handle errors and send to Sentry for logging
    Args:
        error (Exception): Error message and stack trace to be reported in Sentry
    """
    # Sentry disabled for backend lambdas.
    return


def sentry_capture_message(message: str, event_level="warning"):
    """
    Function to log warning or other messages to Sentry for logging
    Args:
        message (str): Message string to be logged in Sentry
        event_level (str): Valid level value for Sentry event type, default to warning
    """
    # Sentry disabled for backend lambdas.
    return


def set_request_tags_from_chalice(request):
    """
    Set Sentry tags and context from a Chalice request object for better error tracking.

    This function extracts relevant information from a Chalice request object and sets it as Sentry tags and context. It captures:
    - IP address of the requester
    - API endpoint path
    - Authentication status
    - Request headers (redacted for security)

    Args:
        request: A Chalice request object containing request context and headers
    """
    # Sentry disabled for backend lambdas.
    return


# Function to detect DB injections in queries
def detect_injection(input_data: str, query_type: str) -> bool:
    """
    Detect potential injection based on query_type.

    Args:
        input_data (str): The raw input to scan.
        query_type (str): One of 'gql', or 'dynamodb'.

    Returns:
        bool: True if any suspicious pattern is found.
    """
    try:
        # Select patterns for this type (default to all)
        patterns = PATTERNS.get(query_type, sum(PATTERNS.values(), []))

        # Check each pattern
        for pat in patterns:
            if re.search(pat, input_data):
                return True

        return False

    except Exception as e:
        # Sentry disabled for backend lambdas.
        return False


# Invoking to initialized sentry whenever this is imported
initialize_sentry()
