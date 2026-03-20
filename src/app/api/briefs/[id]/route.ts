import { NextRequest, NextResponse } from 'next/server';
import { getBrief, deleteBrief, updateBrief } from '@/lib/kv';
import { getUserFromRequest } from '@/lib/auth';
import { KOLBrief } from '@/lib/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const brief = await getBrief(id);
    if (!brief) {
      return NextResponse.json(
        { success: false, error: 'Brief not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, brief });
  } catch (error) {
    console.error('Failed to get brief:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load brief' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const updates: Partial<KOLBrief> = {};

    // Hidden toggle (existing)
    if (typeof body.hidden === 'boolean') {
      updates.hidden = body.hidden;
      updates.hiddenAt = body.hidden ? new Date().toISOString() : undefined;
      updates.hiddenBy = body.hidden ? user.email : undefined;
    }

    // Editable fields
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.npi !== undefined) updates.npi = body.npi;
    if (body.conference !== undefined) updates.conference = body.conference;
    if (body.kolName !== undefined) updates.kolName = body.kolName;
    if (body.institution !== undefined) updates.institution = body.institution;
    if (body.credentials !== undefined) updates.credentials = body.credentials;
    if (body.department !== undefined) updates.department = body.department;
    if (body.specialties !== undefined) updates.specialties = body.specialties;
    if (body.focusAreas !== undefined) updates.focusAreas = body.focusAreas;
    if (body.headshotUrl !== undefined) updates.headshotUrl = body.headshotUrl;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updated = await updateBrief(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Brief not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, brief: updated });
  } catch (error) {
    console.error('Failed to update brief:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update brief' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = getUserFromRequest(request);

  if (!user || !user.isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Only admins can permanently delete briefs' },
      { status: 403 }
    );
  }

  try {
    const deleted = await deleteBrief(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Brief not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete brief:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete brief' },
      { status: 500 }
    );
  }
}
