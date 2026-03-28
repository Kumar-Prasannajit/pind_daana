import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Coupon from "@/models/Coupon";

// GET: Fetch all coupons
export async function GET() {
    await dbConnect();
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, data: coupons });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to fetch coupons" }, { status: 500 });
    }
}

// POST: Create a new coupon
export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const body = await req.json();
        const coupon = await Coupon.create(body);
        return NextResponse.json({ success: true, data: coupon }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || "Failed to create coupon" }, { status: 400 });
    }
}

// DELETE: Delete a coupon by ID
export async function DELETE(req: NextRequest) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, error: "Coupon ID is required" }, { status: 400 });
        }

        const deletedCoupon = await Coupon.findByIdAndDelete(id);

        if (!deletedCoupon) {
            return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to delete coupon" }, { status: 500 });
    }
}
