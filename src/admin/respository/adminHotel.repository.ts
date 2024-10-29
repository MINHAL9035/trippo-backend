import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OwnerRequest } from 'src/hotel-owner/schema/PendingRequest.schema';
import { UnverifiedOwner } from 'src/hotel-owner/schema/UnverifiedOwnerSchema';
@Injectable()
export class AdminHotelRepository {
  constructor(
    @InjectModel(OwnerRequest.name)
    private _OwnerRequest: Model<OwnerRequest>,
    @InjectModel(UnverifiedOwner.name)
    private _unverifiedOwner: Model<UnverifiedOwner>,
  ) {}

  async findPendingRequest(ownerId: Types.ObjectId) {
    const pendingRequest = await this._OwnerRequest.find({
      ownerId: ownerId,
      status: 'pending',
    });
    return pendingRequest;
  }
  async unverifiedUser(ownerId: Types.ObjectId) {
    const unverifiedOwner = await this._unverifiedOwner.findById(ownerId);
    return unverifiedOwner;
  }
}
