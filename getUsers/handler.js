const {
  DynamoDBClient,
  ListBackupsCommand,
  ListTablesCommand,
  ScanCommand,
  GetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

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

const getUsers = async (event, context) => {
  try {
    const userId = event.pathParameters.id;

    const command = new GetItemCommand({
      TableName: "Users",
      Key: {
        id: { S: userId },
      },
    });
    console.log("user params", userId);

    const result = await docClient.send(command);
    console.log(result);

    if (result.Item) {
      const unmarshallItem = unmarshall(result.Item);
      return {
        statusCode: 200,
        body: JSON.stringify(unmarshallItem),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "User not found",
        }),
      };
    }
  } catch (e) {
    console.log(e);
  }
};

const users = async (event, context) => {
  const params = new ScanCommand({
    TableName: "Users",
  });
  const result = await docClient.send(params);
  const unmarshallItems = result.Items.map((item) => unmarshall(item));

  console.log(unmarshallItems);

  return {
    statusCode: 200,
    body: JSON.stringify(unmarshallItems),
  };
};

module.exports = {
  getUsers,
  users,
};
