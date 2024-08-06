export interface UserInterface {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  verified?: boolean;
  createdAt?: Date;
}
