import dbConnect from '@/lib/mongodb';
import Event from '@/models/event';
import User from '@/models/user';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const userId = req.headers.get('X-User-Id');
    if (!userId) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const eventId = params.id;
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);

    if (!event || !user) {
      return NextResponse.json({ message: 'Event or user not found' }, { status: 404 });
    }

    // Check if user is already a participant
    if (event.currentParticipants.map(p => p.toString()).includes(userId)) {
      return NextResponse.json({ message: 'You are already registered for this event' }, { status: 409 });
    }

    // Check if the event is full
    if (event.currentParticipants.length >= event.maxParticipants) {
      return NextResponse.json({ message: 'This event is already full' }, { status: 409 });
    }

    event.currentParticipants.push(userId);
    user.participatedEvents.push(eventId);

    await event.save();
    await user.save();

    return NextResponse.json({ message: 'Successfully registered for the event', event }, { status: 200 });

  } catch (error) {
    console.error('Error joining event:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
