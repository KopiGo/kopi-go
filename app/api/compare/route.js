import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { DateTime } from 'luxon';

export async function GET() {
  try {
    // Tanggal hari ini WIB
    const todayStart = DateTime.now().setZone('Asia/Jakarta').startOf('day').toJSDate();
    const todayEnd = DateTime.now().setZone('Asia/Jakarta').endOf('day').toJSDate();

    // Tanggal kemarin WIB
    const yesterdayStart = DateTime.now().setZone('Asia/Jakarta').minus({ days: 1 }).startOf('day').toJSDate();
    const yesterdayEnd = DateTime.now().setZone('Asia/Jakarta').minus({ days: 1 }).endOf('day').toJSDate();

    // Revenue & quantity hari ini
    const todaySales = await prisma.salesItem.aggregate({
      where: {
        Sales: {
          sale_timestamp: { gte: todayStart, lte: todayEnd },
        },
      },
      _sum: {
        price: true,
        quantity: true,
      },
    });

    // Revenue & quantity kemarin
    const yesterdaySales = await prisma.salesItem.aggregate({
      where: {
        Sales: {
          sale_timestamp: { gte: yesterdayStart, lte: yesterdayEnd },
        },
      },
      _sum: {
        price: true,
        quantity: true,
      },
    });

    // Hitung persentase perubahan revenue
    const revenueToday = todaySales._sum.price || 0;
    const revenueYesterday = yesterdaySales._sum.price || 0;
    const revenueChange = revenueYesterday === 0
      ? 100
      : ((revenueToday - revenueYesterday) / revenueYesterday) * 100;

    // Hitung persentase perubahan jumlah produk
    const quantityToday = todaySales._sum.quantity || 0;
    const quantityYesterday = yesterdaySales._sum.quantity || 0;
    const quantityChange = quantityYesterday === 0
      ? 100
      : ((quantityToday - quantityYesterday) / quantityYesterday) * 100;

    return NextResponse.json({
      today: {
        revenue: revenueToday,
        quantity: quantityToday,
      },
      yesterday: {
        revenue: revenueYesterday,
        quantity: quantityYesterday,
      },
      change: {
        revenuePercentage: revenueChange,
        quantityPercentage: quantityChange,
      },
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
