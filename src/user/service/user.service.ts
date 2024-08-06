import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { UserRegistrationDto } from '../Dto/user.registration.dto';
import { UnverifiedUserInterface } from '../interface/unverifiedUser.interface';
import { UserInterface } from '../interface/user.interface';

@Injectable()
export class UserService {
  constructor(private readonly UserRepository: UserRepository) {}

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
    const existingVerifiedUser = await this.UserRepository.findByEmail(
      userDto.email,
    );
    if (existingVerifiedUser) {
      throw new ConflictException('A user with this email already exists');
    }
    const existingUnverifiedUser = await this.UserRepository.findUnverifiedUser(
      userDto.email,
    );
    if (existingUnverifiedUser) {
      await this.UserRepository.deleteUnverifiedUser(userDto.email);
    }
    const UnverifiedUser: UnverifiedUserInterface = {
      ...userDto,
      verified: false,
    };
    return await this.UserRepository.createUnverifiedUser(UnverifiedUser);
  }

  async verifyUser(email: string): Promise<void> {
    const unverifiedUser = await this.UserRepository.findUnverifiedUser(email);
    if (!unverifiedUser) {
      throw new NotFoundException('Unverified user not found');
    }
    // Check if a verified user with this email already exists
    const existingVerifiedUser = await this.UserRepository.findByEmail(email);
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

    await this.UserRepository.createUser(verifiedUser);
    await this.UserRepository.deleteUnverifiedUser(email);
  }
}
