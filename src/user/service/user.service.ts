import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { UserRegistrationDto } from '../dto/user.registration.dto';
import { UnverifiedUserInterface } from '../interface/user/IUnverifiedUser.interface';
import { UserInterface } from '../interface/user/IUser.interface';
import { IUserService } from '../interface/user/IUserService.interface';

@Injectable()
export class UserService implements IUserService {
  private readonly _logger = new Logger(UserService.name);
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
    try {
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

      const unverifiedUser: UnverifiedUserInterface = {
        ...userDto,
        verified: false,
        role: userDto.role,
      };

      const createdUser =
        await this._userRepository.createUnverifiedUser(unverifiedUser);
      this._logger.log(`User registered: ${userDto.email}`);
      return createdUser;
    } catch (error) {
      this._logger.error(
        `Failed to register user: ${userDto.email}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  /**
   * Verifies a user's email and converts an unverified user to a verified user.
   *
   * @param email - The email of the user to verify.
   * @throws NotFoundException if the unverified user is not found.
   * @throws ConflictException if a verified user with the same email already exists.
   */
  async verifyUser(email: string): Promise<UserInterface> {
    try {
      const unverifiedUser =
        await this._userRepository.findUnverifiedUser(email);
      if (!unverifiedUser) {
        throw new NotFoundException('Unverified user not found');
      }

      const existingVerifiedUser =
        await this._userRepository.findByEmail(email);
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
        role: unverifiedUser.role,
      };

      await this._userRepository.createUser(verifiedUser);
      await this._userRepository.deleteUnverifiedUser(email);

      this._logger.log(`User verified: ${email}`);
      return verifiedUser;
    } catch (error) {
      this._logger.error(
        `Failed to verify user: ${email}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to verify user');
    }
  }

  /**
   * Retrieves the details of a user based on their email address.
   *
   * @param email - The email address of the user whose details are being retrieved.
   * @returns A promise that resolves to the user's details as an object implementing the `UserInterface`.
   * @throws NotFoundException if no user is found with the given email address.
   */
  async getUserDetails(email: string): Promise<UserInterface> {
    try {
      const user = await this._userRepository.findByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      this._logger.error(
        `Failed to find user: ${email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
