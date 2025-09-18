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

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

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

    // Tentukan tanggal hari ini
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

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
      // Update stock yang sudah ada
      stock = await prisma.stock.update({
        where: { stock_id: existingStock.stock_id },
        data: { quantity }, // bisa juga pakai `quantity: existingStock.quantity + quantity` kalau ingin ditambah
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
