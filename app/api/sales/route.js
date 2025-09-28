import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(req) {
  try {
    const { driver_id, items } = await req.json();

    // Validate required fields
    if (!driver_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Driver ID and items array are required' },
        { status: 400 }
      );
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      // Create the sales record
      const sale = await prisma.sales.create({
        data: {
          driver_id: driver_id,
          sale_timestamp: new Date(),
        },
      });

      // Create sales items and update stock
      const salesItems = [];
      for (const item of items) {
        const { product_id, quantity, price } = item;
        
        // Create sales item
        const salesItem = await prisma.salesItem.create({
          data: {
            sales_id: sale.sale_id,
            product_id: product_id,
            quantity: quantity,
            price: price,
          },
        });
        salesItems.push(salesItem);

        // Get current stock for this product and driver
        const currentStock = await prisma.stock.findFirst({
          where: {
            product_id: product_id,
            driver_id: driver_id,
          },
          orderBy: {
            created_at: 'desc',
          },
        });

        // Calculate new stock quantity
        const currentQuantity = currentStock ? currentStock.quantity : 0;
        const newQuantity = Math.max(0, currentQuantity - quantity);

        // Create new stock record with updated quantity
        await prisma.stock.create({
          data: {
            product_id: product_id,
            driver_id: driver_id,
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
        items_count: result.salesItems.length
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

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
      totalMargin += (item.price - (item.product.costPrice + 1797.67)) * item.quantity; 
    });

    return NextResponse.json(
      {
        date: startOfDay.toISOString().split('T')[0], 
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
