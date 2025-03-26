require("dotenv").config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const upload = multer();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

exports.uploadFile = async (req, res) => {
    try {
        const file = req.file;

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(params);
        const data = await s3.send(command);
        
        if(data.$metadata.httpStatusCode!=200){
            res.status(500).json({ success: false, message: "file upload to s3 failed" });
        }

        let url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.originalname}`

        res.status(200).json({ success: true, data: { fileUrl: url, fileName: file.originalname }});
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};
