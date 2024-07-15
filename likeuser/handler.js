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

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const likeUser = async (event, context) => {
  console.log(event);
  const body = event.Records[0].body;
  const { userId } = JSON.parse(body);
  console.log(userId);
  const params = {
    TableName: "Users",
    Key: {
      id: { S: userId },
    },
    UpdateExpression: "ADD likes :inc",
    ExpressionAttributeValues: {
      ":inc": { N: "1" },
    },
    ReturnValues: "ALL_NEW",
  };
  const result = await client.send(new UpdateItemCommand(params));

  await sleep(4000);

  console.log(result);
};

module.exports = { likeUser };
