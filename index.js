#!/usr/bin/env node
const argv = require("yargs").argv;
const AWS = require("aws-sdk");
const fs = require("graceful-fs");

const downloadFile = (fileName, params, region = 'us-east-1') =>
  new Promise((resolve, reject) => {
    const s3 = new AWS.S3({ apiVersion: "2006-03-01", region });
    const fileStream = fs.createWriteStream(fileName);
    const s3Stream = s3.getObject(params).createReadStream();

    s3Stream.on("error", function (err) {
      reject(err);
    });

    s3Stream
      .pipe(fileStream)
      .on("error", function (err) {
        reject(err);
      })
      .on("close", function () {
        resolve("done");
      });
  });

const main = async ({ target, name, bucketName, key, region, profile }) => {
  try {
    if (!bucketName) throw new Error("bucket name is mandatory.");
    if (!key) throw new Error("key is mandatory.");
    if (profile) {
      const credentials = new AWS.SharedIniFileCredentials({ profile });
      AWS.config.credentials = credentials;
    }

    const fileName = target || name;
    if (!fileName) throw new Error("output file name is mandatory.");
    const params = {
      Bucket: bucketName,
      Key: key
    };
    const res = await downloadFile(fileName, params, region);
    console.log("finished", res);
  } catch (error) {
    console.error(error);
  }
};

main(argv);
