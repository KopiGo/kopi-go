// File: app/api/alert/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// DELETE /api/alert/:id
export async function DELETE(req, context) {
  try {
    const { id } = context.params;   // ✅ ambil params dari context
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // cek apakah produk ada
    const existingProduct = await prisma.product.findUnique({
      where: { product_id: productId }, // ganti ke "id" kalau PK kamu "id"
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // update alert menjadi false
    const updatedProduct = await prisma.product.update({
      where: { product_id: productId }, // atau { id: productId }
      data: { alert: false },
    });

    return NextResponse.json(
      { message: "Alert cleared", product: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/alert/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
