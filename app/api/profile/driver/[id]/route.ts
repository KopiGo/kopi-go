import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const driverId = Number(id);

    if (!Number.isInteger(driverId)) {
      return NextResponse.json({ message: 'Invalid driver ID' }, { status: 400 });
    }

    const driver = await prisma.driver.findFirst({
      where: {
        OR: [
          { driver_id: driverId },
        ]
      }
    });

    if (!driver) {
      return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: driver.driver_id,
        name: driver.name,
        email: driver.email,
        phone_num: driver.phone_num ?? null,
        date_join: (driver.date_join ?? new Date()).toISOString(),
        role: driver.role ?? 'driver',
      }
    }, { status: 200 });

  } catch (err) {
    console.error('Driver Profile API Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
