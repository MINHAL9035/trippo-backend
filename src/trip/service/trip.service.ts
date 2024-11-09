import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ITripService } from '../interface/ITripService';
import { Triprepository } from '../repository/tripRepository';
import { TripDto } from '../dto/createTrip.dto';
import { ITrip } from '../interface/Itrip.interface';
import { Model, Types } from 'mongoose';
import { CreateAiTripDto } from '../dto/aiTripCreation.dto';
import { InjectModel } from '@nestjs/mongoose';
import { AiTrip } from '../schema/aiTrip.schema';
import { SavePlaceDto } from '../dto/savePlace.dto';
import { Trip } from '../schema/tripSchema';
import { SavedPlace } from '../schema/savePlace.schema';

@Injectable()
export class TripService implements ITripService {
  private readonly _logger = new Logger(TripService.name);
  constructor(
    private readonly _tripRepository: Triprepository,
    @InjectModel(AiTrip.name) private readonly _aiTripModel: Model<AiTrip>,
    @InjectModel(Trip.name) private readonly _tripModel: Model<Trip>,
    @InjectModel(SavedPlace.name)
    private readonly _savePlaceModel: Model<SavedPlace>,
  ) {}

  async create(
    tripDto: TripDto,
    imageLocation: string,
    userId: Types.ObjectId,
  ): Promise<ITrip> {
    const existingTripName = await this._tripRepository.findTrip(
      tripDto.tripName,
    );
    if (existingTripName) {
      throw new ConflictException('Change trip name. Trip name already exists');
    }
    const tripData: ITrip = {
      ...tripDto,
      imageUrl: imageLocation,
      tripStartDate: new Date(tripDto.tripStartDate),
      tripEndDate: new Date(tripDto.tripEndDate),
      userId,
    };
    return await this._tripRepository.createTrip(tripData);
  }

  async tripDetails(
    userId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<{ trips: ITrip[]; totalCount: number; hasMore: boolean }> {
    try {
      const [trips, totalCount] = await Promise.all([
        this._tripRepository.findTripsByPage(userId, page, limit),
        this._tripRepository.countTrips(userId),
      ]);
      const hasMore = totalCount > page * limit;
      return { trips, totalCount, hasMore };
    } catch (error) {
      this._logger.error(error);
      throw error;
    }
  }

  private generateAiTripId(): string {
    const prefix = 'TRPAI';
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${randomNum}`;
  }

  async createAiTrip(createAiTripDto: CreateAiTripDto, userId: Types.ObjectId) {
    try {
      const tripId = this.generateAiTripId();
      const newAiTrip = new this._aiTripModel({
        userId: userId,
        tripId,
        userInput: createAiTripDto.userInput,
        tripData: createAiTripDto.aiGeneratedTrip,
      });
      return await newAiTrip.save();
    } catch (error) {
      this._logger.error('Error in createAiTrip', error);
      throw error;
    }
  }

  async getAiTrip(tripId: string): Promise<AiTrip> {
    try {
      const aiTripDetails = await this._aiTripModel.findOne({ tripId });
      return aiTripDetails;
    } catch (error) {
      this._logger.error('Error in getAiTrip', error);
      throw error;
    }
  }

  async savePlaceToTrip(SavePlaceDto: SavePlaceDto) {
    const trip = await this._tripModel.findById(SavePlaceDto.tripId);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    const savedPlace = new this._savePlaceModel({
      tripId: new Types.ObjectId(SavePlaceDto.tripId),
      placeData: SavePlaceDto.placeData,
    });
    return await savedPlace.save();
  }
}
