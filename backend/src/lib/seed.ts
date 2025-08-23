// This script will seed the database with initial data.
// To run it, use: npm run seed

import dotenv from 'dotenv';
import path from 'path';

// Explicitly load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });


import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Event from '../models/event';
import Proposal from '../models/proposal';
import User from '../models/user';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected. Clearing existing data...');

    await User.deleteMany({});
    await Event.deleteMany({});
    await Proposal.deleteMany({});
    console.log('Existing data cleared.');

    console.log('Seeding new data...');

    // Create Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const resident = await User.create({
      username: 'John Smith',
      email: 'user@example.com',
      password: hashedPassword,
      role: 'resident',
      points: 2450,
    });

    const organizer = await User.create({
      username: 'NYC Parks Department',
      email: 'org@greencity.nyc',
      password: hashedPassword,
      role: 'organizer',
      points: 0,
    });
    
    console.log(`Created ${await User.countDocuments()} users.`);

    // Create Events
    const eventsData = [
        {
            title: 'Central Park Spring Cleanup',
            description: 'Join us for the annual spring cleanup of Central Park! We\'ll clear litter, prepare flower beds, and make our city\'s most beloved park shine for the season.',
            type: 'cleanup',
            location: {
              address: 'Central Park, Main Entrance (59th St & 5th Ave)',
              latitude: 40.764046,
              longitude: -73.973271,
              district: 'Manhattan',
            },
            date: new Date('2025-01-25'),
            startTime: '10:00',
            endTime: '14:00',
            maxParticipants: 100,
            organizer: organizer._id,
            currentParticipants: [resident._id],
            status: 'upcoming',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
            rewards: [
              { type: 'points', value: 150, description: '150 eco-points' },
              { type: 'coupon', value: 'Free Coffee', description: 'Free coffee voucher at Green Bean Cafe' },
            ],
          },
          {
            title: 'Broadway Tree Planting Initiative',
            description: 'Help green the Theater District! We\'ll plant 200 young oak trees along Broadway to improve air quality and create shade for pedestrians.',
            type: 'planting',
            location: {
              address: 'Broadway & 42nd Street, Times Square',
              latitude: 40.758896,
              longitude: -73.985130,
              district: 'Manhattan',
            },
            date: new Date('2025-01-28'),
            startTime: '09:00',
            endTime: '13:00',
            maxParticipants: 50,
            organizer: organizer._id,
            currentParticipants: [resident._id],
            status: 'upcoming',
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
            rewards: [ { type: 'points', value: 200, description: '200 eco-points' } ],
          },
          {
            title: 'Battery Collection Drive at Hudson Yards',
            description: 'Set up a collection point for used batteries at Hudson Yards. Bring your old batteries and earn rewards while helping the environment!',
            type: 'recycling',
            location: {
              address: 'Hudson Yards Shopping Center, Level 1',
              latitude: 40.753595,
              longitude: -74.001930,
              district: 'Manhattan',
            },
            date: new Date('2025-01-20'),
            startTime: '12:00',
            endTime: '18:00',
            maxParticipants: 200,
            organizer: organizer._id,
            currentParticipants: [resident._id],
            status: 'ongoing',
            image: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=800',
            rewards: [
              { type: 'points', value: 50, description: '50 points per 10 batteries' },
              { type: 'discount', value: '10%', description: '10% discount at Hudson Yards stores' },
            ],
          },
          {
            title: 'Eco-Education Workshop for Students',
            description: 'Educational event for middle and high school students about the importance of waste separation and recycling in NYC.',
            type: 'education',
            location: {
              address: 'Brooklyn Public Library, Central Branch Auditorium',
              latitude: 40.672779,
              longitude: -73.968565,
              district: 'Brooklyn',
            },
            date: new Date('2025-02-01'),
            startTime: '15:00',
            endTime: '17:00',
            maxParticipants: 150,
            organizer: organizer._id,
            currentParticipants: [resident._id],
            status: 'upcoming',
            image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
            rewards: [ { type: 'points', value: 100, description: '100 eco-points' } ],
          },
    ];
    const createdEvents = await Event.insertMany(eventsData);
    console.log(`Created ${createdEvents.length} events.`);

    // Add created events to users' participatedEvents
    await User.findByIdAndUpdate(resident._id, { $push: { participatedEvents: { $each: createdEvents.map(e => e._id) } } });

    
    // Create Proposals
    const proposalsData = [
        {
            proposer: resident._id,
            description: 'Need cleanup around the fountain area, lots of litter after weekends',
            category: 'cleanup',
            location: { address: 'Bethesda Fountain, Central Park', latitude: 40.773958, longitude: -73.965336 },
            votes: 234,
            status: 'approved',
          },
          {
            proposer: resident._id,
            description: 'Need more trees along the High Line for better shade in summer',
            category: 'planting',
            location: { address: 'High Line Park, Chelsea', latitude: 40.748817, longitude: -73.985428 },
            votes: 189,
            status: 'pending',
          },
          {
            proposer: resident._id,
            description: 'Need more recycling bins for proper waste separation',
            category: 'infrastructure',
            location: { address: 'Washington Square Park', latitude: 40.741895, longitude: -73.989308 },
            votes: 156,
            status: 'in_progress',
          },
    ];
    await Proposal.insertMany(proposalsData);
    console.log(`Created ${await Proposal.countDocuments()} proposals.`);

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

seedDatabase();
