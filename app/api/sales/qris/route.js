import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { DateTime } from "luxon";

export async function GET() {
  try {
    const nowJakarta = DateTime.now().setZone("Asia/Jakarta");
    const startOfDay = nowJakarta.startOf("day").toJSDate();
    const endOfDay = nowJakarta.endOf("day").toJSDate();

    const salesItems = await prisma.salesItem.findMany({
      where: {
        Sales: {
          payment: "QRIS",
          sale_timestamp: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
      include: {
        Product: true,
      },
    });

    let totalRevenue = 0;
    let totalQuantity = 0;
    let totalMargin = 0;

    salesItems.forEach((item) => {
      totalRevenue += item.price;
      totalQuantity += item.quantity;
      totalMargin +=
        item.price - (item.Product.costPrice + 1797.67) * item.quantity;
    });

    return NextResponse.json(
      {
        date: nowJakarta.toFormat("yyyy-MM-dd"),
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
