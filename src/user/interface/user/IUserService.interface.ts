import { UserRegistrationDto } from '../../dto/user.registration.dto';
import { UnverifiedUserInterface } from './IUnverifiedUser.interface';
import { UserInterface } from './IUser.interface';

export interface IUserService {
  register(userDto: UserRegistrationDto): Promise<UnverifiedUserInterface>;
  verifyUser(email: string): Promise<UserInterface>;
  getUserDetails(email: string): Promise<UserInterface>;
}
