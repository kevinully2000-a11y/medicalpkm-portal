import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { CF_ACCOUNT_ID, CF_POLICY_ID } from '@/lib/constants';

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

function getCfToken(): string | null {
  return process.env.CLOUDFLARE_ACCESS_TOKEN || null;
}

async function cfApiFetch(path: string, options?: RequestInit) {
  const token = getCfToken();
  if (!token) throw new Error('CLOUDFLARE_ACCESS_TOKEN not configured');

  const res = await fetch(`${CF_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  return res.json();
}

/**
 * GET /api/admin/users — List all whitelisted emails from CF Access Policy 1
 */
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user?.isAdmin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }

  const token = getCfToken();
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'CLOUDFLARE_ACCESS_TOKEN not configured. Add it in Vercel project settings.' },
      { status: 500 }
    );
  }

  try {
    const data = await cfApiFetch(
      `/accounts/${CF_ACCOUNT_ID}/access/policies/${CF_POLICY_ID}`
    );

    if (!data.success) {
      return NextResponse.json({ success: false, error: 'Failed to fetch policy', details: data.errors }, { status: 500 });
    }

    const emails = (data.result.include || [])
      .filter((rule: Record<string, unknown>) => rule.email)
      .map((rule: Record<string, unknown>) => (rule.email as Record<string, string>).email);

    return NextResponse.json({ success: true, emails });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * POST /api/admin/users — Add an email to the whitelist
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user?.isAdmin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }

  const token = getCfToken();
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'CLOUDFLARE_ACCESS_TOKEN not configured' },
      { status: 500 }
    );
  }

  const body = await request.json();
  const newEmail = body.email?.trim()?.toLowerCase();
  if (!newEmail || !newEmail.includes('@')) {
    return NextResponse.json({ success: false, error: 'Valid email required' }, { status: 400 });
  }

  try {
    // Get current policy
    const getData = await cfApiFetch(
      `/accounts/${CF_ACCOUNT_ID}/access/policies/${CF_POLICY_ID}`
    );
    if (!getData.success) {
      return NextResponse.json({ success: false, error: 'Failed to fetch policy' }, { status: 500 });
    }

    const policy = getData.result;
    const currentInclude = policy.include || [];

    // Check if email already exists
    const exists = currentInclude.some(
      (rule: Record<string, unknown>) =>
        rule.email && (rule.email as Record<string, string>).email === newEmail
    );
    if (exists) {
      return NextResponse.json({ success: false, error: 'Email already whitelisted' }, { status: 409 });
    }

    // Add the new email
    const updatedInclude = [...currentInclude, { email: { email: newEmail } }];

    // Use reusable policies endpoint and spread full policy object
    const { id: _id, created_at: _ca, updated_at: _ua, ...policyFields } = policy;
    const putData = await cfApiFetch(
      `/accounts/${CF_ACCOUNT_ID}/access/policies/${CF_POLICY_ID}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          ...policyFields,
          include: updatedInclude,
        }),
      }
    );

    if (!putData.success) {
      console.error('CF API PUT error (add):', JSON.stringify(putData.errors));
      return NextResponse.json({ success: false, error: 'Failed to update policy', details: putData.errors }, { status: 500 });
    }

    const emails = updatedInclude
      .filter((rule: Record<string, unknown>) => rule.email)
      .map((rule: Record<string, unknown>) => (rule.email as Record<string, string>).email);

    return NextResponse.json({ success: true, emails, message: `${newEmail} added` });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users — Remove an email from the whitelist
 * Body: { email: string }
 */
export async function DELETE(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user?.isAdmin) {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }

  const token = getCfToken();
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'CLOUDFLARE_ACCESS_TOKEN not configured' },
      { status: 500 }
    );
  }

  const body = await request.json();
  const removeEmail = body.email?.trim()?.toLowerCase();
  if (!removeEmail) {
    return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
  }

  // Prevent removing the admin email
  if (removeEmail === 'kevin.ully2000@gmail.com') {
    return NextResponse.json({ success: false, error: 'Cannot remove admin email' }, { status: 400 });
  }

  try {
    // Get current policy
    const getData = await cfApiFetch(
      `/accounts/${CF_ACCOUNT_ID}/access/policies/${CF_POLICY_ID}`
    );
    if (!getData.success) {
      return NextResponse.json({ success: false, error: 'Failed to fetch policy' }, { status: 500 });
    }

    const policy = getData.result;
    const currentInclude = policy.include || [];

    // Remove the email
    const updatedInclude = currentInclude.filter(
      (rule: Record<string, unknown>) =>
        !(rule.email && (rule.email as Record<string, string>).email === removeEmail)
    );

    if (updatedInclude.length === currentInclude.length) {
      return NextResponse.json({ success: false, error: 'Email not found in whitelist' }, { status: 404 });
    }

    // Use reusable policies endpoint and spread full policy object
    const { id: _id, created_at: _ca, updated_at: _ua, ...policyFields } = policy;
    const putData = await cfApiFetch(
      `/accounts/${CF_ACCOUNT_ID}/access/policies/${CF_POLICY_ID}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          ...policyFields,
          include: updatedInclude,
        }),
      }
    );

    if (!putData.success) {
      console.error('CF API PUT error (remove):', JSON.stringify(putData.errors));
      return NextResponse.json({ success: false, error: 'Failed to update policy', details: putData.errors }, { status: 500 });
    }

    const emails = updatedInclude
      .filter((rule: Record<string, unknown>) => rule.email)
      .map((rule: Record<string, unknown>) => (rule.email as Record<string, string>).email);

    return NextResponse.json({ success: true, emails, message: `${removeEmail} removed` });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
