import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/products
export async function GET() {
  try {
    // ambil semua produk + sales
    const products = await prisma.product.findMany({
      include: {
        salesItems: { // sesuai nama relation di schema (SalesItem[] pada model Sales)
          include: {
            Sales: true,
          }
        }
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = products.map((product) => {
      const salesItems = product.salesItems || [];
      // filter penjualan hari ini (gunakan Sales relation)
      const salesHariIni = salesItems.filter((item) => {
        if (!item.Sales) return false;
        return new Date(item.Sales.sale_timestamp) >= today;
      });

      const jumlahTerjual = salesHariIni.reduce((sum, item) => sum + item.quantity, 0);

      // total revenue hari ini
      const totalPenjualanHariIni = salesHariIni.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // total modal hari ini
      const totalModalHariIni = salesHariIni.reduce((sum, item) => sum + (product.costPrice + 1797.67) * item.quantity, 0);

      const keuntunganHariIni = totalPenjualanHariIni - totalModalHariIni;

      return {
        id: product.product_id,
        name: product.name,
        price: product.price, 
        costPrice: product.costPrice,  
        quantitySold: jumlahTerjual,
        todayMargin: keuntunganHariIni,
        image: product.image,
        alert: product.alert
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
