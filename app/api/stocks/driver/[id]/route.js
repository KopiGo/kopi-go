import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';


export async function GET(req, { params }) {
  const driverId = parseInt(params.id);

  // Buat range tanggal hari ini
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

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

