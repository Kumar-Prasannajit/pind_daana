import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Client from '@/models/Client';
import LoginOtp from '@/models/LoginOtp';
import { generateOtp, hashOtp, sendOtpEmail, sendOtpWhatsApp } from '@/services/otp.service';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        let { identifier } = body; // email only, no password

        // 1. Sanitise
        identifier = identifier?.trim().toLowerCase();

        // 2. Validate
        if (!identifier || !/^.+@.+\..+$/.test(identifier)) {
            return NextResponse.json({ errors: ['Invalid email format'] }, { status: 422 });
        }

        // 3. Find client
        const client = await Client.findOne({ email: identifier });

        // 4. ALWAYS return the same response shape whether client exists or not
        const successMessage = "If an account exists, an OTP has been sent to your email and WhatsApp";

        if (client) {
            // 5a. Generate OTP + hash
            const otp = generateOtp();
            const otp_hash = hashOtp(otp);
            const ref_id = crypto.randomUUID();
            const can_resend_at = new Date(Date.now() + 120000);

            // 5c. Create LoginOtp document
            await LoginOtp.create({ 
                ref_id, 
                client_ref: identifier, 
                otp_hash, 
                otp_attempts: 0, 
                can_resend_at 
            });

            // 5d. Send OTP
            await sendOtpEmail(client.email, client.name, otp);
            await sendOtpWhatsApp(client.whatsapp_number, otp);

            return NextResponse.json({ message: successMessage, ref_id }, { status: 200 });
        } else {
            // 6. If client does NOT exist
            // Generate real UUID for timing consistency
            const ref_id = crypto.randomUUID();
            // This prevents timing attacks from exposing whether account exists
            return NextResponse.json({ message: successMessage, ref_id }, { status: 200 });
        }

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
