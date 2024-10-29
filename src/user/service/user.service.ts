import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { UserRegistrationDto } from '../dto/user.registration.dto';
import { UnverifiedUserInterface } from '../interface/user/IUnverifiedUser.interface';
import { UserInterface } from '../interface/user/IUser.interface';
import { IUserService } from '../interface/user/IUserService.interface';
import { Types } from 'mongoose';
import { PendingBookingDto } from '../dto/pendingBooking.dto';
import { ProfileService } from './profile.service';

@Injectable()
export class UserService implements IUserService {
  private readonly _logger = new Logger(UserService.name);
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _profileService: ProfileService,
  ) {}

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

      const existingVerifiedUserByUsername =
        await this._userRepository.findByUsername(userDto.userName);
      if (existingVerifiedUserByUsername) {
        throw new ConflictException('Username already taken');
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
      this._logger.error(error);
      throw error;
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
        fullName: unverifiedUser.fullName,
        userName: unverifiedUser.userName,
        email: unverifiedUser.email,
        password: unverifiedUser.password,
        verified: true,
        isGoogle: false,
        role: unverifiedUser.role,
      };

      const createdUser = await this._userRepository.createUser(verifiedUser);
      const userId = new Types.ObjectId(createdUser.id);
      await this._profileService.createWallet(userId);
      await this._userRepository.deleteUnverifiedUser(email);

      this._logger.log(`User verified: ${email}`);
      return verifiedUser;
    } catch (error) {
      this._logger.error(error);
      throw error;
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
      this._logger.error(error);
      throw error;
    }
  }

  async searchHotels(searchData: any) {
    try {
      const hotels = await this._userRepository.findHotels(searchData);
      return hotels;
    } catch (error) {
      this._logger.error(error);
      throw new error();
    }
  }

  async getSingleHotelDetails(hotelId: Types.ObjectId) {
    try {
      const hotelDetails = await this._userRepository.findHotelById(hotelId);
      return hotelDetails;
    } catch (error) {
      this._logger.error(error);
      throw new error();
    }
  }

  async createPendingBooking(PendingBookingDto: PendingBookingDto) {
    try {
      const pendingBooking =
        await this._userRepository.createPendingBooking(PendingBookingDto);
      return pendingBooking;
    } catch (error) {
      this._logger.error(error);
      throw new error();
    }
  }

  async getBookingDetails(bookingId: string) {
    try {
      const bookingDetails =
        await this._userRepository.findBookingDetails(bookingId);
      return bookingDetails;
    } catch (error) {
      this._logger.error(error);
      throw new error();
    }
  }
  async getCompletedBooking(bookingId: string) {
    try {
      const completedBooking =
        await this._userRepository.findCompletedBooking(bookingId);
      console.log('completed', completedBooking);

      return completedBooking;
    } catch (error) {
      this._logger.error(error);
      throw new error();
    }
  }
  async getuserBookings(userId: Types.ObjectId) {
    try {
      const userBookings = await this._userRepository.findUserBookings(userId);
      return userBookings;
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }
  async getCancelledBookings(userId: Types.ObjectId) {
    try {
      const userBookings =
        await this._userRepository.findUserCancelBookings(userId);
      return userBookings;
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }
}
