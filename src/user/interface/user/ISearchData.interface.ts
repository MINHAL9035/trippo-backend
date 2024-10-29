export interface SearchState {
  selectedPlace: string;
  checkInDate: string | null;
  checkOutDate: string | null;
  guests: {
    adults: number;
    children: number;
    childrenAges: number[];
    rooms: number;
  };
}
