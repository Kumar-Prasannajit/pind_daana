import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Client from "@/models/Client";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";
export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Basic validation
        if (!body.name || !body.email || !body.phone) {
            return NextResponse.json({ error: "Name, Email, and Phone are required" }, { status: 400 });
        }

        // Default password
        const defaultPassword = "manima@123456";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const newClient = await Client.create({
            ...body,
            password: hashedPassword,
        });

        // Send Welcome Email
        try {
            await sendWelcomeEmail({
                to: body.email,
                name: body.name,
                email: body.email,
                password: defaultPassword, // Send the unhashed default password
            });
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
            // Don't fail the request if email fails, but log it
        }

        return NextResponse.json({ message: "Client created successfully", client: newClient }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }
        console.error("Error creating client:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
