import { User } from '../../user/schema/user.schema';

export interface IForgotRepository {
  findUser(email: string): Promise<User | null>;
  findGoogleUser(email: string): Promise<User | null>;
  updateUser(email: string, hashedPassword: string): Promise<User | null>;
}
