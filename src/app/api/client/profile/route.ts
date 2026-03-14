import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Client from "@/models/Client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function PUT(req: Request) {
    try {
        await dbConnect();

        const cookieStore = await cookies();
        const token = cookieStore.get("client_auth_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const clientId = decoded.clientId;
        const body = await req.json();
        const { name, phone, address } = body;

        // Validation
        if (!name || !phone) {
            return NextResponse.json({ error: "Name and Phone are required" }, { status: 400 });
        }

        const updatedClient = await Client.findByIdAndUpdate(
            clientId,
            { name, phone, address },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedClient) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Profile updated successfully",
            client: updatedClient
        }, { status: 200 });

    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
