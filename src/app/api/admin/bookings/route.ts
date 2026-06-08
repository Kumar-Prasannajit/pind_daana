
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Agent from "@/models/Agent";
import Client from "@/models/Client";
import Service from "@/models/Service";
import Location from "@/models/Location";
import Puja from "@/models/Puja";
import PujaService from "@/models/PujaService";
import PuriPuja from "@/models/PuriPuja";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { PAYMENT_COMPLETED_MILESTONE, markPaymentCompleted } from "@/lib/milestones";
// GET: Fetch all bookings for Admin
export async function GET() {
    try {
        await dbConnect();
        // Ensure models are registered for populate
        const _models = [Client, Service, Location, Agent, Puja, PujaService, PuriPuja];

        // Verify Admin Token
        const cookieStore = await cookies();
        const token = cookieStore.get("admin_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");
        try {
            await jwtVerify(token, secret);
        } catch {
            return NextResponse.json({ error: "Invalid Admin Token" }, { status: 401 });
        }

        const bookings = await Booking.find({})
            .populate("client", "name email phone")
            .populate("service", "name milestones")
            .populate({
                path: "location",
                select: "name services",
                populate: {
                    path: "services.service",
                    select: "name"
                }
            })
            .populate({
                path: "puja",
                select: "name location services",
                populate: {
                    path: "services.service",
                    select: "name milestones"
                }
            })
            .populate("pujaService", "name milestones")
            .populate("puriPuja", "name milestones")
            .populate("agent", "name phone")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH: Verify Payment or Assign Agent
export async function PATCH(req: Request) {
    try {
        await dbConnect();

        // Verify Admin Token
        const cookieStore = await cookies();
        const token = cookieStore.get("admin_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");
        try {
            await jwtVerify(token, secret);
        } catch {
            return NextResponse.json({ error: "Invalid Admin Token" }, { status: 401 });
        }

        const { bookingId, isPaymentVerified, agentId } = await req.json();

        if (!bookingId) {
            return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
        }

        const updateData: any = {};
        if (typeof isPaymentVerified === 'boolean') {
            updateData.isPaymentVerified = isPaymentVerified;
            if (isPaymentVerified && !updateData.status) {
                updateData.paymentStatus = "Completed";
            }
        }
        if (agentId) {
            updateData.agent = agentId;
        }

        const existingBooking = await Booking.findById(bookingId).select("completedMilestones");
        if (!existingBooking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        if (typeof isPaymentVerified === 'boolean') {
            updateData.completedMilestones = isPaymentVerified
                ? markPaymentCompleted(existingBooking.completedMilestones || [])
                : (existingBooking.completedMilestones || []).filter((milestone: string) => milestone !== PAYMENT_COMPLETED_MILESTONE);
        }

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            updateData,
            { new: true }
        ).populate("agent", "name phone")
            .populate("client", "name email");

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Post-update status check
        if (booking.isPaymentVerified && booking.agent) {
            booking.status = "Confirmed";
            await booking.save();

            // Send confirmation email
            const client = booking.client as any;
            const agent = booking.agent as any;

            if (client && client.email) {
                await sendBookingConfirmationEmail({
                    to: client.email,
                    name: client.name,
                    bookingId: booking._id,
                    agentName: agent ? agent.name : 'Assigned Agent'
                });
            }
        }

        return NextResponse.json({ message: "Booking updated", booking });

    } catch (error) {
        console.error("Error updating booking:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
