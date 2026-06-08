import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Client from "@/models/Client";
export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const client = await Client.findOne({ email });

        if (client) {
            return NextResponse.json({ exists: true, client }, { status: 200 });
        } else {
            return NextResponse.json({ exists: false }, { status: 200 });
        }
    } catch (error) {
        console.error("Error checking client email:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
