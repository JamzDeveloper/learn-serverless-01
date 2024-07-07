const {
  DynamoDBClient,
  ListBackupsCommand,
  ListTablesCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");

let paramsDynamoDBClient = {};

if (process.env.IS_OFFLINE) {
  paramsDynamoDBClient = {
    region: "fakeRegion",
    endpoint: "http://0.0.0.0:8000",
    credentials: {
      accessKeyId: "fakeMyKeyId",
      secretAccessKey: "fakeSecretAccessKey",
    },
  };
}
const client = new DynamoDBClient(paramsDynamoDBClient);

const docClient = DynamoDBDocumentClient.from(client);

const updateUsers = async (event, context) => {
  try {
    const userId = event.pathParameters.id;

    console.log(userId);
    const command = new UpdateItemCommand({
      TableName: "Users",
      Key: {
        id: { S: userId },
      },
      UpdateExpression: "SET #testFileITem = :newValue",
      ExpressionAttributeNames: {
        "#testFileITem": "name",
      },
      ExpressionAttributeValues: {
        ":newValue": { S: "newName" },
      },
      ReturnValues: "UPDATED_NEW",
    });

    const updateResult = await docClient.send(command);
    console.log(updateResult);
    const userBody = JSON.parse(event.body);
    return {
      statusCode: 200,
      body: JSON.stringify(updateResult.Attributes),
    };
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  updateUsers,
};
