import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import Service from "@/models/Service";
import Location from "@/models/Location";
import Agent from "@/models/Agent";
import Puja from "@/models/Puja";
import PujaService from "@/models/PujaService";
import PuriPuja from "@/models/PuriPuja";

async function getClientId(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("client_token")?.value;
        if (!token) return null;
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");
        const { payload } = await jwtVerify(token, secret);
        return payload.id as string;
    } catch {
        return null;
    }
}

// GET /api/client/booking/[id]  — fetch a single booking by ID for the progress page
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const clientId = await getClientId();
    if (!clientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const { id } = await params;

    // Ensure models registered
    const _models = [Agent, Service, Location, Puja, PujaService, PuriPuja];

    const booking = await Booking.findOne({ _id: id, client: clientId })
        .populate("service", "name milestones availability")
        .populate("location", "name services")
        .populate({
            path: "puja",
            select: "name location imageUrl services",
            populate: {
                path: "services.service",
                select: "name milestones",
            },
        })
        .populate("pujaService", "name milestones")
        .populate("puriPuja", "name milestones")
        .populate("agent", "name phone")
        .lean();

    if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
}
