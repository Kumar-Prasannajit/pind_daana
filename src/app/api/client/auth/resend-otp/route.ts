import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PendingClient from '@/models/PendingClient';
import { generateOtp, hashOtp, sendOtpEmail, sendOtpWhatsApp } from '@/services/otp.service';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { ref_id } = await req.json();

        // 1. Find document
        const doc = await PendingClient.findOne({ ref_id });
        if (!doc) {
            return NextResponse.json({ message: "Session not found or expired, please sign up again" }, { status: 404 });
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
        await PendingClient.findOneAndUpdate(
            { ref_id },
            {
                otp_hash: newHash,
                otp_attempts: 0,
                can_resend_at: new Date(Date.now() + 120000),
                createdAt: new Date() // reset createdAt to restart the 10-min TTL countdown
            }
        );

        // 5. Re-send OTP
        await sendOtpEmail(doc.email, doc.name, otp);
        await sendOtpWhatsApp(doc.whatsapp_number, otp);

        // 6. Respond
        return NextResponse.json({ message: "New OTP sent", ref_id }, { status: 200 });

    } catch (error: any) {
        console.error('Resend OTP error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
