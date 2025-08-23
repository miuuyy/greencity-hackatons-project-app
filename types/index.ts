export interface User {
  _id: string;
  id: string; // virtual, same as _id
  email: string;
  username: string;
  role: 'resident' | 'organizer';
  points: number;
  participatedEvents: string[]; // array of event IDs
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  id: string; // virtual, same as _id
  title: string;
  description: string;
  type: 'cleanup' | 'planting' | 'recycling' | 'education' | 'other';
  date: string;
  startTime: string;
  endTime: string;
  location: {
    address: string;
    district: string;
    latitude: number;
    longitude: number;
  };
  organizer: User;
  maxParticipants: number;
  currentParticipants: User[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image: string;
  rewards: {
    type: 'points' | 'coupon' | 'discount' | 'social_bonus' | 'money';
    value: number | string;
    description: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  _id: string;
  id: string; // virtual, same as _id
  proposer: User;
  description: string;
  category: 'cleanup' | 'planting' | 'infrastructure' | 'other';
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  votes: number;
  voters: string[]; // array of user IDs
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Reward {
  id: string;
  type: 'points' | 'voucher' | 'discount' | 'badge' | 'money';
  value: number | string;
  description: string;
  icon?: string;
  sponsor?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface Vote {
  id: string;
  userId: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  category: 'cleanup' | 'planting' | 'infrastructure' | 'other';
  description: string;
  votes: number;
  createdAt: Date;
  status: 'pending' | 'approved' | 'in_progress' | 'completed';
}

export interface Participation {
  id: string;
  userId: string;
  eventId: string;
  status: 'registered' | 'confirmed' | 'completed' | 'cancelled';
  photoProof?: string;
  confirmedAt?: Date;
  rewardsReceived?: Reward[];
}

export interface Statistics {
  totalEvents: number;
  totalParticipants: number;
  totalTreesPlanted: number;
  totalWasteCollected: number; // in kg
  activeEvents: number;
  topDistricts: { name: string; score: number }[];
  monthlyGrowth: number; // percentage
}