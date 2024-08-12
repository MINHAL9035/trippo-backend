import { UnverifiedUserInterface } from './IUnverifiedUser.interface';
import { UserInterface } from './IUser.interface';

export interface IUserRepository {
  createUser(userData: UserInterface): Promise<UserInterface>;
  createUnverifiedUser(
    userData: UnverifiedUserInterface,
  ): Promise<UnverifiedUserInterface>;
  findByEmail(email: string): Promise<UserInterface | null>;
  findUnverifiedUser(email: string): Promise<UnverifiedUserInterface | null>;
  deleteUnverifiedUser(email: string): Promise<void>;
}
