import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { DateTime } from 'luxon';

export async function GET() {
  try {
    // waktu sekarang di Jakarta
    const nowJakarta = DateTime.now().setZone('Asia/Jakarta');

    // startOfDay & endOfDay di Jakarta
    const startOfDay = nowJakarta.startOf('day').toJSDate();
    const endOfDay = nowJakarta.endOf('day').toJSDate();

    // ambil semua sales items hari ini beserta product
    const salesItems = await prisma.SalesItem.findMany({
      where: {
        Sales: {
          sale_timestamp: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
      include: {
        Product: true,
      },
    });

    // hitung total revenue & total quantity per product
    const productMap = {};

    salesItems.forEach(item => {
      const productId = item.product_id;
      const productName = item.Product.name;
      const productImage = item.Product.image;

      if (!productMap[productId]) {
        productMap[productId] = {
          productId,
          productName,
          productImage,
          totalRevenue: item.price,
          totalQuantity: item.quantity,
        };
      } else {
        productMap[productId].totalRevenue += item.price;
        productMap[productId].totalQuantity += item.quantity;
      }
    });

    // ubah menjadi array
    let leaderboard = Object.values(productMap);

    // sorting: revenue desc, quantity desc, name asc
    leaderboard.sort((a, b) => {
      if (b.totalRevenue !== a.totalRevenue) return b.totalRevenue - a.totalRevenue;
      if (b.totalQuantity !== a.totalQuantity) return b.totalQuantity - a.totalQuantity;
      return a.productName.localeCompare(b.productName);
    });

    // ambil top 3
    leaderboard = leaderboard.slice(0, 3);

    return NextResponse.json(leaderboard, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
