export interface IForgotService {
  forgotOtp(email: string): Promise<void>;
  verifyOtp(email: string, otp: number): Promise<void>;
  changePassword(email: string, newPassword: string): Promise<string>;
}
