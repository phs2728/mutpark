import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (status) where.status = status;
    if (orderId) where.orderId = parseInt(orderId);

    const [invoices, total] = await Promise.all([
      prisma.taxInvoice.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              user: {
                select: {
                  name: true,
                  email: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.taxInvoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Invoice fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      orderId,
      tckn,
      vkn,
      taxOffice,
      companyName,
      companyAddress,
      customerName,
      customerAddress,
    } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // TCKN or VKN validation
    if (!tckn && !vkn) {
      return NextResponse.json(
        { error: "TCKN or VKN is required" },
        { status: 400 }
      );
    }

    // Validate TCKN (11 digits)
    if (tckn && !/^\d{11}$/.test(tckn)) {
      return NextResponse.json(
        { error: "TCKN must be 11 digits" },
        { status: 400 }
      );
    }

    // Validate VKN (10 digits)
    if (vkn && !/^\d{10}$/.test(vkn)) {
      return NextResponse.json(
        { error: "VKN must be 10 digits" },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if invoice already exists for this order
    const existingInvoice = await prisma.taxInvoice.findUnique({
      where: { orderId: parseInt(orderId) }
    });

    if (existingInvoice) {
      return NextResponse.json(
        { error: "Invoice already exists for this order" },
        { status: 400 }
      );
    }

    // Calculate tax amounts (Turkish VAT is typically 18%)
    const TAX_RATE = 0.18;
    const subtotalAmount = order.totalAmount;
    const taxAmount = subtotalAmount * TAX_RATE;
    const totalAmount = subtotalAmount + taxAmount;

    // Generate invoice number (format: YYYY-MMDD-HHMMSS-XXX)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const invoiceNumber = `${year}-${month}${day}-${hours}${minutes}${seconds}-${random}`;

    const taxInvoice = await prisma.taxInvoice.create({
      data: {
        orderId: parseInt(orderId),
        invoiceNumber,
        tckn: tckn || null,
        vkn: vkn || null,
        taxOffice: taxOffice || null,
        companyName: companyName || null,
        companyAddress,
        customerName,
        customerAddress,
        subtotalAmount,
        taxAmount,
        totalAmount,
        status: "PENDING",
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "CREATE",
        entityType: "TaxInvoice",
        entityId: taxInvoice.id.toString(),
        oldValues: {},
        newValues: {
          invoiceNumber: taxInvoice.invoiceNumber,
          orderId: taxInvoice.orderId,
          totalAmount: taxInvoice.totalAmount.toString(),
        },
        description: `Created tax invoice ${taxInvoice.invoiceNumber} for order ${order.orderNumber}`,
      },
    });

    return NextResponse.json({ success: true, invoice: taxInvoice });

  } catch (error) {
    console.error("Invoice creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}