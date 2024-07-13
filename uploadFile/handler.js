const fs = require("fs");
const path = require("path");
const {
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { uploadS3 } = require("../lib/uploadS3");

let paramsS3Client = {};
if (process.env.IS_OFFLINE) {
  paramsS3Client = {
    region: "fakeRegion",
    endpoint: "http://0.0.0.0:8000",
    credentials: {
      accessKeyId: "fakeMyKeyId",
      secretAccessKey: "fakeSecretAccessKey",
    },
  };
}
//  else {
//   paramsS3Client = {
//     region: "us-east-1", // Asegúrate de que la región esté configurada correctamente
//   };
// }

const clientS3 = new S3Client(paramsS3Client);

const isBase64 = (str = "") => {
  const notBase64 = /[^A-Z0-9+\/=]/i;
  const len = str.length;
  if (!len || len % 4 !== 0 || notBase64.test(str)) {
    return false;
  }
  const firstPaddingChar = str.indexOf("=");
  return (
    firstPaddingChar === -1 ||
    firstPaddingChar === len - 1 ||
    (firstPaddingChar === len - 2 && str[len - 1] === "=")
  );
};

const uploadFile = async (event, context) => {
  const fileName = event.queryStringParameters.fileName;

  console.log("filename", fileName);
  let fileContent;

  const base64 = event.body.replace(/^data:image\/\w+;base64,/, "");
  fileContent = Buffer.from(base64, "base64");

  // fs.writeFileSync(path.join("", fileName), event.body, "binary");

  console.log(event);

  // if (isBase64(event.body)) {
  //   fileContent = Buffer.from(event.body, "base64");
  // } else {
  // fileContent = Buffer.from(event.body, "binary");
  // }
  console.log(fileContent);

  //  fs.writeFileSync(fileName,fileContent)
  // const command = new PutObjectCommand({
  //   Bucket: process.env.BUCKET_NAME,
  //   Key: `upload/${fileName}`,
  //   Body: fileContent,
  //   ContentType: "image/png",
  // });
  // const response = await clientS3.send(command);
  // console.log(response);
  // const commandGet = new GetObjectCommand({
  //   Bucket: process.env.BUCKET_NAME,
  //   Key: `upload/${fileName}`,
  // });

  // console.log("commandGer", commandGet);
  // const signerUrl = await getSignedUrl(clientS3, commandGet, {
  //   expiresIn: 300,
  // });

  const signerUrl = await uploadS3(fileContent, fileName);
  return {
    statusCode: 200,
    body: JSON.stringify({
      url: signerUrl,
    }),
  };
};

module.exports = {
  uploadFile,
};
