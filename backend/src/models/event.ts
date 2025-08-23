import mongoose, { Document, models, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  type: 'cleanup' | 'planting' | 'recycling' | 'education' | 'other';
  date: Date;
  startTime: string;
  endTime: string;
  location: {
    address: string;
    district: string;
    latitude: number;
    longitude: number;
  };
  organizer: Schema.Types.ObjectId;
  maxParticipants: number;
  currentParticipants: Schema.Types.ObjectId[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image: string;
  rewards: {
    type: 'points' | 'coupon' | 'discount' | 'social_bonus' | 'money';
    value: number | string;
    description: string;
  }[];
}

const EventSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['cleanup', 'planting', 'recycling', 'education', 'other'],
    required: true,
  },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    district: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  maxParticipants: { type: Number, required: true },
  currentParticipants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  image: { type: String, required: true },
  rewards: [{
    type: {
      type: String,
      enum: ['points', 'coupon', 'discount', 'social_bonus', 'money'],
      required: true
    },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String }
  }],
}, {
  timestamps: true,
});

export default models.Event || mongoose.model<IEvent>('Event', EventSchema);
