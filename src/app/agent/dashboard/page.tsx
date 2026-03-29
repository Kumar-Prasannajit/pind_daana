
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard, Calendar, User,
    LogOut, Menu, X, Bell, ShieldCheck, MapPin, Loader2,
    CheckCircle2, Clock, XCircle, AlertCircle, Phone, Mail, BookOpen
} from "lucide-react";

interface AgentProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface AssignedBooking {
    _id: string;
    client?: { name: string; email: string; phone: string };
    service?: { name: string };
    puja?: { name: string };
    location?: { name: string };
    priceCategory: string;
    price: number;
    status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
    paymentStatus: "Pending" | "Completed";
    isPaymentVerified: boolean;
    bookingDate: string;
    createdAt: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    Pending: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-700", icon: <Clock size={12} /> },
    Confirmed: { label: "Confirmed", bg: "bg-blue-100", text: "text-blue-700", icon: <AlertCircle size={12} /> },
    Completed: { label: "Completed", bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle2 size={12} /> },
    Cancelled: { label: "Cancelled", bg: "bg-red-100", text: "text-red-600", icon: <XCircle size={12} /> },
};

export default function AgentDashboard() {
    const router = useRouter();
    const [agent, setAgent] = useState<AgentProfile | null>(null);
    const [bookings, setBookings] = useState<AssignedBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState<"dashboard" | "assignments" | "profile">("dashboard");

    useEffect(() => {
        const fetchAgent = async () => {
            try {
                const res = await fetch("/api/agent/me");
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
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

    useEffect(() => {
        if (!agent) return;
        const fetchBookings = async () => {
            setBookingsLoading(true);
            try {
                const res = await fetch("/api/agent/bookings");
                const data = await res.json();
                if (res.ok) setBookings(data.bookings || []);
            } catch (err) {
                console.error("Failed to fetch bookings", err);
            } finally {
                setBookingsLoading(false);
            }
        };
        fetchBookings();
    }, [agent]);

    const handleLogout = async () => {
        try {
            await fetch("/api/agent/logout", { method: "POST" });
        } catch (_) {
            // Even if the request fails, still redirect
        }
        window.location.href = "/agent/login";
    };

    const pendingCount = bookings.filter(b => b.status === "Pending").length;
    const completedCount = bookings.filter(b => b.status === "Completed").length;

    if (loading) {
        return (
            <div className="flex h-screen bg-[#F5F6F8] font-sans">
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
        { label: "Dashboard", icon: LayoutDashboard, view: "dashboard" as const },
        { label: "My Assignments", icon: Calendar, view: "assignments" as const },
        { label: "Profile", icon: User, view: "profile" as const },
    ];

    return (
        <div className="flex h-screen bg-[#F5F6F8] font-sans">
            {/* MOBILE OVERLAY */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1a1a1a] text-white flex flex-col transition-transform duration-300 shadow-2xl md:static md:translate-x-0 md:flex md:shadow-xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Mobile Close */}
                <button className="absolute top-4 right-4 md:hidden text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors" onClick={() => setIsSidebarOpen(false)}>
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
                            onClick={() => { setActiveView(item.view); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group text-left ${activeView === item.view
                                ? "bg-[#DAA520] text-[#1a1a1a] shadow-lg font-semibold"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <item.icon size={20} className={activeView === item.view ? "text-[#1a1a1a]" : "text-[#DAA520]"} />
                            <span className="text-sm">{item.label}</span>
                            {activeView === item.view && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1a1a1a]"></span>}
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

                {/* Sidebar Footer */}
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

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top Header */}
                <header className="h-16 md:h-24 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shadow-sm z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-500 hover:text-[#DAA520]" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-serif font-bold text-[#1a1a1a]">
                                {activeView === "dashboard" ? "Dashboard" : activeView === "assignments" ? "My Assignments" : "Profile"}
                            </h1>
                            <p className="text-xs md:text-sm text-gray-500">Welcome back, {agent?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-gray-400 hover:text-[#DAA520] transition-colors">
                            <Bell size={20} />
                            {pendingCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            )}
                        </button>
                        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                        <div className="hidden md:flex items-center gap-3">
                            <p className="text-sm font-semibold text-gray-700">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* ── DASHBOARD HOME VIEW ── */}
                        {activeView === "dashboard" && (
                        <>
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">New Assignments</p>
                                    <h3 className="text-3xl font-bold text-gray-800">{bookingsLoading ? "—" : pendingCount}</h3>
                                    <p className="text-xs text-yellow-600 mt-1 font-medium">Awaiting confirmation</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Calendar size={24} />
                                </div>
                            </div>

                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
                                    <h3 className="text-3xl font-bold text-gray-800">{bookingsLoading ? "—" : completedCount}</h3>
                                    <p className="text-xs text-gray-400 mt-1">Lifetime rituals</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                                    <ShieldCheck size={24} />
                                </div>
                            </div>

                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Total Assigned</p>
                                    <h3 className="text-3xl font-bold text-gray-800">{bookingsLoading ? "—" : bookings.length}</h3>
                                    <p className="text-xs text-gray-400 mt-1">All time bookings</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                    <MapPin size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Quick-access card to Assignments */}
                        <div
                            onClick={() => setActiveView("assignments")}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-[#DAA520]/30 transition-all group"
                        >
                            <div>
                                <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">My Assignments</h2>
                                <p className="text-sm text-gray-500">
                                    {bookingsLoading ? "Loading bookings…" : bookings.length === 0
                                        ? "No active assignments right now."
                                        : `You have ${bookings.length} booking${bookings.length !== 1 ? 's' : ''} assigned to you.`
                                    }
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-[#DAA520]/10 text-[#DAA520] flex items-center justify-center group-hover:bg-[#DAA520] group-hover:text-white transition-colors flex-shrink-0">
                                <Calendar size={22} />
                            </div>
                        </div>
                        </>
                        )}

                        {/* ── MY ASSIGNMENTS VIEW ── */}
                        {activeView === "assignments" && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-[#1a1a1a]">My Assignments</h2>
                                {!bookingsLoading && bookings.length > 0 && (
                                    <span className="text-xs bg-[#DAA520]/10 text-[#DAA520] font-semibold px-3 py-1 rounded-full">
                                        {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
                                    </span>
                                )}
                            </div>

                            {bookingsLoading ? (
                                <div className="p-8 space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="animate-pulse h-24 bg-gray-100 rounded-xl"></div>
                                    ))}
                                </div>
                            ) : bookings.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-400 mb-4">
                                        <Calendar size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">No Active Assignments</h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        You have no pending rituals at the moment. You will receive a notification when an admin assigns a new booking to you.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {bookings.map((booking) => {
                                        const st = statusConfig[booking.status] || statusConfig.Pending;
                                        return (
                                            <div key={booking._id} className="p-5 md:p-6 hover:bg-gray-50/50 transition-colors">
                                                <div className="flex flex-col md:flex-row md:items-start gap-4">

                                                    {/* Left: Client Avatar + Info */}
                                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                                        <div className="w-11 h-11 rounded-full bg-[#DAA520]/10 text-[#DAA520] flex items-center justify-center font-bold font-serif text-lg flex-shrink-0">
                                                            {booking.client?.name?.charAt(0).toUpperCase() ?? "?"}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                <p className="font-semibold text-gray-800 text-sm">
                                                                    {booking.client?.name ?? "Unknown Client"}
                                                                </p>
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>
                                                                    {st.icon} {st.label}
                                                                </span>
                                                                {booking.isPaymentVerified ? (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                                        <CheckCircle2 size={10} /> Paid
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                                                                        <Clock size={10} /> Unpaid
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Service / Puja */}
                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                                                                {booking.service?.name && (
                                                                    <span className="flex items-center gap-1">
                                                                        <BookOpen size={12} />
                                                                        {booking.service.name}
                                                                        {booking.puja?.name && ` — ${booking.puja.name}`}
                                                                    </span>
                                                                )}
                                                                {booking.location?.name && (
                                                                    <span className="flex items-center gap-1">
                                                                        <MapPin size={12} />
                                                                        {booking.location.name}
                                                                    </span>
                                                                )}
                                                                {booking.priceCategory && (
                                                                    <span className="text-gray-400">{booking.priceCategory} · ₹{booking.price.toLocaleString('en-IN')}</span>
                                                                )}
                                                            </div>

                                                            {/* Contact */}
                                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
                                                                {booking.client?.phone && (
                                                                    <a href={`tel:${booking.client.phone}`} className="flex items-center gap-1 hover:text-[#DAA520] transition-colors">
                                                                        <Phone size={11} /> {booking.client.phone}
                                                                    </a>
                                                                )}
                                                                {booking.client?.email && (
                                                                    <a href={`mailto:${booking.client.email}`} className="flex items-center gap-1 hover:text-[#DAA520] transition-colors">
                                                                        <Mail size={11} /> {booking.client.email}
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right: Date */}
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-xs font-semibold text-gray-700">
                                                            {new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-0.5">Booking Date</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}
