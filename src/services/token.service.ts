import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken';

export const issueTokens = async (client: any) => {
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

    const jwtToken = jwt.sign(
        { 
            id: client._id,             // For /me and /bookings routes
            clientId: client._id,       // For /profile route
            client_id: client._id,      // New standard
            email: client.email 
        },
        jwtSecret,
        { algorithm: 'HS256', expiresIn: '15m' }
    );

    // Refresh token raw value
    const rawRefreshToken = crypto.randomUUID();
    
    // Stored as SHA-256 hash in RefreshToken collection (never store raw)
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    await RefreshToken.create({
        client_id: client._id,
        token_hash: tokenHash
    });

    return { jwt: jwtToken, refreshToken: rawRefreshToken };
};
