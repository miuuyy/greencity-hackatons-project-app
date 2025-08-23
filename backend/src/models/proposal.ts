import mongoose, { Document, models, Schema } from 'mongoose';

export interface IProposal extends Document {
  proposer: Schema.Types.ObjectId;
  description: string;
  category: 'cleanup' | 'planting' | 'infrastructure' | 'other';
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  votes: number;
  voters: Schema.Types.ObjectId[];
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
}

const ProposalSchema: Schema = new Schema({
  proposer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['cleanup', 'planting', 'infrastructure', 'other'],
    required: true,
  },
  location: {
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  votes: {
    type: Number,
    default: 0,
  },
  voters: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'in_progress', 'completed', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

export default models.Proposal || mongoose.model<IProposal>('Proposal', ProposalSchema);
