import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // hitung total revenue & quantity QRIS untuk hari ini
    const revenue = await prisma.salesItem.aggregate({
      where: {
        sales: {
          payment: 'QRIS',
          sale_timestamp: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
      _sum: {
        price: true,
        quantity: true,
      },
    });

    return NextResponse.json(
      {
        date: startOfDay.toISOString().split('T')[0], // YYYY-MM-DD
        totalRevenue: Math.floor(revenue._sum.price || 0),
        totalQuantity: revenue._sum.quantity || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
