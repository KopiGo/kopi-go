import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        salesItems: true,
        stocks: true,
      },
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, price, description, image, costPrice } = body;

    // validasi sederhana
    if (!name || typeof price !== "number") {
      return NextResponse.json(
        { error: "Name and price are required, price must be number" },
        { status: 400 }
      );
    }

    if (costPrice !== undefined && typeof costPrice !== "number") {
      return NextResponse.json(
        { error: "costPrice must be a number" },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        description,
        image,
        costPrice: costPrice ?? 0, // default 0 kalau tidak dikirim
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


