import boto3.dynamodb.conditions
from chalice import Response
import json
import boto3
import os
import decimal
from chalice import Chalice, Response, BadRequestError
from datetime import datetime
import uuid
from AppSyncHelper import create_graphql_client
from gql import gql

import requests
from ChaliceHelper import app
from boto3.dynamodb.conditions import Key

import urllib.parse
import csv
import io
import re
import secrets
import string

cognito_client = boto3.client('cognito-idp')
gql_client = create_graphql_client()
s3 = boto3.client('s3')
cloudfront = boto3.client('cloudfront')
dyanmodb_client = boto3.resource('dynamodb')


def default_serializer(o):
    if isinstance(o, (datetime.date, datetime.datetime)):
        return o.isoformat()
    if isinstance(o, decimal.Decimal):
        return str(o)


def extract_params_from_url(url):
    # Parse the URL and extract the query string
    parsed_url = urllib.parse.urlparse(url)
    query_string = parsed_url.query

    # Split the query string into a list of key-value pairs
    params = urllib.parse.parse_qsl(query_string)

    # Convert the list of key-value pairs into a dictionary
    return dict(params)


@app.middleware('all')
def my_middleware(event, get_response):
    global domain_name
    domain_name = event.context['domainName']
    print("Domain Name :", domain_name)
    if '{proxy+}' in event.path:
        event.context['resourcePath'] = event.path.replace(
            '{proxy+}', event.uri_params['proxy'])
        event.path = event.path.replace('{proxy+}', event.uri_params['proxy'])
    # get_request_user_email(event)
    response = get_response(event)
    print(20, response.body)
    if response.status_code == 200:
        response.body = json.loads(json.dumps(
            response.body, default=default_serializer))
    return response


@app.route('/auth/inviteUser', methods=['POST'], cors=True, content_types=['application/json', 'application/x-www-form-urlencoded'])
def invite_user():
    """
    Invite a user to a company.
    Steps:
    1. Create user in Cognito User Pool
    2. Create UserProfile in DynamoDB via GraphQL
    3. Create UserCompanyConnection via GraphQL
    """
    try:
        # Get the request data (try both JSON and form data)
        request_data = app.current_request.json_body or {}

        # Extract email and companyId from request
        email = request_data.get('email')
        company_id = request_data.get('companyId')
        name = request_data.get('name')  # Optional

        if not email:
            return Response(
                body={'error': 'Email is required'},
                status_code=400
            )

        if not company_id:
            return Response(
                body={'error': 'companyId is required'},
                status_code=400
            )

        # Get Cognito User Pool ID from environment
        user_pool_id = os.environ.get('USER_POOL_ID')
        if not user_pool_id:
            return Response(
                body={'error': 'USER_POOL_ID environment variable not set'},
                status_code=500
            )

        # Step 1: Create user in Cognito
        # Generate a temporary password (needed even if user already exists)
        temp_password = ''.join(secrets.choice(
            string.ascii_letters + string.digits) for _ in range(12))
        temp_password += 'A1!'  # Ensure it meets password requirements

        try:
            cognito_response = cognito_client.admin_create_user(
                UserPoolId=user_pool_id,
                Username=email,
                UserAttributes=[
                    {'Name': 'email', 'Value': email},
                    {'Name': 'email_verified', 'Value': 'true'}
                ],
                TemporaryPassword=temp_password,
                MessageAction='RESEND'  # Don't send welcome email, we'll handle invitation separately
            )

            print(f"User created in Cognito: {email}")

        except cognito_client.exceptions.UsernameExistsException as e:
            print(f"User already exists in Cognito: {email}")
            # Continue - user might already exist but not be linked to company
        except Exception as cognito_error:
            print(f"Error creating user in Cognito: {str(cognito_error)}")
            return Response(
                body={
                    'error': f'Failed to create user in Cognito: {str(cognito_error)}'},
                status_code=500
            )

        # Step 2: Create UserProfile in DynamoDB via GraphQL
        create_user_profile_mutation = """
        mutation CreateUserProfile($input: CreateUserProfileInput!) {
            createUserProfile(input: $input) {
                email
                name
                createdAt
                updatedAt
            }
        }
        """

        user_profile_input = {
            'email': email,
            'name': name if name else None
        }

        try:
            user_profile_result = gql_client.execute(
                gql(create_user_profile_mutation),
                variable_values={'input': user_profile_input}
            )
            print(f"UserProfile created: {email}")
        except Exception as gql_error:
            # Check if user profile already exists
            error_str = str(gql_error)
            if 'already exists' in error_str.lower() or 'conditional check' in error_str.lower():
                print(f"UserProfile already exists: {email}")
            else:
                print(f"Error creating UserProfile: {str(gql_error)}")
                # Continue - might already exist

        # Step 3: Create UserCompanyConnection via GraphQL
        create_connection_mutation = """
        mutation CreateUserCompanyConnection($input: CreateUserCompanyConnectionInput!) {
            createUserCompanyConnection(input: $input) {
                id
                userProfileEmail
                companyId
                createdAt
                updatedAt
            }
        }
        """

        connection_input = {
            'userProfileEmail': email,
            'companyId': company_id
        }

        try:
            connection_result = gql_client.execute(
                gql(create_connection_mutation),
                variable_values={'input': connection_input}
            )
            print(f"UserCompanyConnection created: {email} -> {company_id}")
        except Exception as conn_error:
            error_str = str(conn_error)
            if 'already exists' in error_str.lower() or 'conditional check' in error_str.lower():
                print(
                    f"UserCompanyConnection already exists: {email} -> {company_id}")
                return Response(
                    body={'error': 'User is already connected to this company'},
                    status_code=409
                )
            else:
                print(
                    f"Error creating UserCompanyConnection: {str(conn_error)}")
                return Response(
                    body={
                        'error': f'Failed to create user-company connection: {str(conn_error)}'},
                    status_code=500
                )

        # Return success response
        return Response(
            body={
                'success': True,
                'message': 'User invited successfully',
                'email': email,
                'companyId': company_id,
                'tempPassword': temp_password  # In production, send this via email instead
            },
            status_code=200
        )

    except Exception as e:
        print(f"Error processing invite user request: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            body={'error': f'Internal server error: {str(e)}'},
            status_code=500
        )
