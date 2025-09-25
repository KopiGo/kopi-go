import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/products
export async function GET() {
  try {
    // ambil semua produk + sales
    const products = await prisma.product.findMany({
      include: {
        salesItems: {
          include: {
            sales: true, // ambil timestamp penjualan
          },
        },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = products.map((product) => {
      // filter penjualan hari ini
      const salesHariIni = product.salesItems.filter(
        (item) => new Date(item.sales.sale_timestamp) >= today
      );

      const jumlahTerjual = salesHariIni.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      // total revenue hari ini
      const totalPenjualanHariIni = salesHariIni.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // total modal hari ini
      const totalModalHariIni = salesHariIni.reduce(
        (sum, item) => sum + (product.costPrice + 1797.67) * item.quantity,
        0
      );

      const keuntunganHariIni = totalPenjualanHariIni - totalModalHariIni;

      return {
        id: product.product_id,
        name: product.name,
        price: product.price, 
        costPrice: product.costPrice,  
        quantitySold: jumlahTerjual,
        todayMargin: keuntunganHariIni,
        image: product.image,    
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
