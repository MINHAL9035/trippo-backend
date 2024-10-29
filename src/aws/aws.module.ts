import { Module } from '@nestjs/common';
import { S3Service } from './aws.service';

@Module({
  imports: [],
  controllers: [],
  providers: [S3Service],
})
export class AwsModule {}
