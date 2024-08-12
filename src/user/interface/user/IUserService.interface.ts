import { UserRegistrationDto } from 'src/user/dto/user.registration.dto';
import { UnverifiedUserInterface } from './IUnverifiedUser.interface';

export interface IUserService {
  register(userDto: UserRegistrationDto): Promise<UnverifiedUserInterface>;
  verifyUser(email: string): Promise<void>;
}
