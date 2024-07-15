const {
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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
const clientS3 = new S3Client(paramsS3Client);

const uploadS3 = async (file, fileName) => {
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: `upload/${fileName}`,
    Body: file,
    ContentType: "image/png",
  });
  const response = await clientS3.send(command);
  console.log(response);
  const commandGet = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: `upload/${fileName}`,
  });

  console.log("commandGer", commandGet);
  const signerUrl = await getSignedUrl(clientS3, commandGet, {
    expiresIn: 300,
  });

  return signerUrl;
};

module.exports = { uploadS3 };
