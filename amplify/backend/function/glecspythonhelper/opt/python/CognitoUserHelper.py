# Local Import
from SentryHelper import sentry_capture_error

# Never used
def create_cognito_group(cognito_client, user_pool_id, group_name, description=None, precedence=None):
    try:
        params = {
            "UserPoolId": user_pool_id,
            "GroupName": str(group_name)
        }
        if description:
            params['Description'] = description
        if precedence:
            params['Precedence'] = precedence

        return cognito_client.admin_create_group(**params)
    except Exception as e:
        print("Error:", e)
        return e


def create_or_update_cognito_group(cognito_client, user_pool_id, group_name, description=None, precedence=None):
    try:
        params = {
            "UserPoolId": user_pool_id,
            "GroupName": str(group_name)
        }
        if description:
            params['Description'] = description
        if precedence:
            params['Precedence'] = precedence
        try:
            return cognito_client.create_group(**params)
        except Exception as err:
            error_message = f"Error in creating cognito_group: {str(err)}"
            # Logging error in Sentry
            sentry_capture_error(error_message)
            print(error_message)
            return cognito_client.update_group(**params)
    except Exception as e:
        error_message = f"Error: {str(e)}"
        # Logging error in Sentry
        sentry_capture_error(error_message)
        print(error_message)
        return e


# never used
def update_user_attributes(cognito_client, user_pool_id, username, user_attributes):
    try:
        return cognito_client.admin_update_user_attributes(
            UserPoolId=user_pool_id,
            Username=username,
            UserAttributes=user_attributes
        )
    except Exception as e:
        error_message = f"Error updating user attributes: {str(e)}"
        # Logging error in Sentry
        sentry_capture_error(error_message)
        print(error_message)
        return e


# never used
def enable_user(cognito_client, user_pool_id, username):
    try:
        return cognito_client.admin_enable_user(
            UserPoolId=user_pool_id,
            Username=username
        )
    except Exception as e:
        print("error", e)
        return e


# never used
def disable_user(cognito_client, user_pool_id, username):
    try:
        return cognito_client.admin_disable_user(
            UserPoolId=user_pool_id,
            Username=username
        )
    except Exception as e:
        print("error", e)
        return e


def add_user_to_group(cognito_client, user_pool_id, username, group_name):
    try:
        return cognito_client.admin_add_user_to_group(
            UserPoolId=user_pool_id,
            Username=username,
            GroupName=str(group_name)
        )
    except Exception as e:
        error_message = f"Error adding user to group: {str(e)}"
        # Logging error in Sentry
        sentry_capture_error(error_message)
        print(error_message)
        return e


# never used
def remove_user_from_group(cognito_client, user_pool_id, username, group_name):
    try:
        return cognito_client.admin_remove_user_from_group(
            UserPoolId=user_pool_id,
            Username=username,
            GroupName=group_name
        )
    except Exception as e:
        print("error", e)
        return e


# never used
def set_temporary_password(cognito_client, user_pool_id, username, password):
    try:
        return cognito_client.admin_set_user_password(
            UserPoolId=user_pool_id,
            Username=username,
            Password=password
        )
    except Exception as e:
        print("error", e)
        return e
