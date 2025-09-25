// File: app/api/alert/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// DELETE /api/alert/:id
export async function DELETE(req, { params }) {
  try {
    const productId = Number(params.id);

    // cek apakah produk ada
    const existingProduct = await prisma.product.findUnique({
      where: { product_id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // update alert menjadi false
    const updatedProduct = await prisma.product.update({
      where: { product_id: productId },
      data: { alert: false },
    });

    return NextResponse.json({ message: "Alert cleared", product: updatedProduct }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
