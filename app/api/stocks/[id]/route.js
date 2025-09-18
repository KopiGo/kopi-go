import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/stocks/:id
export async function GET(req, { params }) {
  try {
    const stock = await prisma.stock.findUnique({
      where: { stock_id: Number(params.id) },
      include: {
        driver: true,
        product: true,
      },
    });

    if (!stock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    return NextResponse.json(stock, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/stocks/:id
export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const { quantity, driver_id, product_id } = body;

    // cek apakah stock ada
    const stock = await prisma.stock.findUnique({
      where: { stock_id: Number(params.id) },
    });
    if (!stock) {
      return NextResponse.json(
        { error: "Stock not found" },
        { status: 404 }
      );
    }

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

    // update stock
    const updatedStock = await prisma.stock.update({
      where: { stock_id: Number(params.id) },
      data: {
        quantity,
        driver_id,
        product_id,
      },
    });

    return NextResponse.json(updatedStock, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/stocks/:id
export async function DELETE(req, { params }) {
  try {
    await prisma.stock.delete({
      where: { stock_id: Number(params.id) },
    });
    return NextResponse.json({ message: "Stock deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
