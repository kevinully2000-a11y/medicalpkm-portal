import { NextRequest, NextResponse } from 'next/server';
import { lookupNpi, lookupNpiByNumber } from '@/lib/npi';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const npiNumber = searchParams.get('number');
  if (npiNumber) {
    const result = await lookupNpiByNumber(npiNumber);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'NPI not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, results: [result] });
  }

  const firstName = searchParams.get('firstName');
  const lastName = searchParams.get('lastName');
  if (!firstName || !lastName) {
    return NextResponse.json(
      { success: false, error: 'firstName and lastName are required' },
      { status: 400 }
    );
  }

  const state = searchParams.get('state') || undefined;
  const specialty = searchParams.get('specialty') || undefined;

  const results = await lookupNpi(firstName, lastName, state, specialty);
  return NextResponse.json({ success: true, results });
}
