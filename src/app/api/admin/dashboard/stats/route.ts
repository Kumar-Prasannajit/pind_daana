import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Client from '@/models/Client';
import Agent from '@/models/Agent';
import Location from '@/models/Location';

/* eslint-disable @typescript-eslint/no-explicit-any */

async function getGrowthStats(Model: any) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const total = await Model.countDocuments();

    const currentMonthCount = await Model.countDocuments({
        createdAt: { $gte: currentMonthStart }
    });

    const lastMonthCount = await Model.countDocuments({
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });

    let growth = 0;
    if (lastMonthCount > 0) {
        growth = ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;
    } else if (currentMonthCount > 0) {
        growth = 100; // If there were 0 last month and some this month, it's 100% growth (or undefined, but 100 looks better)
    }

    return {
        total,
        growth: Math.round(growth)
    };
}

export async function GET() {
    try {
        await dbConnect();

        const [bookingStats, clientStats, agentStats, locationStats] = await Promise.all([
            getGrowthStats(Booking),
            getGrowthStats(Client),
            getGrowthStats(Agent),
            getGrowthStats(Location)
        ]);

        return NextResponse.json({
            bookings: bookingStats,
            clients: clientStats,
            agents: agentStats,
            locations: locationStats
        });

    } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
}
