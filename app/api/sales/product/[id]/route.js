import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { DateTime } from 'luxon';

export async function GET(req, { params }) {
  try {
    const productId = Number(params.id);

    // waktu sekarang di Jakarta
    const nowJakarta = DateTime.now().setZone('Asia/Jakarta');

    // start & end of day di WIB
    const startOfDay = nowJakarta.startOf('day').toJSDate();
    const endOfDay = nowJakarta.endOf('day').toJSDate();

    // ambil semua sales items hari ini untuk product
    const salesItems = await prisma.salesItem.findMany({
      where: {
        product_id: productId,
        Sales: {
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

    return NextResponse.json(
      {
        date: nowJakarta.toFormat('yyyy-MM-dd'), // tanggal sesuai WIB
        totalQuantity,
        totalRevenue,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
