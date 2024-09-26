import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HotelInterface } from '../interface/IHotel.interface';
import { CreateHotelDto } from '../dto/createHotel.dto';
import { HotelRepository } from '../repository/hotelRepository';
import { OwnerRepository } from '../repository/ownerRepository';
import { Types } from 'mongoose';
import { UpdateHotelDto } from '../dto/updateHotel.dto';
import { SubmitDetailsDto } from '../dto/submitDetails.dto';

@Injectable()
export class HotelService {
  private readonly _logger = new Logger(HotelService.name);
  constructor(
    private readonly _hotelRepository: HotelRepository,
    private readonly _OwnerRepository: OwnerRepository,
  ) {}
  async createHotel(CreateHotelDto: CreateHotelDto): Promise<HotelInterface> {
    try {
      const owner = await this._OwnerRepository.findByEmail(
        CreateHotelDto.ownerEmail,
      );
      if (!owner) {
        throw new NotFoundException(`Owner with email  not found`);
      }
      const hotelData = {
        ...CreateHotelDto,
        ownerId: owner._id,
      };
      const newHotel = await this._hotelRepository.createHotel(hotelData);
      return newHotel;
    } catch (error) {
      this._logger.error(error);
      throw error;
    }
  }

  async getDetails(email: string): Promise<HotelInterface> {
    try {
      const owner = await this._OwnerRepository.findByEmail(email);
      if (!owner) {
        throw new NotFoundException('owner not found');
      }
      const hotelDetails = await this._hotelRepository.findHotelDetails(
        owner._id,
      );
      return hotelDetails;
    } catch (error) {
      this._logger.error(error);
      throw error;
    }
  }

  async updateHotel(
    hotelId: Types.ObjectId,
    UpdateHotelDto: UpdateHotelDto,
  ): Promise<HotelInterface> {
    try {
      const updatedHotel = await this._hotelRepository.updateHotel(
        hotelId,
        UpdateHotelDto,
      );
      return updatedHotel;
    } catch (error) {
      this._logger.error(error);
      throw error;
    }
  }

  async getFullDetails(hotelId: Types.ObjectId) {
    try {
      const hotelDetails = await this._hotelRepository.findHotelById(hotelId);
      if (!hotelDetails) {
        throw new Error('Hotel not found');
      }
      return hotelDetails;
    } catch (error) {
      this._logger.error(error);
      throw error;
    }
  }

  async submitDetails(SubmitDetailsDto: SubmitDetailsDto) {
    try {
      const newRequest =
        await this._hotelRepository.createRequest(SubmitDetailsDto);
      return newRequest;
    } catch (error) {
      this._logger.error(error);
      throw error;
    }
  }
}
