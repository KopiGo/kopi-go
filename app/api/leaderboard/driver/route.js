import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { DateTime } from 'luxon';

export async function GET() {
  try {
    // Waktu sekarang di Jakarta
    const nowJakarta = DateTime.now().setZone('Asia/Jakarta');

    // startOfDay dan endOfDay di Jakarta
    const startOfDay = nowJakarta.startOf('day').toJSDate();
    const endOfDay = nowJakarta.endOf('day').toJSDate();

    // ambil semua sales items hari ini beserta driver
    const salesItems = await prisma.salesItem.findMany({
      where: {
        Sales: {
          sale_timestamp: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
      include: {
        Sales: {
          select: {
            driver_id: true,
            Driver: true,
          },
        },
      },
    });

    // hitung total revenue & total quantity per driver
    const driverMap = {};

    salesItems.forEach(item => {
      const driverId = item.Sales.driver_id;
      const driverName = item.Sales.Driver.name;

      if (!driverMap[driverId]) {
        driverMap[driverId] = {
          driverId,
          driverName,
          totalRevenue: item.price,
          totalQuantity: item.quantity,
        };
      } else {
        driverMap[driverId].totalRevenue += item.price;
        driverMap[driverId].totalQuantity += item.quantity;
      }
    });

    // ubah menjadi array
    const leaderboard = Object.values(driverMap);

    // sorting: revenue desc, quantity desc, name asc
    leaderboard.sort((a, b) => {
      if (b.totalRevenue !== a.totalRevenue) return b.totalRevenue - a.totalRevenue;
      if (b.totalQuantity !== a.totalQuantity) return b.totalQuantity - a.totalQuantity;
      return a.driverName.localeCompare(b.driverName);
    });

    return NextResponse.json(leaderboard, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
