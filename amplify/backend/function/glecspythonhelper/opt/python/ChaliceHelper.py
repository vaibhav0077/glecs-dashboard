from chalice import Chalice, BadRequestError, UnauthorizedError, AuthResponse
from datetime import datetime, date
import json
import decimal


app = Chalice(app_name="LoyaltyLanders")


def default_serializer(o):
    if isinstance(o, (datetime.date, datetime.datetime)):
        return o.isoformat()
    if isinstance(o, decimal.Decimal):
        return str(o)

# @app.middleware('all')
# def my_middleware(event, get_response):
#     print(event.context)
#     global userId
#     cognitoAuthenticationProvider = event.context['identity']['cognitoAuthenticationProvider']
#     if cognitoAuthenticationProvider:
#         userId = event.context['identity']['cognitoAuthenticationProvider'].split(
#             ':')[-1]
#         if not userId:
#             raise BadRequestError("Unable to get account")

#         # If a proxy'd call, correct the event path
#     if '{proxy+}' in event.path:
#         event.context['resourcePath'] = event.path.replace(
#             '{proxy+}', event.uri_params['proxy'])
#         event.path = event.path.replace('{proxy+}', event.uri_params['proxy'])

#     response = get_response(event)
#     if response.status_code == 200:
#         response.body = json.loads(json.dumps(
#             response.body, default=default_serializer))
#     return response
