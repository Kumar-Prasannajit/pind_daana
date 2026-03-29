import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Agent from "@/models/Agent";
import Client from "@/models/Client";
import Service from "@/models/Service";
import Location from "@/models/Location";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// GET: Fetch all bookings assigned to the currently logged-in agent
export async function GET() {
    try {
        await dbConnect();

        // Register models for populate
        const _models = [Client, Service, Location, Agent];

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let agentId: string;
        try {
            const secret = new TextEncoder().encode(JWT_SECRET);
            const { payload } = await jwtVerify(token, secret);
            const decoded = payload as any;

            if (decoded.role !== "agent") {
                return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
            }

            agentId = decoded.id;
        } catch (err: any) {
            console.error("JWT Verify Error:", err.message);
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const bookings = await Booking.find({ agent: agentId })
            .populate("client", "name email phone")
            .populate("service", "name")
            .populate("location", "name")
            .populate("puja", "name")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ bookings });
    } catch (error: any) {
        console.error("Error fetching agent bookings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
