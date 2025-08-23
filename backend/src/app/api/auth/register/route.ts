import dbConnect from '@/lib/mongodb';
import User from '@/models/user';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json({ message: 'Email, username, and password are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email or username already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();
    
    // Do not send password back
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json({ message: 'User created successfully', user: userResponse }, { status: 201 });
  } catch (error) {
    console.error('REGISTRATION_ERROR:', error); // DETAILED LOGGING
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
