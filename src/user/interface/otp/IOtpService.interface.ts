import { OTP } from './IOtp.interface';

export interface IOtpService {
  createOtp(email: string): Promise<OTP>;
  sendOtpEmail(email: string, otp: number): Promise<void>;
  sendOtp(email: string): Promise<void>;
  verifyOtp(email: string, otp: number): Promise<void>;
}
