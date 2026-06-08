import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import RefreshToken from '@/models/RefreshToken';

export async function POST(req: Request) {
    try {
        await dbConnect();
        
        const cookieStore = await cookies();
        const rawRefreshToken = cookieStore.get('refresh_token')?.value;

        if (rawRefreshToken) {
            // Hash it and delete
            const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
            await RefreshToken.deleteOne({ token_hash: tokenHash });
        }

        // Clear cookie
        cookieStore.delete('refresh_token');

        // Respond
        return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });

    } catch (error: any) {
        console.error('Logout error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
