export class CreateAiTripDto {
  userInput: {
    place: string;
    days: string;
    budget: string;
    travelers: string;
  };
  aiGeneratedTrip: Record<string, any>;
}
