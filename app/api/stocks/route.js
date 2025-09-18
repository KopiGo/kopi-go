import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/stocks
export async function GET() {
  try {
    const stocks = await prisma.stock.findMany({
      include: {
        driver: true,
        product: true,
      },
    });
    return NextResponse.json(stocks, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



