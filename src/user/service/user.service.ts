import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { UserRegistrationDto } from '../dto/user.registration.dto';
import { UnverifiedUserInterface } from '../interface/user/IUnverifiedUser.interface';
import { UserInterface } from '../interface/user/IUser.interface';
import { IUserService } from '../interface/user/IUserService.interface';

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly _userRepository: UserRepository) {}

  /**
   * Registers a new user if the email is not already taken.
   *
   * @param userDto - User registration details (email, password, etc.).
   * @returns A promise resolving to the newly created unverified user.
   * @throws ConflictException if a user with the given email already exists.
   */
  async register(
    userDto: UserRegistrationDto,
  ): Promise<UnverifiedUserInterface> {
    const existingVerifiedUser = await this._userRepository.findByEmail(
      userDto.email,
    );
    if (existingVerifiedUser) {
      throw new ConflictException('A user with this email already exists');
    }
    const existingUnverifiedUser =
      await this._userRepository.findUnverifiedUser(userDto.email);
    if (existingUnverifiedUser) {
      await this._userRepository.deleteUnverifiedUser(userDto.email);
    }
    const UnverifiedUser: UnverifiedUserInterface = {
      ...userDto,
      verified: false,
    };
    return await this._userRepository.createUnverifiedUser(UnverifiedUser);
  }

  /**
   * Verifies a user's email and converts an unverified user to a verified user.
   *
   * @param email - The email of the user to verify.
   * @throws NotFoundException if the unverified user is not found.
   * @throws ConflictException if a verified user with the same email already exists.
   */
  async verifyUser(email: string): Promise<void> {
    const unverifiedUser = await this._userRepository.findUnverifiedUser(email);
    if (!unverifiedUser) {
      throw new NotFoundException('Unverified user not found');
    }
    const existingVerifiedUser = await this._userRepository.findByEmail(email);
    if (existingVerifiedUser) {
      throw new ConflictException(
        'A verified user with this email already exists',
      );
    }
    const verifiedUser: UserInterface = {
      firstName: unverifiedUser.firstName,
      lastName: unverifiedUser.lastName,
      email: unverifiedUser.email,
      password: unverifiedUser.password,
      verified: true,
      isAdmin: false,
    };
    await this._userRepository.createUser(verifiedUser);
    await this._userRepository.deleteUnverifiedUser(email);
  }
}
