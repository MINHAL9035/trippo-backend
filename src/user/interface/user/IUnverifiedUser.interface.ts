export interface UnverifiedUserInterface {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  verified?: boolean;
  role: string;
}
