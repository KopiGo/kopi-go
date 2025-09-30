import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { DateTime } from 'luxon';

// GET /api/stocks
export async function GET() {
  try {
    const stocks = await prisma.stock.findMany({
      include: {
        Driver: true,
        product: true,
      },
    });
    return NextResponse.json(stocks, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { quantity, driver_id, product_id } = body;

    // validasi quantity
    if (quantity < 0) {
      return NextResponse.json({ error: "Quantity cannot be negative" }, { status: 400 });
    }

    // cek driver
    const driver = await prisma.driver.findUnique({
      where: { driver_id: Number(driver_id) },
    });
    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // cek product
    const product = await prisma.product.findUnique({
      where: { product_id: Number(product_id) },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Tentukan tanggal hari ini di WIB
    const nowJakarta = DateTime.now().setZone('Asia/Jakarta');
    const todayStart = nowJakarta.startOf('day').toJSDate();
    const todayEnd = nowJakarta.endOf('day').toJSDate();

    // Cek apakah stock sudah ada hari ini
    const existingStock = await prisma.stock.findFirst({
      where: {
        driver_id: Number(driver_id),
        product_id: Number(product_id),
        created_at: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    let stock;
    if (existingStock) {
      // Tambahkan quantity ke stock yang sudah ada
      stock = await prisma.stock.update({
        where: { stock_id: existingStock.stock_id },
        data: { quantity: quantity },
      });
    } else {
      // Buat stock baru
      stock = await prisma.stock.create({
        data: {
          driver_id: Number(driver_id),
          product_id: Number(product_id),
          quantity,
        },
      });
    }

    return NextResponse.json(stock, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}




