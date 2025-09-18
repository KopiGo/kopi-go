import { NextResponse } from 'next/server';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();
// GET /api/stocks
export async function GET() {
  try {
    const stocks = await prisma.stock.findMany({
      include: {
        driver: true,
        product: true,
      },
    });
    return NextResponse.json(stocks, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/stocks
export async function POST(req) {
  try {
    const body = await req.json();
    const { quantity, driver_id, product_id } = body;

    // validasi quantity
    if (quantity < 0) {
      return NextResponse.json(
        { error: "Quantity cannot be negative" },
        { status: 400 }
      );
    }

    // cek apakah driver ada
    const driver = await prisma.driver.findUnique({
      where: { driver_id: Number(driver_id) },
    });
    if (!driver) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      );
    }

    // cek apakah product ada
    const product = await prisma.product.findUnique({
      where: { product_id: Number(product_id) },
    });
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // buat stock baru
    const newStock = await prisma.stock.create({
      data: {
        quantity,
        driver_id,
        product_id,
        //============================================ NANTI DIHAPUS ============================================
        created_at: created_at ? new Date(created_at) : undefined,
      },
    });

    return NextResponse.json(newStock, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    // ambil driverId dari query (?driverId=1)
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get("driverId");

    if (!driverId) {
      return NextResponse.json(
        { error: "driverId is required" },
        { status: 400 }
      );
    }

    const stocks = await prisma.stock.findMany({
      where: {
        driver_id: Number(driverId),
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(stocks, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
