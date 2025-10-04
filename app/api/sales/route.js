import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { DateTime } from 'luxon';

export async function POST(req) {
  try {
    const { driver_id, items, payment_method } = await req.json();

    if (!driver_id || !items || !Array.isArray(items) || items.length === 0 || !payment_method) {
      return NextResponse.json(
        { error: 'Driver ID, items, dan payment_method wajib diisi' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (prismaTx) => {
      const saleTime = DateTime.now().setZone('Asia/Jakarta').toJSDate();
      const todayDate = DateTime.now().setZone('Asia/Jakarta').toISODate(); // YYYY-MM-DD

      // 🧾 Buat record sales
      const sale = await prismaTx.sales.create({
        data: {
          driver_id,
          sale_timestamp: saleTime,
          payment:payment_method,
        },
      });

      const salesItems = [];

      for (const item of items) {
        const { product_id, quantity } = item;

        // Ambil data produk
        const product = await prismaTx.product.findUnique({
          where: { product_id },
        });
        if (!product) throw new Error(`Produk ${product_id} tidak ditemukan`);

        const pricePerItem = product.price;
        const totalPrice = pricePerItem * quantity;

        // Cek stok terbaru berdasarkan tanggal, produk, dan driver
        const todayStart = DateTime.fromISO(todayDate, { zone: 'Asia/Jakarta' }).startOf('day').toJSDate();
        const todayEnd = DateTime.fromISO(todayDate, { zone: 'Asia/Jakarta' }).endOf('day').toJSDate();

        const currentStock = await prismaTx.stock.findFirst({
          where: {
            product_id,
            driver_id,
            created_at: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
          orderBy: { created_at: 'desc' },
        });

        if (!currentStock) {
          throw new Error(`Belum ada stok hari ini untuk produk ${product_id}`);
        }

        const currentQuantity = currentStock.quantity;

        // Validasi stok cukup
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
            price: totalPrice,
          },
        });
        salesItems.push(salesItem);

        // Hitung stok baru dan update
        const newQuantity = currentQuantity - quantity;

        await prismaTx.stock.update({
          where: { stock_id: currentStock.stock_id },
          data: { quantity: newQuantity },
        });
      }

      return { sale, salesItems };
    });

    return NextResponse.json(
      {
        message: 'Order created successfully',
        sale_id: result.sale.sale_id,
        payment_method: result.sale.payment_method,
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
      totalRevenue += item.price;
      totalQuantity += item.quantity;
      totalMargin += (item.price - ((item.Product.costPrice + 1797.67)*item.quantity));
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

