
import { NextResponse } from "next/server";
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
export async function GET() {
    try {
        await dbConnect();

        // Verify Client Token
        const cookieStore = await cookies();
        const token = cookieStore.get("client_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");
        let clientId;
        try {
            const { payload } = await jwtVerify(token, secret);
            clientId = payload.id;
        } catch {
            return NextResponse.json({ error: "Invalid Client Token" }, { status: 401 });
        }

        // Ensure models are registered involved in populate

        // Force usage of imported models to prevent tree-shaking (though explicit import should be enough)
        const _models = [Agent, Service, Location, Puja, PujaService, PuriPuja];

        const bookings = await Booking.find({ client: clientId as any })
            .populate("service", "name milestones availability")
            .populate("location", "name services")
            .populate({
                path: "puja",
                select: "name location imageUrl services",
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
        console.error("Error fetching client bookings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
