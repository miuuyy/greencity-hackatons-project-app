import dbConnect from '@/lib/mongodb';
import Proposal from '@/models/proposal';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const proposals = await Proposal.find({}).populate('proposer', 'username');
    return NextResponse.json({ proposals }, { status: 200 });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const userId = req.headers.get('X-User-Id');
    if (!userId) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const newProposal = new Proposal({
      ...body,
      proposer: userId,
      votes: 1, // Start with one vote from the proposer
      voters: [userId],
    });

    await newProposal.save();

    return NextResponse.json({ message: 'Proposal created successfully', proposal: newProposal }, { status: 201 });
  } catch (error) {
    console.error('Error creating proposal:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
