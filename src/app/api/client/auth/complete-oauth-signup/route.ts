import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Client from '@/models/Client'
import { issueTokens } from '@/services/token.service'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        const { phone_number, whatsapp_number } = await req.json();

        if (!phone_number || !whatsapp_number) {
            return NextResponse.json({ message: "Phone and WhatsApp numbers are required" }, { status: 400 });
        }

        const cookieStore = await cookies();
        const pendingCookie = cookieStore.get('oauth_pending')?.value;

        if (!pendingCookie) {
            return NextResponse.json({ message: "OAuth session expired or invalid. Please sign in again." }, { status: 400 });
        }

        const pendingData = JSON.parse(pendingCookie);

        await dbConnect();

        // Ensure the phone number isn't already used
        const existingPhone = await Client.findOne({ phone: phone_number });
        if (existingPhone) {
            return NextResponse.json({ message: "This phone number is already registered to another account." }, { status: 400 });
        }

        // Create the new client
        const newClient = await Client.create({
            name: pendingData.name,
            email: pendingData.email,
            phone: phone_number,
            whatsapp_number: whatsapp_number,
            is_verified: true,
            authProvider: pendingData.provider
        });

        // Issue tokens
        const { jwt, refreshToken } = await issueTokens(newClient);
        
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

        // Clear the pending cookie
        cookieStore.delete('oauth_pending');

        return NextResponse.json({
            message: "Account created and verified successfully",
            token: jwt,
            client: { 
                _id: newClient._id, 
                name: newClient.name, 
                email: newClient.email 
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Complete OAuth Signup Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
