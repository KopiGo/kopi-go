import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { DateTime } from 'luxon';

export async function POST(req) {
  try {
    const { driver_id, items } = await req.json();

    if (!driver_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Driver ID and items array are required' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (prismaTx) => {
      // Waktu sale di WIB
      const saleTime = DateTime.now().setZone('Asia/Jakarta').toJSDate();

      // Buat sales record
      const sale = await prismaTx.sales.create({
        data: {
          driver_id,
          sale_timestamp: saleTime,
        },
      });

      const salesItems = [];

      for (const item of items) {
        const { product_id, quantity } = item;

        // Ambil harga product
        const product = await prismaTx.product.findUnique({
          where: { product_id },
        });
        if (!product) throw new Error(`Produk ${product_id} tidak ditemukan`);

        const pricePerItem = product.price; // harga satuan
        const totalPrice = pricePerItem * quantity; // harga total = price × quantity

        // Ambil stok terbaru
        const currentStock = await prismaTx.stock.findFirst({
          where: { product_id, driver_id },
          orderBy: { created_at: 'desc' },
        });

        const currentQuantity = currentStock ? currentStock.quantity : 0;

        // 🔹 Validasi stok cukup
        if (quantity > currentQuantity) {
          throw new Error(
            `Stok tidak cukup untuk produk ${product_id}. Stok tersedia: ${currentQuantity}, diminta: ${quantity}`
          );
        }

        // Buat sales item
        const salesItem = await prismaTx.salesItem.create({
          data: {
            sales_id: sale.sale_id,
            product_id,
            quantity,
            price: totalPrice, // pakai harga total
          },
        });
        salesItems.push(salesItem);

        // Hitung stok baru
        const newQuantity = currentQuantity - quantity;

        // Buat record stok baru
        await prismaTx.stock.create({
          data: {
            product_id,
            driver_id,
            quantity: newQuantity,
          },
        });
      }

      return { sale, salesItems };
    });

    return NextResponse.json(
      {
        message: 'Order created successfully',
        sale_id: result.sale.sale_id,
        items_count: result.salesItems.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function GET() {
  try {
    // Waktu sekarang di Jakarta
    const nowJakarta = DateTime.now().setZone('Asia/Jakarta');

    // Start & end of day di WIB
    const startOfDay = nowJakarta.startOf('day').toJSDate();
    const endOfDay = nowJakarta.endOf('day').toJSDate();

    // Ambil semua sales item hari ini beserta product untuk costPrice
    const salesItems = await prisma.salesItem.findMany({
      where: {
        Sales: {
          sale_timestamp: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
      include: {
        Product: true, // ambil costPrice
      },
    });

    let totalRevenue = 0;
    let totalQuantity = 0;
    let totalMargin = 0;

    salesItems.forEach(item => {
      totalRevenue += item.price * item.quantity;
      totalQuantity += item.quantity;
      totalMargin += (item.price - (item.Product.costPrice + 1797.67)) * item.quantity;
    });

    return NextResponse.json(
      {
        date: nowJakarta.toFormat('yyyy-MM-dd'), // tanggal sesuai WIB
        totalRevenue,
        totalQuantity,
        totalMargin,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

