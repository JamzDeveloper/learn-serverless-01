const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const { Readable } = require("stream");

const sharp = require("sharp");
const util = require("util");

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
const s3 = new S3Client(paramsS3Client);

const handler = async (event, context) => {
  // Read options from the event parameter and get the source bucket
  console.log(
    "Reading options from event:\n",
    util.inspect(event, { depth: 5 })
  );
  const srcBucket = event.Records[0].s3.bucket.name;

  // Object key may have spaces or unicode non-ASCII characters
  const srcKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );
  const dstBucket = srcBucket;
  const dstKey = "resized-" + srcKey;

  // Infer the image type from the file suffix
  const typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.log("Could not determine the image type.");
    return;
  }

  // Check that the image type is supported
  const imageType = typeMatch[1].toLowerCase();
  if (imageType != "jpg" && imageType != "png") {
    console.log(`Unsupported image type: ${imageType}`);
    return;
  }

  // Get the image from the source bucket. GetObjectCommand returns a stream.
  try {
    const params = {
      Bucket: srcBucket,
      Key: srcKey,
    };
    var response = await s3.send(new GetObjectCommand(params));
    var stream = response.Body;

    // Convert stream to buffer to pass to sharp resize function.
    if (stream instanceof Readable) {
      var content_buffer = Buffer.concat(await stream.toArray());
    } else {
      throw new Error("Unknown object stream type");
    }
  } catch (error) {
    console.log(error);
    return;
  }

  const widths = [50, 100, 200];

  const arrayPromise = widths.map(
    (width) =>
      new Promise((resolve, reject) => {
        resizer(content_buffer, width, dstBucket, dstKey)
          .then((result) => {
            resolve(result);
          })
          .catch((err) => {
            reject(err);
          });
      })
  );

  const results = await Promise.all(arrayPromise);


  console.log(
    "Successfully resized " +
      srcBucket +
      "/" +
      srcKey +
      " and uploaded to " +
      dstBucket +
      "/" +
      dstKey,
    results
  );
};

const resizer = async (imgBody, newSize, dstBucket, dstKey) => {
  let buffer = null;

  const arrayDest = dstKey.split("/");
  const dstKeyFinal = arrayDest[0] + "/" + newSize + "-" + arrayDest[1];
  try {
    buffer = await sharp(imgBody).resize(newSize).toBuffer();
  } catch (err) {
    console.log(err);
    return;
  }
  try {
    const destParams = {
      Bucket: dstBucket,
      Key: dstKeyFinal,
      Body: buffer,
      ContentType: "image",
    };

    const putResult = await s3.send(new PutObjectCommand(destParams));
    return putResult;
  } catch (err) {
    console.log(err);
    return;
  }
};

module.exports = { handler };
