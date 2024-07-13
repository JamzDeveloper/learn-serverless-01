const {
  DynamoDBClient,

  PutItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const { v4: uuidv4 } = require("uuid");

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

const createUser = async (event, context) => {
  const userBody = JSON.parse(event.body);

  const item = {
    id: { S: uuidv4() },
    ...Object.fromEntries(
      Object.entries(userBody).map(([key, value]) => {
        if (key === "age") {
          return [key, { "N": value }];
        }

        return [key, { "S": value }];
      })
    ),
  };
  const params = {
    TableName: "Users",
    Item: item,
  };
  console.log(params);
  const command = new PutItemCommand(params);
  try {
    const result = await docClient.send(command);
    console.log(result);
    // const hour = new Date().getHours();
    // const minutes = new Date().getMinutes();
    // const seconds = new Date().getSeconds();

    return {
      statusCode: 200,
      body: JSON.stringify({
        ...result,
      }),
    };
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  createUser,
};
