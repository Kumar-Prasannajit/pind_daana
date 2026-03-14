import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Client from "@/models/Client";
import PendingClient from "@/models/PendingClient"; // Import PendingClient
import { SignJWT } from "jose";
export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
        }

        const pendingClient = await PendingClient.findOne({ email });

        if (!pendingClient) {
            return NextResponse.json({ error: "Invalid or expired OTP request. Please signup again." }, { status: 400 });
        }

        if (pendingClient.otp !== otp) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        if (new Date() > pendingClient.otpExpiry) {
            return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
        }

        // OTP Verified - Move to Client
        const newClient = await Client.create({
            name: pendingClient.name,
            email: pendingClient.email,
            phone: pendingClient.phone,
            password: pendingClient.password, // Already hashed
            isBooked: false,
            expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });

        // Delete Pending Client
        await PendingClient.deleteOne({ email });

        // Generate Token (Login the user)
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");
        const token = await new SignJWT({
            id: newClient._id.toString(),
            email: newClient.email,
            name: newClient.name
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1d')
            .sign(secret);

        const response = NextResponse.json({
            message: "Account verified successfully",
            success: true,
            user: { name: newClient.name, email: newClient.email }
        });

        response.cookies.set("client_token", token, {
            httpOnly: true,
            path: '/',
            maxAge: 86400 // 1 day
        });

        response.cookies.set("client_auth_status", "true", {
            httpOnly: false,
            path: '/',
            maxAge: 86400
        });

        return response;

    } catch (error: any) {
        console.error("OTP Verification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
