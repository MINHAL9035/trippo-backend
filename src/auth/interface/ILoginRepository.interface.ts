import { Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { RefreshToken } from '../schema/refresh.token.schema';
import { LoginDto } from '../dto/login.dto';

export interface ILoginRepository {
  find(userData: LoginDto): Promise<User | null>;
  findUserById(userId: Types.ObjectId): Promise<User | null>;
  findJwtUserById(userId: string): Promise<User | null>;
  storeRefreshToken(token: string, userId: Types.ObjectId): Promise<void>;
  findRefreshToken(refreshToken: string): Promise<RefreshToken | null>;
  deleteRefreshToken(refreshToken: string): Promise<void>;
}
