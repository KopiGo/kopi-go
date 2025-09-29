import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { DateTime } from 'luxon';

export async function GET(req, { params }) {
  const driverId = parseInt(params.id);

  // Waktu hari ini di WIB
  const todayJakarta = DateTime.now().setZone('Asia/Jakarta');
  const startOfDay = todayJakarta.startOf('day').toJSDate();
  const endOfDay = todayJakarta.endOf('day').toJSDate();

  try {
    // Ambil semua produk
    const products = await prisma.product.findMany();

    // Ambil stok driver tertentu khusus hari ini
    const stocks = await prisma.stock.findMany({
      where: {
        driver_id: driverId,
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Buat map product_id -> quantity
    const stockMap = {};
    stocks.forEach((s) => {
      stockMap[s.product_id] = s.quantity;
    });

    // Gabungkan produk dengan stok
    const result = products.map((p) => ({
      ...p,
      quantity: stockMap[p.product_id] || 0, // default 0 kalau kosong
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
