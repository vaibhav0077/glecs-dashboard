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
ses_client = boto3.client('ses')


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

        # Extract email, companyId, and role from request
        email = request_data.get('email')
        company_id = request_data.get('companyId')
        name = request_data.get('name')  # Optional
        role = request_data.get('role')  # Optional: ADMIN, SUPERADMIN, STAFF

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

        # Validate role if provided
        valid_roles = ['ADMIN', 'SUPERADMIN', 'STAFF', 'VAIBHAV']
        if role and role not in valid_roles:
            return Response(
                body={
                    'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'},
                status_code=400
            )

        # Get Cognito User Pool ID from environment (set by CloudFormation as AUTH_GLECSAUTH_USERPOOLID)
        user_pool_id = os.environ.get(
            'AUTH_GLECSAUTH_USERPOOLID') or os.environ.get('USER_POOL_ID')
        if not user_pool_id:
            return Response(
                body={
                    'error': 'User pool ID not set (AUTH_GLECSAUTH_USERPOOLID)'},
                status_code=500
            )

        # Step 1: Create user in Cognito
        # Generate a temporary password (needed even if user already exists)
        temp_password = ''.join(secrets.choice(
            string.ascii_letters + string.digits) for _ in range(12))
        temp_password += 'A1!'  # Ensure it meets password requirements

        user_created = False
        try:
            # Try to create the user (MessageAction='SUPPRESS' prevents sending welcome email)
            cognito_response = cognito_client.admin_create_user(
                UserPoolId=user_pool_id,
                Username=email,
                UserAttributes=[
                    {'Name': 'email', 'Value': email},
                    {'Name': 'email_verified', 'Value': 'true'}
                ],
                TemporaryPassword=email,
                MessageAction='SUPPRESS'  # Don't send welcome email, we'll handle invitation separately
            )

            print(f"User created in Cognito: {email}")
            user_created = True

        except cognito_client.exceptions.UsernameExistsException as e:
            print(f"User already exists in Cognito: {email}")
            # User already exists - we'll still send them an invitation email with reset link
            user_created = False
        except Exception as cognito_error:
            print(f"Error creating user in Cognito: {str(cognito_error)}")
            return Response(
                body={
                    'error': f'Failed to create user in Cognito: {str(cognito_error)}'},
                status_code=500
            )

        # Assign user to Cognito group if role is provided
        if role:
            try:
                cognito_client.admin_add_user_to_group(
                    UserPoolId=user_pool_id,
                    Username=email,
                    GroupName=role
                )
                print(f"User {email} added to group {role}")
            except cognito_client.exceptions.ResourceNotFoundException as e:
                print(f"Group {role} not found: {str(e)}")
                # Continue - group might not exist
            except Exception as group_error:
                error_str = str(group_error)
                if "already exists" in error_str.lower() or "already a member" in error_str.lower():
                    print(f"User {email} is already in group {role}")
                else:
                    print(f"Error adding user to group: {str(group_error)}")
                    # Continue - group assignment failure shouldn't block user creation

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

        # Step 4: Get company name for email
        company_name = "the company"
        try:
            get_company_query = """
            query GetCompany($id: ID!) {
                getCompany(id: $id) {
                    id
                    name
                }
            }
            """
            company_result = gql_client.execute(
                gql(get_company_query),
                variable_values={'id': company_id}
            )
            if company_result and 'getCompany' in company_result and company_result['getCompany']:
                company_name = company_result['getCompany'].get(
                    'name', 'the company')
        except Exception as company_error:
            print(f"Error fetching company name: {str(company_error)}")
            # Continue with default name

        # Step 5: Generate password reset link and send invitation email
        reset_link = None
        cognito_sent_email = False

        try:
            if user_created:
                # For newly created users, generate a password reset link
                try:
                    reset_response = cognito_client.admin_create_user_password_reset_link(
                        UserPoolId=user_pool_id,
                        Username=email
                    )
                    reset_link = reset_response.get('PasswordResetLink', '')
                    print(
                        f"Password reset link generated for new user: {email}")
                except Exception as reset_error:
                    print(
                        f"Could not generate reset link for new user: {str(reset_error)}")
                    # Fallback: use admin_reset_user_password
                    try:
                        cognito_client.admin_reset_user_password(
                            UserPoolId=user_pool_id,
                            Username=email
                        )
                        cognito_sent_email = True
                        print(
                            f"Password reset email sent via Cognito for {email}")
                    except Exception as reset_error2:
                        print(
                            f"Could not send password reset via Cognito: {str(reset_error2)}")
            else:
                # For existing users, use admin_reset_user_password which sends email via Cognito
                try:
                    cognito_client.admin_reset_user_password(
                        UserPoolId=user_pool_id,
                        Username=email
                    )
                    cognito_sent_email = True
                    print(
                        f"Password reset email sent via Cognito for existing user: {email}")
                except Exception as reset_error:
                    print(
                        f"Could not send password reset for existing user: {str(reset_error)}")
                    # Try to generate a reset link as fallback
                    try:
                        reset_response = cognito_client.admin_create_user_password_reset_link(
                            UserPoolId=user_pool_id,
                            Username=email
                        )
                        reset_link = reset_response.get(
                            'PasswordResetLink', '')
                        cognito_sent_email = False
                        print(
                            f"Password reset link generated for existing user: {email}")
                    except Exception as link_error:
                        print(
                            f"Could not generate reset link: {str(link_error)}")

            # Send invitation email via SES
            # If we have a reset link, include it in the email
            # If Cognito already sent a password reset email, send a notification email
            send_ses_email = True
            if reset_link:
                # Prepare email content with reset link
                email_subject = f"Invitation to join {company_name} on GLECS"
                email_body_html = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #1890ff; color: white; padding: 20px; text-align: center; }}
                        .content {{ background-color: #f9f9f9; padding: 30px; }}
                        .button {{ display: inline-block; padding: 12px 30px; background-color: #1890ff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }}
                        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to GLECS</h1>
                        </div>
                        <div class="content">
                            <p>Hello{(' ' + name) if name else ''},</p>
                            <p>You have been invited to join <strong>{company_name}</strong> on GLECS.</p>
                            <p>To get started, please set your password by clicking the button below:</p>
                            <div style="text-align: center;">
                                <a href="{reset_link}" class="button">Set Your Password</a>
                            </div>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; color: #1890ff;">{reset_link}</p>
                            <p>This link will expire in 24 hours.</p>
                            <p>If you did not expect this invitation, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from GLECS. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                email_body_text = f"""
Hello{(' ' + name) if name else ''},

You have been invited to join {company_name} on GLECS.

To get started, please set your password by visiting this link:
{reset_link}

This link will expire in 24 hours.

If you did not expect this invitation, please ignore this email.

This is an automated message from GLECS. Please do not reply to this email.
                """
            elif cognito_sent_email:
                # Cognito already sent the password reset email, so send a notification
                email_subject = f"Access to {company_name} on GLECS"
                email_body_html = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #1890ff; color: white; padding: 20px; text-align: center; }}
                        .content {{ background-color: #f9f9f9; padding: 30px; }}
                        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>GLECS Access Update</h1>
                        </div>
                        <div class="content">
                            <p>Hello{(' ' + name) if name else ''},</p>
                            <p>You have been granted access to <strong>{company_name}</strong> on GLECS.</p>
                            <p>A password reset email has been sent to your email address. Please check your inbox and follow the instructions to set or reset your password.</p>
                            <p>If you did not expect this invitation, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from GLECS. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                email_body_text = f"""
Hello{(' ' + name) if name else ''},

You have been granted access to {company_name} on GLECS.

A password reset email has been sent to your email address. Please check your inbox and follow the instructions to set or reset your password.

If you did not expect this invitation, please ignore this email.

This is an automated message from GLECS. Please do not reply to this email.
                """
            else:
                # No reset link and Cognito didn't send email - send a basic invitation
                email_subject = f"Invitation to join {company_name} on GLECS"
                email_body_html = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #1890ff; color: white; padding: 20px; text-align: center; }}
                        .content {{ background-color: #f9f9f9; padding: 30px; }}
                        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to GLECS</h1>
                        </div>
                        <div class="content">
                            <p>Hello{(' ' + name) if name else ''},</p>
                            <p>You have been invited to join <strong>{company_name}</strong> on GLECS.</p>
                            <p>Please check your email for instructions on how to set up your account.</p>
                            <p>If you did not expect this invitation, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from GLECS. Please do not reply to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                email_body_text = f"""
                    Hello{(' ' + name) if name else ''},

                    You have been invited to join {company_name} on GLECS.

                    Please check your email for instructions on how to set up your account.

                    If you did not expect this invitation, please ignore this email.

                    This is an automated message from GLECS. Please do not reply to this email.
                """

            # Get the sender email from environment or use a default
            # Make sure this email is verified in SES
            sender_email = os.environ.get(
                'SES_SENDER_EMAIL', 'noreply@glecs.com')

            # Send email via SES
            if send_ses_email:
                ses_response = ses_client.send_email(
                    Source=sender_email,
                    Destination={
                        'ToAddresses': [email]
                    },
                    Message={
                        'Subject': {
                            'Data': email_subject,
                            'Charset': 'UTF-8'
                        },
                        'Body': {
                            'Html': {
                                'Data': email_body_html,
                                'Charset': 'UTF-8'
                            },
                            'Text': {
                                'Data': email_body_text,
                                'Charset': 'UTF-8'
                            }
                        }
                    }
                )

                print(
                    f"Invitation email sent to {email}. MessageId: {ses_response.get('MessageId')}")
            else:
                print(
                    f"Skipping SES email for {email} (Cognito handled password reset)")

        except ses_client.exceptions.MessageRejected as e:
            print(f"SES error - email rejected: {str(e)}")
            # Continue - email failure shouldn't block user creation
            # You might want to log this for admin review
        except Exception as email_error:
            print(f"Error sending invitation email: {str(email_error)}")
            # Continue - email failure shouldn't block user creation
            import traceback
            traceback.print_exc()

        # Return success response
        return Response(
            body={
                'success': True,
                'message': 'User invited successfully. Invitation email sent.',
                'email': email,
                'companyId': company_id
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


@app.route('/auth/removeUser', methods=['POST'], cors=True, content_types=['application/json', 'application/x-www-form-urlencoded'])
def remove_user():
    """
    Remove a user from a company.
    Steps:
    1. Delete UserCompanyConnection via GraphQL
    2. Optionally remove user from Cognito group if they have no other companies
    """
    try:
        # Get the request data (try both JSON and form data)
        request_data = app.current_request.json_body or {}

        # Extract email and companyId from request
        email = request_data.get('email')
        company_id = request_data.get('companyId')

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
        user_pool_id = os.environ.get(
            'AUTH_GLECSAUTH_USERPOOLID') or os.environ.get('USER_POOL_ID')
        if not user_pool_id:
            return Response(
                body={
                    'error': 'User pool ID not set (AUTH_GLECSAUTH_USERPOOLID)'},
                status_code=500
            )

        # Step 1: Find the UserCompanyConnection to delete using indexed query by company
        # userCompanyConnectionsByCompanyId lists all users of that company; filter by email
        find_connection_query = """
        query UserCompanyConnectionsByCompanyId(
            $companyId: ID!
            $filter: ModelUserCompanyConnectionFilterInput
        ) {
            userCompanyConnectionsByCompanyId(
                companyId: $companyId
                filter: $filter
            ) {
                items {
                    id
                    userProfileEmail
                    companyId
                }
            }
        }
        """

        try:
            find_result = gql_client.execute(
                gql(find_connection_query),
                variable_values={
                    'companyId': company_id,
                    'filter': {'userProfileEmail': {'eq': email}}
                }
            )
            items = find_result.get(
                'userCompanyConnectionsByCompanyId', {}).get('items', [])

            if not items or len(items) == 0:
                return Response(
                    body={'error': 'User is not connected to this company'},
                    status_code=404
                )

            connection_id = items[0]['id']
        except Exception as find_error:
            print(f"Error finding UserCompanyConnection: {str(find_error)}")
            return Response(
                body={
                    'error': f'Failed to find user-company connection: {str(find_error)}'},
                status_code=500
            )

        # Step 2: Delete UserCompanyConnection via GraphQL
        delete_connection_mutation = """
        mutation DeleteUserCompanyConnection($input: DeleteUserCompanyConnectionInput!) {
            deleteUserCompanyConnection(input: $input) {
                id
            }
        }
        """

        try:
            delete_result = gql_client.execute(
                gql(delete_connection_mutation),
                variable_values={'input': {'id': connection_id}}
            )
            print(f"UserCompanyConnection deleted: {email} -> {company_id}")
        except Exception as delete_error:
            print(f"Error deleting UserCompanyConnection: {str(delete_error)}")
            return Response(
                body={
                    'error': f'Failed to remove user from company: {str(delete_error)}'},
                status_code=500
            )

        # Return success response
        return Response(
            body={
                'success': True,
                'message': 'User removed from company successfully',
                'email': email,
                'companyId': company_id
            },
            status_code=200
        )

    except Exception as e:
        print(f"Error processing remove user request: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            body={'error': f'Internal server error: {str(e)}'},
            status_code=500
        )
