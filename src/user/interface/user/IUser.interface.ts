export interface UserInterface {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  verified?: boolean;
  is_blocked?: boolean;
  image?: string;
  role: string;
}
