import dbConnect from '@/lib/mongodb';
import Proposal from '@/models/proposal';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const userId = req.headers.get('X-User-Id');
    if (!userId) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const proposalId = params.id;
    const proposal = await Proposal.findById(proposalId);

    if (!proposal) {
      return NextResponse.json({ message: 'Proposal not found' }, { status: 404 });
    }
    
    // Check if user has already voted
    if (proposal.voters.map(voterId => voterId.toString()).includes(userId)) {
      return NextResponse.json({ message: 'You have already voted for this proposal' }, { status: 409 });
    }

    proposal.votes += 1;
    proposal.voters.push(userId);
    
    await proposal.save();

    return NextResponse.json({ message: 'Voted successfully', proposal }, { status: 200 });
  } catch (error) {
    console.error('Error voting for proposal:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
