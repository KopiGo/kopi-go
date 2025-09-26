import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // ambil semua sales items hari ini beserta product
    const salesItems = await prisma.salesItem.findMany({
      where: {
        sales: {
          sale_timestamp: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
      include: {
        product: true,
      },
    });

    // hitung total revenue & total quantity per product
    const productMap = {};

    salesItems.forEach(item => {
      const productId = item.product_id;
      const productName = item.product.name;

      if (!productMap[productId]) {
        productMap[productId] = {
          productId,
          productName,
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

    leaderboard = leaderboard.slice(0, 3);

    return NextResponse.json(leaderboard, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
