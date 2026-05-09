import mongoose from 'mongoose';
import PendingClient from '../models/PendingClient';
import LoginOtp from '../models/LoginOtp';
import RefreshToken from '../models/RefreshToken';
import dbConnect from '../lib/db';

/**
 * node-cron safety-net (belt-and-suspenders only, in case Atlas TTL worker lags)
 * You can import and run this in a custom server.js or as a standalone script.
 */
export const runCleanupJob = async () => {
    try {
        await dbConnect();
        
        const now = Date.now();
        // 10 minutes
        const pendingResult = await PendingClient.deleteMany({ 
            createdAt: { $lt: new Date(now - 600000) } 
        });
        // 2 minutes
        const loginResult = await LoginOtp.deleteMany({ 
            createdAt: { $lt: new Date(now - 120000) } 
        });
        // 7 days
        const tokenResult = await RefreshToken.deleteMany({ 
            createdAt: { $lt: new Date(now - 604800000) } 
        });

        // Log only row counts — never log emails, OTPs, or token values
        console.log(`[Cleanup Job] Deleted ${pendingResult.deletedCount} expired pending clients.`);
        console.log(`[Cleanup Job] Deleted ${loginResult.deletedCount} expired login OTPs.`);
        console.log(`[Cleanup Job] Deleted ${tokenResult.deletedCount} expired refresh tokens.`);
    } catch (error) {
        console.error('[Cleanup Job] Error running cleanup:', error);
    }
};
