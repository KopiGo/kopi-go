import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

interface AdminRow {
  admin_id?: number;
  id?: number;
  name: string;
  email: string;
  created_at: Date;
}

function extractId(row: AdminRow): number | null {
  if (typeof row.admin_id === 'number') return row.admin_id;
  if (typeof row.id === 'number') return row.id;
  return null;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const adminId = Number(id);
    if (Number.isNaN(adminId)) {
      return NextResponse.json({ message: 'Invalid admin ID' }, { status: 400 });
    }

    const rows = await prisma.$queryRaw<AdminRow[]>`
      SELECT admin_id, id, name, email, created_at
      FROM public.superadmin
      WHERE (admin_id = ${adminId} OR id = ${adminId})
      LIMIT 1
    `;

    const admin = rows[0];
    if (!admin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }

    const resolvedId = extractId(admin);
    if (resolvedId === null) {
      return NextResponse.json({ message: 'Admin ID missing' }, { status: 500 });
    }

    return NextResponse.json({
      profile: {
        id: resolvedId,
        name: admin.name,
        email: admin.email,
        phone_num: null,
        date_join: admin.created_at.toISOString(),
        role: 'superadmin'
      }
    }, { status: 200 });
  } catch (err) {
    console.error('Admin Profile API Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}