import { NextResponse } from 'next/server';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

// Mendapatkan semua produk
// METHOD: GET
// URL: /api/products
export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data produk.' }, { status: 500 });
  }
}

// Membuat produk baru
// METHOD: POST
// URL: /api/products
// Body: { "name": "...", "price": "...", "description": "..." }
export async function POST(request) {
  try {
    const { name, price, description } = await request.json();
    if (!name || !price) {
      return NextResponse.json({ error: 'Nama dan harga produk harus diisi.' }, { status: 400 });
    }
    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        description,
      },
    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat produk baru.' }, { status: 500 });
  }
}

// Memperbarui produk yang sudah ada
// METHOD: PUT
// URL: /api/products
// Body: { "product_id": 1, "name": "...", "price": "...", "description": "..." }
export async function PUT(request) {
  try {
    const { product_id, name, price, description } = await request.json();
    const updatedProduct = await prisma.product.update({
      where: { product_id: parseInt(product_id) },
      data: {
        name,
        price,
        description,
      },
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui produk.' }, { status: 500 });
  }
}

// Menghapus produk
// METHOD: DELETE
// URL: /api/products
// Body: { "product_id": 1 }
export async function DELETE(request) {
  try {
    const { product_id } = await request.json();
    await prisma.product.delete({
      where: { product_id: parseInt(product_id) },
    });
    return NextResponse.json({ message: 'Produk berhasil dihapus.' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus produk.' }, { status: 500 });
  }
}