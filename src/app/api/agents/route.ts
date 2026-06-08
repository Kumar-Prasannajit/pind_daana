import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Agent from "@/models/Agent";
import bcrypt from "bcryptjs";
export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Basic validation
        if (!body.name || !body.email || !body.phone || !body.location) {
            return NextResponse.json({ error: "Name, Email, Phone, and Location are required" }, { status: 400 });
        }

        // Default password
        const defaultPassword = "manima@1234";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const newAgent = await Agent.create({
            ...body,
            password: hashedPassword,
        });

        return NextResponse.json({ message: "Agent created successfully", agent: newAgent }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }
        console.error("Error creating agent:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const locationId = searchParams.get("location");

        let query = {};
        if (locationId) {
            query = { location: locationId };
        }

        const agents = await Agent.find(query).sort({ name: 1 }).lean();
        return NextResponse.json(agents);
    } catch (error) {
        console.error("Error fetching agents:", error);
        return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
    }
}
