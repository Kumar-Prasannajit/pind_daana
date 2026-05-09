import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Client from '@/models/Client';
import PendingClient from '@/models/PendingClient';
import { generateOtp, hashOtp, sendOtpEmail, sendOtpWhatsApp } from '@/services/otp.service';

export async function POST(req: Request) {
    try {
        await dbConnect();
        
        const body = await req.json();
        let { full_name, email, phone_number, whatsapp_number } = body;

        // Step 1 - Sanitise
        email = email?.trim().toLowerCase();
        phone_number = phone_number?.replace(/[\s\-\(\)]/g, '');
        whatsapp_number = whatsapp_number?.replace(/[\s\-\(\)]/g, '');
        full_name = full_name?.trim();

        // Step 2 - Validate
        const errors = [];
        if (!full_name || full_name.length < 2 || full_name.length > 100 || !/^[a-zA-Z\s]+$/.test(full_name)) {
            errors.push('Invalid full_name');
        }
        if (!email || !/^.+@.+\..+$/.test(email)) {
            errors.push('Invalid email format');
        }
        const phoneRegex = /^\+[1-9]\d{6,14}$/;
        if (!phone_number || !phoneRegex.test(phone_number)) {
            errors.push('Invalid phone_number format. Must be international e.g., +91XXXXXXXXXX');
        }
        if (!whatsapp_number || !phoneRegex.test(whatsapp_number)) {
            errors.push('Invalid whatsapp_number format. Must be international e.g., +91XXXXXXXXXX');
        }

        if (errors.length > 0) {
            return NextResponse.json({ errors }, { status: 422 });
        }

        // Step 3 - Duplicate checks
        const existingClientEmail = await Client.findOne({ email });
        if (existingClientEmail) {
            return NextResponse.json({ message: "An account with this email already exists" }, { status: 409 });
        }
        const existingClientPhone = await Client.findOne({ phone: phone_number });
        if (existingClientPhone) {
            return NextResponse.json({ message: "An account with this phone number already exists" }, { status: 409 });
        }
        const existingPending = await PendingClient.findOne({ email });
        if (existingPending) {
            return NextResponse.json({ message: "Verification already in progress for this email, check your messages or wait 10 minutes" }, { status: 409 });
        }

        // Step 4 - Generate OTP
        const otp = generateOtp();
        const otp_hash = hashOtp(otp);
        const ref_id = crypto.randomUUID();
        const can_resend_at = new Date(Date.now() + 120000); // 2 minutes from now

        // Step 5 - Save ONE document to PendingClient (signup data + OTP together)
        await PendingClient.create({
            name: full_name, email, phone: phone_number, whatsapp_number,
            ref_id, otp_hash, otp_attempts: 0, can_resend_at
        });

        // Step 6 - Send OTP (plain otp, never the hash)
        await sendOtpEmail(email, full_name, otp);
        await sendOtpWhatsApp(whatsapp_number, otp);

        // Step 7 - Respond
        return NextResponse.json({ message: "OTP sent to your email and WhatsApp", ref_id }, { status: 200 });

    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
