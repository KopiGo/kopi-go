import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const adminId = Number(id);

    if (Number.isNaN(adminId)) {
      return NextResponse.json({ message: 'Invalid admin ID' }, { status: 400 });
    }

    // Query ke Prisma ORM
    const admin = await prisma.superadmin.findFirst({
      where: {
        OR: [
          { id: adminId }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      }
    });

    if (!admin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }

    const resolvedId = admin.id;
    if (!resolvedId) {
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
