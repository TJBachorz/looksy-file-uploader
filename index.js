require("dotenv").config()
const express = require("express");
const app = express()
const cors = require("cors")
app.use(cors())

// Dependencies
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

// This creates an authenticated S3 instance
const s3 = new aws.S3({
    apiVersion: "2006-03-01",
    region: process.env.REGION,
    credentials: {
        secretAccessKey: process.env.AWS_SECRET_KEY,
        accessKeyId: process.env.ACCESS_KEY_ID
    }
});

// This is middleware that will process the multipart file upload
const upload = multer({
    storage: multerS3({
        s3, // The s3 instance from above
        // The name of your S3 bucket
        bucket: process.env.BUCKET_NAME,
        key: (request, file, next) => {
            // This names the file. This example prepends the
            // UNIX timestamp to original name of the file,
            // which helps with duplicate file names
            next(null, `files/${Date.now()}_${file.originalname}`);
        }
    })
});

// The upload object from above has a `.single` method that runs as middleware,
// and then adds `file` to the `request` object. "file" is the `name` from
// the file upload form.
app.post("/upload", upload.single("file"), (request, response) => {
    // Return the URL the file was uploaded to- optionally, store it
    // in a database first.
    response.json({data: request.file.location});
});

const PORT = process.env.PORT || 4000
app.listen(PORT)