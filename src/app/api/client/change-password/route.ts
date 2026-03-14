import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Client from "@/models/Client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
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
        const { oldPassword, newPassword, confirmPassword } = body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
        }

        const client = await Client.findById(clientId);
        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // Verify old password
        // Use type assertion or check if password exists on the client object
        // The IClient interface defines password as optional 'password?: string'
        // But since we are fetching from DB and it's required in schema, it should be there.
        // However, we didn't use .select('+password') if it was excluded by default.
        // Let's assume standard fetch includes it unless excluded in schema.
        // Wait, Mongoose schema usually doesn't exclude by default unless specified `select: false`.
        // Let's check IClient definition from previous view_file. It was just type: String, required: true.

        const isMatch = await bcrypt.compare(oldPassword, client.password || "");
        if (!isMatch) {
            return NextResponse.json({ error: "Incorrect old password" }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        client.password = hashedPassword;
        await client.save();

        return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Password change error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
