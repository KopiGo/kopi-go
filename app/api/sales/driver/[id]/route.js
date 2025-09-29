import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(req, { params }) {
  try {
    const driverId = Number(params.id);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // ambil semua sales items hari ini untuk driver
    const salesItems = await prisma.salesItem.findMany({
      where: {
        Sales: {
          driver_id: driverId,
          sale_timestamp: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
      select: {
        quantity: true,
        price: true,
      },
    });

    const totalQuantity = salesItems.reduce((acc, s) => acc + s.quantity, 0);
    const totalRevenue = salesItems.reduce((acc, s) => acc + s.price, 0);

    return NextResponse.json({ totalQuantity, totalRevenue }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}