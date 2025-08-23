import dbConnect from '@/lib/mongodb';
import Event from '@/models/event';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const events = await Event.find({})
      .populate('organizer', 'username email')
      .populate('currentParticipants', 'username email');
    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const userId = req.headers.get('X-User-Id');
    const userRole = req.headers.get('X-User-Role');

    if (!userId) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }
    
    // For MVP, we can let anyone create an event.
    // In the future, we would restrict this to 'organizer' role.
    // if (userRole !== 'organizer') {
    //   return NextResponse.json({ message: 'Forbidden: Only organizers can create events' }, { status: 403 });
    // }

    const body = await req.json();
    const newEvent = new Event({
      ...body,
      organizer: userId,
    });

    await newEvent.save();

    return NextResponse.json({ message: 'Event created successfully', event: newEvent }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
