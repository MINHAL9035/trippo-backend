export interface ILogin {
  userId: string;
  userName: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  role: string;
}
export interface IOwnerLogin {
  ownerId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}
