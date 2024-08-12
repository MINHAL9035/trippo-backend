import { Types } from 'mongoose';
import { LoginDto } from 'src/auth/dto/login.dto';
import { RefreshToken } from 'src/auth/schema/refresh.token.schema';
import { User } from 'src/user/schema/user.schema';

export interface IAuthRepository {
  findUser(userData: LoginDto): Promise<User | null>;
  storeRefreshToken(token: string, userId: Types.ObjectId): Promise<void>;
  findRefreshToken(refreshToken: string): Promise<RefreshToken | null>;
}
