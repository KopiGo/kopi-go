import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        sales: true,
        stocks: true,
      },
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/products
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, price, description, image } = body;

    // validasi sederhana
    if (!name || typeof price !== "number") {
      return NextResponse.json(
        { error: "Name and price are required, price must be number" },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        description,
        image,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
