import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_FILES = 10;

  transform(value: any) {
    if (Array.isArray(value)) {
      // Multiple files
      if (value.length > this.MAX_FILES) {
        throw new BadRequestException(
          `Cannot upload more than ${this.MAX_FILES} files`,
        );
      }

      value.forEach((file) => this.validateFile(file));
    } else if (value) {
      // Single file
      this.validateFile(value);
    }

    return value;
  }

  private validateFile(file: Express.Multer.File) {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File ${file.originalname} is too large. Maximum size is 5MB`,
      );
    }
  }
}
