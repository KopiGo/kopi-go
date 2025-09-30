import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    // Get all sales data for debugging
    const allSales = await prisma.sales.findMany({
      include: {
        SalesItem: true
      },
      orderBy: {
        sale_timestamp: 'desc'
      }
    });

    // Count by payment method
    const paymentCounts = await prisma.sales.groupBy({
      by: ['payment'],
      _count: {
        payment: true
      }
    });

    // Get QRIS sales specifically
    const qrisSales = await prisma.sales.findMany({
      where: {
        payment: 'QRIS'
      },
      include: {
        SalesItem: true
      }
    });

    return NextResponse.json(
      {
        totalSales: allSales.length,
        paymentCounts,
        qrisCount: qrisSales.length,
        allSales: allSales.slice(0, 10), // Show last 10 sales
        qrisSales
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}