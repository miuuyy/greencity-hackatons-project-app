import mongoose, { Document, models, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  password?: string;
  role: 'resident' | 'organizer';
  points: number;
  participatedEvents: Schema.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
  },
  username: {
    type: String,
    required: [true, 'Please provide a username.'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    select: false, // Do not return password by default
  },
  role: {
    type: String,
    enum: ['resident', 'organizer'],
    default: 'resident',
  },
  points: {
    type: Number,
    default: 0,
  },
  participatedEvents: [{
    type: Schema.Types.ObjectId,
    ref: 'Event',
  }],
}, {
  timestamps: true,
});

export default models.User || mongoose.model<IUser>('User', UserSchema);
