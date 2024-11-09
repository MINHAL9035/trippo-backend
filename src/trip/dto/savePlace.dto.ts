export class SavePlaceDto {
  placeData: {
    name: string;
    longitude: number;
    latitude: number;
    price: string;
    photo: {
      images: {
        medium: { url: string };
      };
    };
    rating: string;
    num_reviews: string;
    address: string;
    phone: string;
    distance_string: string;
  };
  tripId: string;
}
