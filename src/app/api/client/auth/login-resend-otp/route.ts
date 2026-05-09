import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Client from '@/models/Client';
import LoginOtp from '@/models/LoginOtp';
import { generateOtp, hashOtp, sendOtpEmail, sendOtpWhatsApp } from '@/services/otp.service';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { ref_id } = await req.json();

        // 1. Find document
        const doc = await LoginOtp.findOne({ ref_id });
        if (!doc) {
            return NextResponse.json({ message: "Session not found or expired, please log in again" }, { status: 404 });
        }

        // 2. Check cooldown
        if (Date.now() < doc.can_resend_at.getTime()) {
            return NextResponse.json({ 
                message: "Please wait before requesting a new OTP", 
                retry_after_seconds: Math.ceil((doc.can_resend_at.getTime() - Date.now()) / 1000) 
            }, { status: 429 });
        }

        // 3. Generate new OTP + hash
        const otp = generateOtp();
        const newHash = hashOtp(otp);

        // 4. Update the document
        await LoginOtp.findOneAndUpdate(
            { ref_id },
            {
                otp_hash: newHash,
                otp_attempts: 0,
                can_resend_at: new Date(Date.now() + 120000),
                createdAt: new Date() // reset createdAt to restart the 2-min TTL countdown
            }
        );

        // 5. Look up client by doc.client_ref, re-send OTP
        const client = await Client.findOne({ email: doc.client_ref });
        if (client) {
            await sendOtpEmail(client.email, client.name, otp);
            await sendOtpWhatsApp(client.whatsapp_number, otp);
        }

        // 6. Respond
        return NextResponse.json({ message: "New OTP sent", ref_id }, { status: 200 });

    } catch (error: any) {
        console.error('Login Resend OTP error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
