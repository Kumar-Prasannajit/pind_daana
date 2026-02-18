import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Client from "@/models/Client";
import PendingClient from "@/models/PendingClient";
import bcrypt from "bcryptjs";
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
        const { name, email, phone, password } = await req.json();

        if (!name || !email || !phone || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Check if user already exists in Client
        const existingClient = await Client.findOne({ email });
        if (existingClient) {
            return NextResponse.json({ error: "User already exists. Please login." }, { status: 400 });
        }

        // Check if user exists in PendingClient (overwrite if so, effectively a resend/restart)
        // Or we could return an error saying "OTP already sent". Let's overwrite for better UX if they messed up.
        await PendingClient.deleteOne({ email });

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create Pending Client
        await PendingClient.create({
            name,
            email,
            phone,
            password: hashedPassword,
            otp,
            otpExpiry
        });

        // Send OTP Email
        try {
            await sendOtpEmail({ to: email, name, otp });
        } catch (emailError) {
            console.error("Failed to send OTP email:", emailError);
            // Optional: revert DB change if email fails, but maybe better to let them "resend"
            // For now, let's keep it but warn user? Or just return success for security?
            // Returning error so they know email didn't go out.
            return NextResponse.json({ error: "Failed to send OTP email. Please try again." }, { status: 500 });
        }

        return NextResponse.json({ message: "OTP sent successfully. Please verify your account." }, { status: 201 });

    } catch (error: any) {
        console.error("Signup Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
