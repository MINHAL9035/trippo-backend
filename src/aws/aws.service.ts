import { Injectable, Logger } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private readonly s3: S3;
  private readonly logger = new Logger(S3Service.name);

  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_KEY_SECRET,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<S3.ManagedUpload.SendData> {
    try {
      const stream = Readable.from(file.buffer);

      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `hotels/${Date.now()}-${file.originalname}`,
        Body: stream,
        ContentType: file.mimetype,
      };

      const result = await this.s3.upload(uploadParams).promise();

      return result;
    } catch (error) {
      this.logger.error(`Failed to upload file ${file.originalname}:`, error);
      throw error;
    } finally {
      // Ensure cleanup
      file.buffer = null;
    }
  }
}
