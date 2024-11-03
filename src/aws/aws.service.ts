import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_KEY_SECRET,
      },
    });
  }

  async uploadFile(file: Express.Multer.File) {
    console.log('s3file', file);
    const { originalname } = file;
    return await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalname,
      file.mimetype,
    );
  }

  async s3_upload(
    file: Buffer,
    bucket: string,
    name: string,
    mimetype: string,
  ) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ACL: ObjectCannedACL.public_read,
      ContentType: mimetype,
      ContentDisposition: 'inline',
    };

    try {
      const command = new PutObjectCommand(params);
      const s3Response = await this.s3Client.send(command);
      const fileUrl = `https://${bucket}.s3.eu-north-1.amazonaws.com/${name}`;
      return {
        ...s3Response,
        Location: fileUrl,
        Key: name,
        Bucket: bucket,
      };
    } catch (error) {
      console.log(error);
      throw error; // Re-throw the error for better error handling
    }
  }
}
