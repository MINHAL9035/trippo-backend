export interface UnverifiedUserInterface {
  id?: string;
  fullName: string;
  userName: string;
  email: string;
  password: string;
  verified?: boolean;
  role: string;
}
