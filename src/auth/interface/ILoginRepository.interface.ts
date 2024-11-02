import { Types } from 'mongoose';
import { User } from '../../user/schema/user.schema';
import { RefreshToken } from '../schema/refresh.token.schema';
import { LoginDto } from '../dto/login.dto';

export interface ILoginRepository {
  findUser(userData: LoginDto): Promise<User | null>;
  findUserById(userId: Types.ObjectId): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findJwtUserById(userId: Types.ObjectId): Promise<User | null>;
  storeRefreshToken(token: string, userId: Types.ObjectId): Promise<void>;
  findRefreshToken(refreshToken: string): Promise<RefreshToken | null>;
  deleteRefreshToken(refreshToken: string): Promise<void>;
}
