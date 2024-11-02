import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminHotelRepository } from '../respository/adminHotel.repository';
import { Types } from 'mongoose';
import { Owner } from '../../hotel-owner/schema/owner.schema';
import { UnverifiedOwner } from '../../hotel-owner/schema/UnverifiedOwnerSchema';
import { OwnerRequest } from '../../hotel-owner/schema/PendingRequest.schema';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { UnverifiedHotel } from '../../hotel-owner/schema/UnverifiedHotel';
import { Hotel } from '../../hotel-owner/schema/HotelSchema';

@Injectable()
export class AdminHotelService {
  private readonly _logger = new Logger(AdminHotelService.name);
  constructor(
    @InjectModel(OwnerRequest.name)
    private _OwnerRequest: Model<OwnerRequest>,
    @InjectModel(Hotel.name)
    private _hotelModel: Model<Hotel>,
    private readonly _adminHotelRepository: AdminHotelRepository,
    @InjectModel(Owner.name) private _owner: Model<Owner>,
    @InjectModel(UnverifiedHotel.name)
    private _unVerifiedHotel: Model<UnverifiedHotel>,
    @InjectModel(UnverifiedOwner.name)
    private _unverifiedOwner: Model<UnverifiedOwner>,
    private readonly _configService: ConfigService,
    private readonly _mailerService: MailerService,
  ) {}

  async sendMail(email: string, status: 'accepted' | 'rejected') {
    const from = this._configService.get<string>('EMAIL_From');
    const websiteName = 'Trippo';

    let subject: string,
      headerText: string,
      mainContent: string,
      ctaButton: string;

    if (status === 'accepted') {
      subject = `Welcome to ${websiteName} - Your Account is Approved!`;
      headerText = 'Congratulations!';
      mainContent = `
        <p>We are thrilled to inform you that your account has been approved. You are now a verified owner on ${websiteName}.</p>
        <p>You can now log in to your account and start managing your property listings, bookings, and more.</p>
      `;
      ctaButton = `
        <a href="http://localhost:8080/hotelOwner/" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px;">Login to Your Account</a>
      `;
    } else {
      subject = `Update on Your ${websiteName} Account Application`;
      headerText = 'Application Status Update';
      mainContent = `
        <p>Thank you for your interest in joining ${websiteName} as a property owner.</p>
        <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
        <p>If you believe this decision was made in error or if you have additional information that might support your application, please don't hesitate to contact our support team.</p>
      `;
      ctaButton = `
        <a href="mailto:support@${websiteName.toLowerCase()}.com" style="background-color: #008CBA; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px;">Contact Support</a>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; background-color: #f4f7f9; margin: 0; padding: 0;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
          <tr>
            <td align="center" style="padding: 40px 0; background-color: #003366;">
              <h1 style="color: #ffffff; font-size: 32px; margin: 0; letter-spacing: 2px;">${websiteName}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #003366; font-size: 24px; margin-bottom: 20px; text-align: center;">${headerText}</h2>
              ${mainContent}
              <div style="text-align: center; margin-top: 30px;">
                ${ctaButton}
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #003366; color: #ffffff; text-align: center; padding: 20px; font-size: 14px;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${websiteName}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await this._mailerService.sendMail({
      to: email,
      from: from,
      subject: subject,
      html: htmlContent,
    });
  }

  async getRequets() {
    const requests = await this._OwnerRequest
      .find({ status: { $in: ['pending', 'rejected'] } })
      .populate('ownerId')
      .populate('hotelId')
      .sort({ createdAt: -1 });
    return requests;
  }

  async updateStatus(ownerId: Types.ObjectId, action: 'accepted' | 'rejected') {
    if (!Types.ObjectId.isValid(ownerId)) {
      throw new Error('Invalid ownerId');
    }

    if (action !== 'accepted' && action !== 'rejected') {
      throw new Error('Invalid action');
    }

    try {
      const pendingRequest =
        await this._adminHotelRepository.findPendingRequest(ownerId);
      if (!pendingRequest || pendingRequest.length === 0) {
        throw new Error('No pending request found for this owner');
      }

      const unverifiedOwner =
        await this._adminHotelRepository.unverifiedUser(ownerId);
      if (!unverifiedOwner) {
        throw new Error('Unverified owner not found');
      }

      const updatedRequest = await this._OwnerRequest.findOneAndUpdate(
        { ownerId: ownerId, status: 'pending' },
        { status: action === 'accepted' ? 'approved' : 'rejected' },
        { new: true },
      );

      if (!updatedRequest) {
        throw new Error('Failed to update request status');
      }

      if (action === 'accepted') {
        unverifiedOwner.is_verified = true;
        const newOwner = new this._owner(unverifiedOwner.toObject());
        await newOwner.save();
        await this._unverifiedOwner.findByIdAndDelete(ownerId);

        // Handle single hotel
        const unverifiedHotel = await this._unVerifiedHotel.findOne({
          ownerId: ownerId,
        });
        if (unverifiedHotel) {
          const verifiedHotel = new this._hotelModel(
            unverifiedHotel.toObject(),
          );
          verifiedHotel.isVerified = true;
          await verifiedHotel.save();
          await this._unVerifiedHotel.findByIdAndDelete(unverifiedHotel._id);
        }

        await this.sendMail(newOwner.email, 'accepted');
        return { message: 'Owner approved successfully and hotel verified' };
      } else {
        await this.sendMail(unverifiedOwner.email, 'rejected');
        return { message: 'Owner rejected successfully' };
      }
    } catch (error) {
      this._logger.error('Error in updateStatus:', error);
      throw new Error(`Failed to update owner status: ${error.message}`);
    }
  }
}
