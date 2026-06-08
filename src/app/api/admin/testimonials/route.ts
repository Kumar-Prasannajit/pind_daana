import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

async function verifyAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || "your-secret-key"
        );
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch {
        return null;
    }
}

// GET /api/admin/testimonials — list all testimonials (with optional ?approved=true/false filter)
export async function GET(req: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const approvedParam = searchParams.get("approved");
    const filter: Record<string, unknown> = {};
    if (approvedParam === "true") filter.adminApproved = true;
    if (approvedParam === "false") filter.adminApproved = false;

    const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(testimonials);
}

// PATCH /api/admin/testimonials — approve / reject a testimonial
export async function PATCH(req: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const body = await req.json();
    const { id, adminApproved } = body;

    if (!id || typeof adminApproved !== "boolean") {
        return NextResponse.json(
            { error: "id and adminApproved (boolean) are required" },
            { status: 400 }
        );
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
        id,
        { adminApproved },
        { new: true }
    );

    if (!testimonial) {
        return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Updated", testimonial });
}

// DELETE /api/admin/testimonials — delete a testimonial
export async function DELETE(req: NextRequest) {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    await Testimonial.findByIdAndDelete(id);
    return NextResponse.json({ message: "Testimonial deleted" });
}
