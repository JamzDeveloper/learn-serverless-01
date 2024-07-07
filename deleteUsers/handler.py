import boto3, json, os

client = boto3.resource('dynamodb')

IS_OFFLINE = os.getenv('IS_OFFLINE',False)
if IS_OFFLINE:
    boto3.Session(
        aws_access_key_id='test',
        aws_secret_access_key='test',
    )
    client = boto3.resource('dynamodb', endpoint_url='http://localhost:8000')

table = client.Table('Users')


def deleteUsers(event,context):
    user_id = event['pathParameters']['id']
    result = table.delete_item(Key={'id': user_id})

    body =json.dumps({'message':f"user {user_id} deleted successfully"})
    response = {
        'statusCode': result['ResponseMetadata']['HTTPStatusCode'],
        'body': body
    }
    return response

