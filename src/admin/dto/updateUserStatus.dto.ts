import { IsArray, IsEnum, IsString } from 'class-validator';

export class UpdateUserStatusDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @IsEnum(['block', 'unblock'])
  action: 'block' | 'unblock';
}
