import { NextResponse } from 'next/server';
import { listBriefs } from '@/lib/kv';

export async function GET() {
  try {
    const briefs = await listBriefs();
    return NextResponse.json({ success: true, briefs });
  } catch (error) {
    console.error('Failed to list briefs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load briefs' },
      { status: 500 }
    );
  }
}
