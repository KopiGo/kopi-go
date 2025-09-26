import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../../app/generated/prisma';

// Inisialisasi Prisma Client
const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const driverId = parseInt(params.id);

    if (isNaN(driverId)) {
      return NextResponse.json({ message: 'Invalid driver ID' }, { status: 400 });
    }

    // Ambil data driver berdasarkan ID
    const driver = await prisma.driver.findUnique({
      where: { driver_id: driverId },
      select: {
        driver_id: true,
        name: true,
        email: true,
        phone_num: true,
        date_join: true,
        role: true,
      }
    });

    if (!driver) {
      return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    }

    // Return profile data
    return NextResponse.json({
      profile: {
        id: driver.driver_id,
        name: driver.name,
        email: driver.email,
        phone_num: driver.phone_num,
        date_join: driver.date_join.toISOString(),
        role: driver.role,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Driver Profile API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}