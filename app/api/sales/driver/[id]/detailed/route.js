import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

export async function GET(req, { params }) {
  try {
    const driverId = Number(params.id);
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    let startOfDay, endOfDay;
    
    if (dateParam) {
      const selectedDate = new Date(dateParam);
      startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
    } else {
      // Default to today
      startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
    }

    // Get detailed sales data for the driver on the specified date
    const salesData = await prisma.sales.findMany({
      where: {
        driver_id: driverId,
        sale_timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Group sales items by product
    const productSales = {};
    let totalRevenue = 0;

    salesData.forEach(sale => {
      sale.items.forEach(item => {
        const productId = item.product_id;
        const productName = item.product.name;
        
        if (!productSales[productId]) {
          productSales[productId] = {
            product_id: productId,
            product_name: productName,
            total_quantity: 0,
            total_revenue: 0,
          };
        }
        
        productSales[productId].total_quantity += item.quantity;
        productSales[productId].total_revenue += (item.quantity * item.price);
        totalRevenue += (item.quantity * item.price);
      });
    });

    const salesSummary = Object.values(productSales);

    return NextResponse.json({
      sales_summary: salesSummary,
      total_revenue: totalRevenue,
      date: dateParam || new Date().toISOString().split('T')[0]
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}