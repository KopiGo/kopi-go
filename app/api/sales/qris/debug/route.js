import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { DateTime } from 'luxon';

export async function GET() {
  try {
    const nowJakarta = DateTime.now().setZone('Asia/Jakarta');
    const startOfDay = nowJakarta.startOf('day').toJSDate();
    const endOfDay = nowJakarta.endOf('day').toJSDate();

    // Ambil semua sales QRIS hari ini beserta item
    const qrisSalesToday = await prisma.sales.findMany({
      where: {
        payment: 'QRIS',
        sale_timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        SalesItem: {
          include: {
            Product: true, // biar keliatan nama & harga product
          },
        },
      },
      orderBy: { sale_timestamp: 'desc' },
    });

    return NextResponse.json(
      {
        date: nowJakarta.toFormat('yyyy-MM-dd'),
        count: qrisSalesToday.length,
        sales: qrisSalesToday,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("QRIS Debug Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
