
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard, Calendar, User,
    LogOut, Menu, X, Bell, ShieldCheck, MapPin, Loader2
} from "lucide-react";
import Image from "next/image";

interface AgentProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export default function AgentDashboard() {
    const router = useRouter();
    const [agent, setAgent] = useState<AgentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchAgent = async () => {
            try {
                const res = await fetch("/api/agent/me");
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error);
                }

                setAgent(data.agent);
            } catch (err: any) {
                console.error("Failed to fetch agent profile", err);
                window.location.href = "/agent/login";
            } finally {
                setLoading(false);
            }
        };

        fetchAgent();
    }, []);

    const handleLogout = async () => {
        // await fetch("/api/agent/logout", { method: "POST" });
        window.location.href = "/agent/login";
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-[#F5F6F8] font-sans">
                {/* Skeleton Sidebar - Desktop Only */}
                <aside className="hidden md:flex flex-col w-72 bg-[#1a1a1a] shrink-0 border-r border-white/10 animate-pulse">
                    <div className="h-24 px-8 flex items-center border-b border-white/10">
                        <div className="w-10 h-10 rounded-lg bg-white/10"></div>
                        <div className="h-6 w-24 bg-white/10 rounded ml-3"></div>
                    </div>
                    <div className="flex-1 p-4 space-y-4 mt-8">
                        <div className="w-16 h-3 bg-white/10 rounded ml-4 mb-2"></div>
                        {[1, 2, 3].map(i => <div key={i} className="h-12 w-full bg-white/5 rounded-xl"></div>)}
                    </div>
                </aside>
                {/* Skeleton Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-16 md:h-24 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0 animate-pulse">
                        <div className="w-32 h-6 bg-gray-200 rounded"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    </header>
                    <main className="flex-1 p-4 md:p-8">
                        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl"></div>)}
                            </div>
                            <div className="h-96 w-full bg-gray-200 rounded-2xl"></div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!agent) return null;

    const navItems = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/agent/dashboard", active: true },
        { label: "Assignments", icon: Calendar, href: "#assignments", active: false },
        { label: "Profile", icon: User, href: "#profile", active: false },
    ];

    return (
        <div className="flex h-screen bg-[#F5F6F8] font-sans">
            {/* MOBILE OVERLAY */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden glass-dark-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1a1a1a] text-white flex flex-col transition-transform duration-300 shadow-2xl md:static md:translate-x-0 md:flex md:shadow-xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Mobile Close Button */}
                <button
                    className="absolute top-4 right-4 md:hidden text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <X size={24} />
                </button>

                {/* Sidebar Header */}
                <div className="h-24 flex items-center px-8 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#DAA520] rounded-lg flex items-center justify-center text-[#1a1a1a]">
                            <ShieldCheck size={24} />
                        </div>
                        <span className="font-serif text-xl font-bold text-white tracking-widest uppercase">
                            Manima <span className="text-[#DAA520] text-xs block tracking-normal">Partner</span>
                        </span>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Workspace</p>
                    {navItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                // router.push(item.href);
                                setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group text-left ${item.active
                                ? "bg-[#DAA520] text-[#1a1a1a] shadow-lg font-semibold"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <item.icon size={20} className={item.active ? "text-[#1a1a1a]" : "text-[#DAA520]"} />
                            <span className="text-sm">{item.label}</span>
                            {item.active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1a1a1a]"></span>}
                        </button>
                    ))}

                    <div className="pt-4 mt-4 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group text-left text-gray-400 hover:bg-red-500/10 hover:text-red-500"
                        >
                            <LogOut size={20} className="text-gray-500 group-hover:text-red-500" />
                            <span className="text-sm font-medium">Log Out</span>
                        </button>
                    </div>
                </nav>

                {/* Sidebar Footer / User Profile */}
                <div className="p-4 border-t border-white/10 bg-[#141414] flex-shrink-0">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-[#DAA520] flex items-center justify-center text-[#1a1a1a] font-bold font-serif">
                            {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{agent.name}</p>
                            <p className="text-xs text-green-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top Header */}
                <header className="h-16 md:h-24 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shadow-sm z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden text-gray-500 hover:text-[#DAA520]"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-serif font-bold text-[#1a1a1a]">Dashboard</h1>
                            <p className="text-xs md:text-sm text-gray-500">Welcome back, {agent?.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-gray-400 hover:text-[#DAA520] transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                        <div className="flex items-center gap-3 hidden md:flex">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-700">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">New Assignments</p>
                                    <h3 className="text-3xl font-bold text-gray-800">0</h3>
                                    <p className="text-xs text-green-600 mt-1 font-medium">Ready to confirm</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Calendar size={24} />
                                </div>
                            </div>

                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
                                    <h3 className="text-3xl font-bold text-gray-800">12</h3>
                                    <p className="text-xs text-gray-400 mt-1">Lifetime rituals</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                                    <ShieldCheck size={24} />
                                </div>
                            </div>

                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Locations</p>
                                    <h3 className="text-3xl font-bold text-gray-800">1</h3>
                                    <p className="text-xs text-gray-400 mt-1">Assigned Zone</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                    <MapPin size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Recent Assignments Area */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-[#1a1a1a]">Recent Assignments</h2>
                                <button className="text-sm text-[#DAA520] font-semibold hover:underline">View All</button>
                            </div>
                            <div className="p-12 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-400 mb-4">
                                    <Calendar size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">No Active Assignments</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    You have no pending rituals at the moment. You will receive a notification when an admin assigns a new booking to you.
                                </p>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
