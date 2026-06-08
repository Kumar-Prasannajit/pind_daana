import { NextRequest, NextResponse } from "next/server";
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
import { markPaymentCompleted } from "@/lib/milestones";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function getAgentId(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return null;

        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const decoded = payload as any;

        if (decoded.role !== "agent") return null;
        return decoded.id;
    } catch {
        return null;
    }
}

// GET: Fetch all bookings assigned to the currently logged-in agent
export async function GET() {
    try {
        await dbConnect();

        // Register models for populate
        const _models = [Client, Service, Location, Agent, Puja, PujaService, PuriPuja];

        const agentId = await getAgentId();
        if (!agentId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bookings = await Booking.find({ agent: agentId })
            .populate("client", "name email phone")
            .populate("service", "name _id milestones")
            .populate("location", "name services")
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
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ bookings });
    } catch (error: any) {
        console.error("Error fetching agent bookings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH: Save completedMilestones for a booking
export async function PATCH(req: NextRequest) {
    try {
        await dbConnect();

        const agentId = await getAgentId();
        if (!agentId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { bookingId, completedMilestones } = body;

        if (!bookingId || !Array.isArray(completedMilestones)) {
            return NextResponse.json({ error: "bookingId and completedMilestones[] are required" }, { status: 400 });
        }

        // Ensure this booking belongs to the agent
        const booking = await Booking.findOne({ _id: bookingId, agent: agentId });
        if (!booking) {
            return NextResponse.json({ error: "Booking not found or not assigned to you" }, { status: 404 });
        }

        if (!booking.isPaymentVerified || booking.paymentStatus === "Pending") {
            return NextResponse.json({ error: "Payment must be verified before updating milestones" }, { status: 400 });
        }

        booking.completedMilestones = markPaymentCompleted(completedMilestones);
        await booking.save();

        return NextResponse.json({ success: true, completedMilestones: booking.completedMilestones });
    } catch (error: any) {
        console.error("Error saving milestones:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
