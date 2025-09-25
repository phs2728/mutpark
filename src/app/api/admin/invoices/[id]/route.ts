import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoice = await prisma.taxInvoice.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        order: {
          include: {
            customer: true,
            orderItems: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ invoice });

  } catch (error) {
    console.error("Invoice fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoiceId = parseInt(params.id);

    const existingInvoice = await prisma.taxInvoice.findUnique({
      where: { id: invoiceId }
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const {
      status,
      tckn,
      vkn,
      taxOffice,
      companyName,
      companyAddress,
      customerName,
      customerAddress,
    } = await request.json();

    // Validate status change
    if (status && !["PENDING", "ISSUED", "CANCELLED", "FAILED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Validate TCKN/VKN if provided
    if (tckn && !/^\d{11}$/.test(tckn)) {
      return NextResponse.json(
        { error: "TCKN must be 11 digits" },
        { status: 400 }
      );
    }

    if (vkn && !/^\d{10}$/.test(vkn)) {
      return NextResponse.json(
        { error: "VKN must be 10 digits" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (tckn !== undefined) updateData.tckn = tckn;
    if (vkn !== undefined) updateData.vkn = vkn;
    if (taxOffice !== undefined) updateData.taxOffice = taxOffice;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyAddress !== undefined) updateData.companyAddress = companyAddress;
    if (customerName !== undefined) updateData.customerName = customerName;
    if (customerAddress !== undefined) updateData.customerAddress = customerAddress;

    // Add issue/cancel timestamps
    if (status === "ISSUED" && existingInvoice.status !== "ISSUED") {
      updateData.issuedAt = new Date();
    }
    if (status === "CANCELLED" && existingInvoice.status !== "CANCELLED") {
      updateData.cancelledAt = new Date();
    }

    const updatedInvoice = await prisma.taxInvoice.update({
      where: { id: invoiceId },
      data: updateData
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "UPDATE",
        entityType: "TaxInvoice",
        entityId: invoiceId.toString(),
        oldValues: {
          status: existingInvoice.status,
        },
        newValues: {
          status: updatedInvoice.status,
        },
        description: `Updated tax invoice ${existingInvoice.invoiceNumber} status from ${existingInvoice.status} to ${updatedInvoice.status}`,
      },
    });

    return NextResponse.json({ success: true, invoice: updatedInvoice });

  } catch (error) {
    console.error("Invoice update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoiceId = parseInt(params.id);

    const existingInvoice = await prisma.taxInvoice.findUnique({
      where: { id: invoiceId }
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Only allow deletion of PENDING or FAILED invoices
    if (existingInvoice.status === "ISSUED") {
      return NextResponse.json(
        { error: "Cannot delete issued invoice. Cancel it instead." },
        { status: 400 }
      );
    }

    await prisma.taxInvoice.delete({
      where: { id: invoiceId }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: authResult.user.userId,
        action: "DELETE",
        entityType: "TaxInvoice",
        entityId: invoiceId.toString(),
        oldValues: {
          invoiceNumber: existingInvoice.invoiceNumber,
          status: existingInvoice.status,
        },
        newValues: {},
        description: `Deleted tax invoice ${existingInvoice.invoiceNumber}`,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Invoice deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}