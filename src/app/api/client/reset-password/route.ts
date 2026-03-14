import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Client from "@/models/Client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
export async function POST(req: Request) {
    try {
        await dbConnect();
        const { token, newPassword, confirmPassword } = await req.json();

        if (!token || !newPassword || !confirmPassword) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
        }

        // Hash the incoming token to compare with DB
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const client = await Client.findOne({
            resetPasswordToken,
            resetPasswordTokenExpiry: { $gt: new Date() },
        });

        if (!client) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        client.password = hashedPassword;
        client.resetPasswordToken = undefined;
        client.resetPasswordTokenExpiry = undefined;
        await client.save();

        return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });

    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
