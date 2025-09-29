import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

interface DriverRow {
  driver_id?: number;
  id?: number;
  name: string;
  email: string;
  phone_num?: string | null;
  date_join?: Date;
  role?: string;
}

function extractDriverId(row: DriverRow): number | null {
  if (typeof row.driver_id === 'number') return row.driver_id;
  if (typeof row.id === 'number') return row.id;
  return null;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const driverId = Number(id);
    if (!Number.isInteger(driverId)) {
      return NextResponse.json({ message: 'Invalid driver ID' }, { status: 400 });
    }

    const rows = await prisma.$queryRaw<DriverRow[]>`
      SELECT driver_id, id, name, email, phone_num, date_join, role
      FROM public.driver
      WHERE (driver_id = ${driverId} OR id = ${driverId})
      LIMIT 1
    `;

    const driver = rows[0];
    if (!driver) {
      return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    }

    const resolvedId = extractDriverId(driver);
    if (resolvedId === null) {
      return NextResponse.json({ message: 'Driver ID missing' }, { status: 500 });
    }

    return NextResponse.json({
      profile: {
        id: resolvedId,
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