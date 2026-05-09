import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Client from '@/models/Client';
import PendingClient from '@/models/PendingClient';
import { hashOtp } from '@/services/otp.service';
import { issueTokens } from '@/services/token.service';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { ref_id, otp } = await req.json();

        // 1. Find PendingClient
        const doc = await PendingClient.findOne({ ref_id });
        if (!doc) {
            return NextResponse.json({ message: "OTP has expired or session not found, please sign up again" }, { status: 410 });
        }

        // 2. Increment attempts ATOMICALLY
        const updated = await PendingClient.findOneAndUpdate(
            { ref_id },
            { $inc: { otp_attempts: 1 } },
            { new: true }
        );

        // 3. Max attempts
        if (updated && updated.otp_attempts > 3) {
            await PendingClient.deleteOne({ ref_id });
            return NextResponse.json({ message: "Maximum attempts exceeded, please sign up again" }, { status: 429 });
        }

        // 4. Hash submitted OTP
        const submitted_hash = hashOtp(otp);

        // 5. Compare
        if (updated && submitted_hash !== updated.otp_hash) {
            return NextResponse.json({ message: "Invalid OTP" }, { status: 401 });
        }

        // 6. On match — move to client (removed transaction for local MongoDB compatibility)
        try {
            // a. Create verified client from pending data
            const newClient = await Client.create({
                name: doc.name,
                email: doc.email,
                phone: doc.phone,
                whatsapp_number: doc.whatsapp_number,
                is_verified: true
            });

            // b. Delete the pending_client document (OTP deleted with it automatically)
            await PendingClient.deleteOne({ ref_id });

            // c. Issue tokens and respond
            const { jwt, refreshToken } = await issueTokens(newClient);
            
            // Wait for cookies API
            const cookieStore = await cookies();
            cookieStore.set('refresh_token', refreshToken, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 // 7 days
            });

            cookieStore.set('client_token', jwt, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 
            });

            cookieStore.set('client_auth_token', jwt, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 
            });

            cookieStore.set('client_auth_status', 'true', {
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60
            });

            return NextResponse.json({
                message: "Account created and verified successfully",
                token: jwt,
                client: { 
                    _id: newClient._id, 
                    name: newClient.name, 
                    email: newClient.email 
                }
            }, { status: 201 });

        } catch (err) {
            throw err;
        }

    } catch (error: any) {
        console.error('Verify signup OTP error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
