import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import Client from '@/models/Client';
import LoginOtp from '@/models/LoginOtp';
import { hashOtp } from '@/services/otp.service';
import { issueTokens } from '@/services/token.service';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { ref_id, otp } = await req.json();

        // 1. Find document
        const doc = await LoginOtp.findOne({ ref_id });
        if (!doc) {
            return NextResponse.json({ message: "OTP has expired, please log in again" }, { status: 410 });
        }

        // 2. Increment attempts atomically
        const updated = await LoginOtp.findOneAndUpdate(
            { ref_id }, 
            { $inc: { otp_attempts: 1 } }, 
            { new: true }
        );

        // 3. Max attempts
        if (updated && updated.otp_attempts > 3) {
            await LoginOtp.deleteOne({ ref_id });
            return NextResponse.json({ message: "Maximum attempts exceeded, please log in again" }, { status: 429 });
        }

        // 4. Hash submitted OTP and compare
        const submitted_hash = hashOtp(otp);
        if (updated && submitted_hash !== updated.otp_hash) {
            return NextResponse.json({ message: "Invalid OTP" }, { status: 401 });
        }

        // 5. On match:
        // a. Find client
        const client = await Client.findOne({ email: doc.client_ref });
        if (!client) {
            return NextResponse.json({ message: "Client not found" }, { status: 404 });
        }

        // b. Clean up immediately on success
        await LoginOtp.deleteOne({ ref_id });

        // c. Issue tokens
        const { jwt, refreshToken } = await issueTokens(client);

        // d. Set cookies
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
            maxAge: 7 * 24 * 60 * 60 // Let the cookie live 7 days; frontend can still use refresh if JWT expires
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

        // e. Respond
        return NextResponse.json({ 
            message: "Logged in successfully", 
            token: jwt, 
            client: { 
                _id: client._id, 
                name: client.name, 
                email: client.email 
            } 
        }, { status: 200 });

    } catch (error: any) {
        console.error('Verify login OTP error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
