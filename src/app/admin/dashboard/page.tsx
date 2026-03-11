"use client";

import { Users, MapPin, UserCheck, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import NewBookingsTable from "@/components/admin/NewBookingsTable";

interface StatsData {
    total: number;
    growth: number;
}

interface DashboardStats {
    bookings: StatsData;
    clients: StatsData;
    agents: StatsData;
    locations: StatsData;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/dashboard/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const renderGrowth = (growth: number) => {
        const isPositive = growth >= 0;
        return (
            <div className={`mt-4 flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <span className="font-medium">{isPositive ? '+' : ''}{growth}%</span>
                <span className="text-gray-400 ml-1">from last month</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="w-full animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-36">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
                                <div className="w-16 h-4 bg-gray-200 rounded"></div>
                            </div>
                            <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="w-12 h-8 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 h-96 bg-gray-200 rounded-xl w-full"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-50 rounded-lg text-manima-red">
                        <Calendar size={24} />
                    </div>
                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total</span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">Bookings</h3>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats?.bookings.total || 0}</p>
                {stats && renderGrowth(stats.bookings.growth)}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <Users size={24} />
                    </div>
                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Active</span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">Clients</h3>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats?.clients.total || 0}</p>
                {stats && renderGrowth(stats.clients.growth)}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
                        <UserCheck size={24} />
                    </div>
                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Active</span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">Agents</h3>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats?.agents.total || 0}</p>
                {stats && renderGrowth(stats.agents.growth)}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                        <MapPin size={24} />
                    </div>
                    <span className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total</span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">Locations</h3>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats?.locations.total || 0}</p>
                {stats && renderGrowth(stats.locations.growth)}
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-6">
                <NewBookingsTable />
            </div>
        </div>
    );
}

