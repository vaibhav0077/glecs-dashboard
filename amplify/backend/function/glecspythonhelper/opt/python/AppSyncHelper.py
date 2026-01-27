import os
import json
import boto3
from requests_aws4auth import AWS4Auth
from gql import gql
from gql.client import Client
from gql.transport.requests import RequestsHTTPTransport
import traceback
# Helper functions for querying AWS App Sync via GraphQL API


def create_graphql_client():
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }

    credentials = boto3.Session().get_credentials()
    service = "appsync"
    region = os.environ['REGION']
    awsauth = AWS4Auth(credentials.access_key, credentials.secret_key,
                       region, service, session_token=credentials.token)

    transport = RequestsHTTPTransport(url=os.environ['API_GLECS_GRAPHQLAPIENDPOINTOUTPUT'],
                                      headers=headers,
                                      auth=awsauth)
    client = Client(transport=transport,
                    fetch_schema_from_transport=True)
    return client


def get_appsync_auth():
    credentials = boto3.Session().get_credentials()
    service = "appsync"
    region = os.environ['REGION']
    gql_awsauth = AWS4Auth(credentials.access_key, credentials.secret_key,
                           region, service, session_token=credentials.token)

    APPSYNC_URL = os.environ['API_GLECS_GRAPHQLAPIENDPOINTOUTPUT']
    return APPSYNC_URL, gql_awsauth


def get_secret():
    secret_name = os.environ['SECRET_CREDS']
    session = boto3.session.Session()
    client = session.client(service_name='secretsmanager')

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )

        if 'SecretString' in get_secret_value_response:
            secret = get_secret_value_response['SecretString']
            if secret:
                return json.loads(secret)
    except Exception as e:
        error_message = f"Failed to read secret: {str(e)}"
        print(error_message)
        traceback.print_exc()
    return None


def convert_graphql_to_rest(products):
    # Extracting the product information from the GraphQL response
    final_products = []
    for product in products:
        # Extract the necessary product fields
        rest_product = {
            # Extract ID from the gid
            "id": int(product["id"].split("/")[-1]),
            "title": product["title"],
            "product_type": product["productType"],
            "variants": [],
            "options": product["options"],
            "images": [],
            "image": {"id": product['featuredMedia']['id'].split("/")[-1], "src":  product['featuredMedia']['preview']['image']['url']} if product['featuredMedia'] else None
        }
        if product['featuredMedia']:
            temp = {
                "id":  product['featuredMedia']['id'].split("/")[-1],
                "alt": None,
                "src": product['featuredMedia']['preview']['image']['url'],
                "variant_ids": []
            }
            rest_product['images'].append(temp)

        # Handling images (if available in the GraphQL response)
        # if "media" in product and product["media"]['edges']:
        #     rest_product["images"] = []
        #     for media_edge in product["media"]["edges"]:
        #         media_node = media_edge["node"]
        #         if "preview" in media_node and "image" in media_node["preview"]:
        #             rest_image = {
        #                 "id": int(media_node["id"].split("/")[-1]),
        #                 "alt": None,
        #                 "src": media_node["preview"]["image"]["url"],
        #                 "variant_ids": []
        #             }
        #             rest_product["images"].append(rest_image)

        # Appending Variant_ids in image variant_ids array

        # Processing variants
        for variant_edge in product["variants"]["edges"]:
            variant = variant_edge["node"]
            rest_variant = {
                "id": int(variant["id"].split("/")[-1]),
                "product_id": rest_product["id"],
                "title": variant["title"],
                "price": variant["price"],
                "compare_at_price": variant["compareAtPrice"],
                "inventory_quantity": variant["inventoryQuantity"],
                "image_id": variant['image'].get('id').split('/')[-1] if variant['image'] else None,
            }
            image_id_added = False
            for image in rest_product['images']:

                # if variant['image'] and int(image['id']) == int(variant['image'].get('id', None).split('/')[-1]) if variant['image'] else None:
                if variant.get('image') and variant['image'].get('id') and int(image['id']) == int(variant['image']['id'].split('/')[-1]):

                    image['variant_ids'].append(
                        int(rest_variant['id']))
                    image_id_added = True
            if not image_id_added and variant['image']:
                rest_image = {
                    "id": int(variant['image'].get('id', None).split("/")[-1]),
                    "alt": "demo purpose",
                    "src": variant["image"]["url"],
                    "variant_ids": [int(variant["id"].split("/")[-1]),]
                }
                rest_product['images'].append(rest_image)

            # Add the options dynamically
            for index, option in enumerate(variant["selectedOptions"]):
                rest_variant[f"option{index + 1}"] = option["value"]

            # Fill in any missing options with None
            for i in range(len(variant["selectedOptions"]) + 1, 4):
                rest_variant[f"option{i}"] = None

            rest_product["variants"].append(rest_variant)

        # rest_product["images"].append(rest_product["image"])
        final_products.append(rest_product)

    return final_products
