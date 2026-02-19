
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Client from "@/models/Client";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const connectToDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
    } catch (error) {
        console.error("DB Connection Error:", error);
    }
};

export async function POST(req: Request) {
    try {
        await connectToDB();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and Password are required" }, { status: 400 });
        }

        let client = await Client.findOne({ email });
        if (!client) {
            // Check if pending
            const PendingClient = (await import("@/models/PendingClient")).default;
            const pending = await PendingClient.findOne({ email });
            if (pending) {
                return NextResponse.json({
                    error: "Account not verified",
                    code: "ACCOUNT_NOT_VERIFIED",
                    email: email
                }, { status: 403 });
            }
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Check password - try bcrypt comparison first
        let isMatch = false;
        if (client.password) {
            try {
                isMatch = await bcrypt.compare(password, client.password);
            } catch (err) {
                // Fallback for plain text passwords (legacy support if needed)
                isMatch = client.password === password;
            }

            // If bcrypt failed but plain text matches (development/legacy case)
            if (!isMatch && client.password === password) {
                isMatch = true;
            }
        }

        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Create token using jose
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
        const token = await new SignJWT({
            id: client._id.toString(),
            email: client.email,
            name: client.name
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1d')
            .sign(secret);

        const response = NextResponse.json({
            message: "Login successful",
            success: true,
            user: { name: client.name, email: client.email }
        });

        response.cookies.set("client_token", token, {
            httpOnly: true,
            path: '/',
            maxAge: 86400 // 1 day
        });

        // Set a non-httpOnly cookie for client-side auth state checking
        response.cookies.set("client_auth_status", "true", {
            httpOnly: false, // Accessible via JS
            path: '/',
            maxAge: 86400
        });

        return response;

    } catch (error: any) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
