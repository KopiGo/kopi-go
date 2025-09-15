import { NextResponse } from 'next/server';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

// GET: /api/products
export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data produk.' },
      { status: 500 }
    );
  }
}

// POST: /api/products
export async function POST(request) {
  try {
    const { name, price, description, image } = await request.json();

    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: 'Nama dan harga produk harus diisi.' },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        description: description || null,
        image: image || null,
      },
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat produk baru.' },
      { status: 500 }
    );
  }
}

// PUT: /api/products
export async function PUT(request) {
  try {
    const { product_id, name, price, description, image } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { success: false, error: 'ID produk harus diisi.' },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { product_id: Number(product_id) },
      data: {
        name,
        price: Number(price),
        description: description || null,
        image: image || null,
      },
    });

    return NextResponse.json({ success: true, data: updatedProduct }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui produk.' },
      { status: 500 }
    );
  }
}

// DELETE: /api/products
export async function DELETE(request) {
  try {
    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { success: false, error: 'ID produk harus diisi.' },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { product_id: Number(product_id) },
    });

    return NextResponse.json(
      { success: true, message: 'Produk berhasil dihapus.' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus produk.' },
      { status: 500 }
    );
  }
}
