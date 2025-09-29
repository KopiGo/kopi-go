import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { DateTime } from 'luxon';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    let selectedDateJakarta;

    if (dateParam) {
      // pakai tanggal dari query param, konversi ke WIB
      selectedDateJakarta = DateTime.fromISO(dateParam, { zone: 'Asia/Jakarta' });
    } else {
      // pakai tanggal hari ini di WIB
      selectedDateJakarta = DateTime.now().setZone('Asia/Jakarta');
    }

    // start & end of day di WIB
    const startOfDay = selectedDateJakarta.startOf('day').toJSDate();
    const endOfDay = selectedDateJakarta.endOf('day').toJSDate();

    // Ambil semua sales di tanggal tersebut
    const salesData = await prisma.sales.findMany({
      where: {
        sale_timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        SalesItem: {
          include: {
            Product: true,
          },
        },
      },
    });

    const productSales = {};
    let totalRevenue = 0;

    salesData.forEach((sale) => {
      sale.SalesItem.forEach((item) => {
        const productId = item.product_id;
        const productName = item.Product.name;

        if (!productSales[productId]) {
          productSales[productId] = {
            product_id: productId,
            product_name: productName,
            total_quantity: 0,
            total_revenue: 0,
          };
        }

        productSales[productId].total_quantity += item.quantity;
        productSales[productId].total_revenue += item.quantity * item.price;
        totalRevenue += item.quantity * item.price;
      });
    });

    const salesSummary = Object.values(productSales);

    return NextResponse.json(
      {
        sales_summary: salesSummary,
        total_revenue: totalRevenue,
        date: selectedDateJakarta.toFormat('yyyy-MM-dd'), // tanggal sesuai WIB
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

