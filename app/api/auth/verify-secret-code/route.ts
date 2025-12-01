// app/api/auth/verify-secret-code/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { secretCode } = await request.json();

    // Get the secret code from environment variable
    const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_SECRET_CODE;

    if (!SUPER_ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Super Admin creation is not configured' },
        { status: 500 }
      );
    }

    // Verify the secret code
    if (secretCode !== SUPER_ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret code' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Secret code verified' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying secret code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}