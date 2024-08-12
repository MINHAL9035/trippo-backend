import { OTP } from './IOtp.interface';

export interface IOtpRepository {
  saveOtp(email: string, otp: number): Promise<OTP>;
  findByEmail(email: string): Promise<OTP | null>;
  deleteByEmail(email: string): Promise<void>;
}
