import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import Client from "@/models/Client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

// POST /api/client/testimonials  — submit a testimonial (client only)
export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // Verify Client Token
        const cookieStore = await cookies();
        const token = cookieStore.get("client_token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || "your-secret-key"
        );

        let clientId: string;
        try {
            const { payload } = await jwtVerify(token, secret);
            clientId = payload.id as string;
        } catch {
            return NextResponse.json({ error: "Invalid client token" }, { status: 401 });
        }

        const body = await req.json();
        const { pujaOrServiceOpted, comment, rating } = body;

        if (!pujaOrServiceOpted || !comment || rating === undefined) {
            return NextResponse.json(
                { error: "pujaOrServiceOpted, comment, and rating are required" },
                { status: 400 }
            );
        }

        const ratingNum = Number(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return NextResponse.json(
                { error: "Rating must be a number between 1 and 5" },
                { status: 400 }
            );
        }

        // Fetch client name
        const client = await Client.findById(clientId).select("name").lean() as { name: string } | null;
        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // Check for duplicate testimonial for same service by the same client
        const existing = await Testimonial.findOne({
            client: clientId,
            pujaOrServiceOpted: pujaOrServiceOpted.trim(),
        });

        if (existing) {
            return NextResponse.json(
                { error: "You have already submitted feedback for this service" },
                { status: 409 }
            );
        }

        const testimonial = await Testimonial.create({
            client: clientId,
            clientName: client.name,
            pujaOrServiceOpted: pujaOrServiceOpted.trim(),
            comment: comment.trim(),
            rating: ratingNum,
            adminApproved: false,
        });

        return NextResponse.json(
            { message: "Testimonial submitted successfully", testimonial },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error submitting testimonial:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
