import axios from 'axios';
import { GoogleProfileResponse } from '../interface/googleProfile.interface';
import { GoogleAuthDto } from '../dto/googleAuth.dto';

export default async function fetchGoggleUserDetails(
  googleResponse: GoogleAuthDto,
): Promise<GoogleProfileResponse> {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleResponse.access_token}`,
      {
        headers: {
          Authorization: `Bearer${googleResponse.access_token}`,
          Accept: 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log(error);

    throw new Error(error);
  }
}
