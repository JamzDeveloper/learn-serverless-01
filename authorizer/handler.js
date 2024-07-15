const authorizer = async (event, contet) => {
  let date = new Date();

  let minutes = date.getMinutes();
  let hours = date.getHours();

  if (
    event.authorizationToken ===
    `Bearer ${process.env.SECRET_EGG}-${hours}-${minutes}`
  ) {
    return {
      principalId: "anonymous",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: event.methodArn,
          },
        ],
      },
    };
  }
  throw Error("Unauthorized");
};

module.exports = { authorizer };
