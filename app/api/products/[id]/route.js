import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// PUT /api/products/:id
// PUT /api/products/:id
export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const { name, price, description, image, costPrice } = body;

    const existingProduct = await prisma.product.findUnique({
      where: { product_id: Number(params.id) },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // validasi
    if (price !== undefined && typeof price !== "number") {
      return NextResponse.json({ error: "Price must be a number" }, { status: 400 });
    }
    if (costPrice !== undefined && typeof costPrice !== "number") {
      return NextResponse.json({ error: "costPrice must be a number" }, { status: 400 });
    }

    // hitung kenaikan costPrice
    let alert = false;
    if (costPrice !== undefined) {
      const increasePercent = (costPrice - existingProduct.costPrice) / existingProduct.costPrice;
      if (increasePercent > 0.06) {
        alert = true;
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { product_id: Number(params.id) },
      data: {
        name,
        price,
        description,
        image,
        costPrice,
        alert
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
