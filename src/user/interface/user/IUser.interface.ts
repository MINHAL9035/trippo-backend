export interface UserInterface {
  id?: string;
  fullName: string;
  userName: string;
  email: string;
  password?: string;
  verified?: boolean;
  is_blocked?: boolean;
  isGoogle: boolean;
  image?: string;
  role: string;
}
