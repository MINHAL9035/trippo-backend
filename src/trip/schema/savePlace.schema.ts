import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

interface PhotoImage {
  url: string;
}

interface PhotoImages {
  medium: PhotoImage;
}

interface Photo {
  images: PhotoImages;
}

class PlaceData {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Number })
  longitude: number;

  @Prop({ required: true, type: Number })
  latitude: number;

  @Prop()
  price: string;

  @Prop({
    type: {
      images: {
        medium: {
          url: String,
        },
      },
    },
  })
  photo: Photo;

  @Prop()
  rating: string;

  @Prop()
  num_reviews: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop()
  distance_string: string;
}

@Schema({ timestamps: true })
export class SavedPlace extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Trip' })
  tripId: Types.ObjectId;

  @Prop({ required: true, type: PlaceData })
  placeData: PlaceData;
}

export const SavedPlaceSchema = SchemaFactory.createForClass(SavedPlace);
