import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

// Inisialisasi Prisma Client
const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const adminId = parseInt(id);

    if (isNaN(adminId)) {
      return NextResponse.json({ message: 'Invalid admin ID' }, { status: 400 });
    }

    // Ambil data superadmin berdasarkan ID
    const admin = await prisma.superadmin.findUnique({
      where: { admin_id: adminId },
      select: {
        admin_id: true,
        name: true,
        email: true,
        created_at: true,
      }
    });

    if (!admin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }

    // Return profile data
    return NextResponse.json({
      profile: {
        id: admin.admin_id,
        name: admin.name,
        email: admin.email,
        phone_num: null, // Admin doesn't have phone_num field
        date_join: admin.created_at.toISOString(),
        role: 'superadmin',
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Admin Profile API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}