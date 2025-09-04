import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { UserRole } from '../../../../types/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, badgeNumber, department } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // For police and higher authorities, require additional fields
    if (role === UserRole.POLICE || role === UserRole.HIGHER_AUTHORITY) {
      if (!badgeNumber || !department) {
        return NextResponse.json(
          { error: 'Badge number and department are required for police/authority accounts' },
          { status: 400 }
        );
      }
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Check for duplicate badge number
    if (badgeNumber) {
      const existingBadge = await User.findOne({ badgeNumber });
      if (existingBadge) {
        return NextResponse.json(
          { error: 'Badge number already exists' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || UserRole.PUBLIC,
      badgeNumber,
      department,
    });

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      badgeNumber: user.badgeNumber,
      department: user.department,
      verificationStatus: user.verificationStatus,
    };

    return NextResponse.json(
      { 
        message: role === UserRole.PUBLIC 
          ? 'Account created successfully' 
          : 'Account created successfully. Pending verification by administrator.',
        user: userResponse 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
