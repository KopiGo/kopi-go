import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/products/:id
export async function GET(req, { params }) {
  try {
    const product = await prisma.product.findUnique({
      where: { product_id: Number(params.id) },
      include: {
        itemSales: true,
        stocks: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/products/:id
export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const { name, price, description, image } = body;

    const existingProduct = await prisma.product.findUnique({
      where: { product_id: Number(params.id) },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // validasi harga
    if (price !== undefined && typeof price !== "number") {
      return NextResponse.json(
        { error: "Price must be a number" },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { product_id: Number(params.id) },
      data: {
        name,
        price,
        description,
        image,
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/products/:id
export async function DELETE(req, { params }) {
  try {
    await prisma.product.delete({
      where: { product_id: Number(params.id) },
    });
    return NextResponse.json({ message: "Product deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
