import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(req, { params }) {
  try {
    const productId = Number(params.id);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // ambil semua sales items hari ini untuk product
    const salesItems = await prisma.salesItem.findMany({
      where: {
        product_id: productId,
        sales: {
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
