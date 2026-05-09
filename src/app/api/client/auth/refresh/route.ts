import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import RefreshToken from '@/models/RefreshToken';
import Client from '@/models/Client';

export async function POST(req: Request) {
    try {
        await dbConnect();
        
        const cookieStore = await cookies();
        const rawRefreshToken = cookieStore.get('refresh_token')?.value;

        if (!rawRefreshToken) {
            return NextResponse.json({ message: "No refresh token provided" }, { status: 401 });
        }

        // Hash token
        const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

        // Check if token exists
        const tokenDoc = await RefreshToken.findOne({ token_hash: tokenHash });
        if (!tokenDoc) {
            return NextResponse.json({ message: "Invalid or expired refresh token" }, { status: 401 });
        }

        // Find client
        const client = await Client.findById(tokenDoc.client_id);
        if (!client) {
            return NextResponse.json({ message: "Client not found" }, { status: 404 });
        }

        // Issue new JWT
        const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

        const jwtToken = jwt.sign(
            { 
                id: client._id,
                clientId: client._id,
                client_id: client._id, 
                email: client.email 
            },
            jwtSecret,
            { algorithm: 'HS256', expiresIn: '15m' }
        );

        // Rotate: delete old RefreshToken, create new one
        await RefreshToken.deleteOne({ token_hash: tokenHash });

        const newRawRefreshToken = crypto.randomUUID();
        const newTokenHash = crypto.createHash('sha256').update(newRawRefreshToken).digest('hex');

        await RefreshToken.create({
            client_id: client._id,
            token_hash: newTokenHash
        });

        // Set new cookie
        cookieStore.set('refresh_token', newRawRefreshToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        cookieStore.set('client_token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 
        });

        cookieStore.set('client_auth_token', jwtToken, {
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

        // Respond
        return NextResponse.json({ message: "Token refreshed", token: jwtToken }, { status: 200 });

    } catch (error: any) {
        console.error('Refresh token error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
