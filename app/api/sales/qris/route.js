import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { DateTime } from 'luxon';

export async function GET() {
  try {
    // waktu sekarang di Jakarta
    const nowJakarta = DateTime.now().setZone('Asia/Jakarta');

    // start & end of day di WIB
    const startOfDay = nowJakarta.startOf('day').toJSDate();
    const endOfDay = nowJakarta.endOf('day').toJSDate();

    // hitung total revenue & quantity QRIS untuk hari ini
    const revenue = await prisma.salesItem.aggregate({
      where: {
        Sales: {
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
        date: nowJakarta.toFormat('yyyy-MM-dd'), // tanggal sesuai WIB
        totalRevenue: Math.floor(revenue._sum.price || 0),
        totalQuantity: revenue._sum.quantity || 0,
        totalMargin: 0
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
