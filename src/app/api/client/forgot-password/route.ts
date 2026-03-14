import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Client from "@/models/Client";
import { sendResetLinkEmail } from "@/lib/email";
import crypto from "crypto";
export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email: rawEmail } = await req.json();
        const email = rawEmail?.toLowerCase().trim();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const client = await Client.findOne({ email });
        if (!client) {
            return NextResponse.json({ error: "Email not found" }, { status: 404 });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        const resetPasswordTokenExpiry = Date.now() + 15 * 60 * 1000;

        // Use updateOne to ensure fields are saved even if Mongoose schema cache is stale
        await Client.updateOne(
            { _id: client._id },
            {
                $set: {
                    resetPasswordToken: resetPasswordToken,
                    resetPasswordTokenExpiry: new Date(resetPasswordTokenExpiry)
                }
            },
            { strict: false }
        );

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const resetLink = `${appUrl}/client/reset-password/${resetToken}`;

        try {
            await sendResetLinkEmail({
                to: email,
                name: client.name,
                resetLink,
            });
        } catch (emailError) {
            console.error("Failed to send reset link email:", emailError);
            return NextResponse.json({ error: "Failed to send reset link email" }, { status: 500 });
        }

        return NextResponse.json({ message: "Reset link sent to your email" }, { status: 200 });

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
