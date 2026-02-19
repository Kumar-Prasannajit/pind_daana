import { NextResponse } from "next/server";
import mongoose from "mongoose";
import PendingClient from "@/models/PendingClient";
import { sendOtpEmail } from "@/lib/email";

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
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const pendingClient = await PendingClient.findOne({ email });

        if (!pendingClient) {
            return NextResponse.json({ error: "No pending registration found for this email." }, { status: 404 });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        pendingClient.otp = otp;
        pendingClient.otpExpiry = otpExpiry;
        await pendingClient.save();

        // Send OTP Email
        try {
            await sendOtpEmail({ to: email, name: pendingClient.name, otp });
        } catch (emailError) {
            console.error("Failed to resend OTP email:", emailError);
            return NextResponse.json({ error: "Failed to send OTP email." }, { status: 500 });
        }

        return NextResponse.json({ message: "OTP resent successfully." }, { status: 200 });

    } catch (error: any) {
        console.error("Resend OTP Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
