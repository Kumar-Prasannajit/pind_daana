
"use client";

import { useEffect, useState } from "react";
import {
    User, Mail, Phone, MapPin, Loader2, Calendar,
    Clock, LogOut, LayoutDashboard, Settings,
    HelpCircle, Bell, ChevronDown, ShieldCheck, Search, Menu, X
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import ProfilePage from "./profile/page";
import PujaModal from "@/components/PujaModal";

const ClientBookingsList = dynamic(() => import("@/components/client/ClientBookingsList"), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col gap-6 w-full animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {[1, 2].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>)}
            </div>
        </div>
    )
});

interface ClientProfile {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
}

export default function ClientDashboard() {
    const router = useRouter();
    const pathname = usePathname();
    const [client, setClient] = useState<ClientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showPujaModal, setShowPujaModal] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/client/me");
                if (res.status === 401) {
                    router.push("/client/login");
                    return;
                }
                const data = await res.json();
                setClient(data);
            } catch (error) {
                console.error("Error loading profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch("/api/client/logout", { method: "POST" });
            window.dispatchEvent(new Event("auth-change"));
            window.location.href = "/";
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-[#F5F6F8] font-sans">
                {/* Skeleton Sidebar - Desktop Only */}
                <aside className="hidden md:flex flex-col w-72 bg-[#2C0E0F] shrink-0 border-r border-white/5 animate-pulse">
                    <div className="h-24 px-8 flex items-center border-b border-white/10">
                        <div className="w-10 h-10 rounded-full bg-white/10"></div>
                        <div className="h-6 w-24 bg-white/10 rounded ml-3"></div>
                    </div>
                    <div className="flex-1 p-4 space-y-4 mt-4">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 w-full bg-white/5 rounded-xl"></div>)}
                    </div>
                </aside>
                {/* Skeleton Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="h-16 md:h-24 bg-white border-b border-gray-100 flex items-center px-4 md:px-8 shrink-0 animate-pulse">
                        <div className="w-32 h-6 bg-gray-200 rounded"></div>
                    </header>
                    <main className="flex-1 p-4 md:p-8">
                        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                            <div className="h-64 md:h-80 w-full bg-gray-200 rounded-3xl"></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!client) return null;

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "bookings", label: "My Bookings", icon: Calendar },
        { id: "history", label: "History", icon: Clock },
        { id: "profile", label: "My Profile", icon: User },
        { id: "support", label: "Support", icon: HelpCircle },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">

                        {/* 1. Welcome / Hero Section */}
                        <div className="relative overflow-hidden rounded-3xl bg-[#2C0E0F] text-white shadow-xl">
                            {/* Abstract Background Pattern */}
                            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-[#DAA520] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-[#DAA520] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
                            <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-5"></div>

                            <div className="relative z-10 px-8 py-10 md:px-12 md:py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                                <div className="space-y-4 max-w-xl">
                                    <span className="inline-block px-3 py-1 rounded-full bg-[#DAA520]/20 text-[#DAA520] text-xs font-bold uppercase tracking-widest border border-[#DAA520]/20">
                                        Verified Member
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
                                        Namaste, <span className="text-[#DAA520]">{(client.name || "User").split(' ')[0]}</span>
                                    </h2>
                                    <p className="text-white/70 text-lg leading-relaxed">
                                        Your spiritual journey continues here. Book a ritual for your ancestors or manage your ongoing requests.
                                    </p>
                                    <div className="pt-4 flex flex-wrap gap-4">
                                        {/* <button
                                            onClick={() => router.push('/client/dashboard/book')}
                                            className="px-8 py-3.5 bg-[#DAA520] text-[#2C0E0F] font-bold rounded-xl hover:bg-[#F1C40F] transition-all shadow-[0_0_20px_rgba(218,165,32,0.3)] hover:shadow-[0_0_30px_rgba(218,165,32,0.5)] active:scale-95 flex items-center gap-2"
                                        >
                                            <Calendar size={20} />
                                            Book New Ritual
                                        </button> */}
                                        <button
                                            onClick={() => router.push('/client/dashboard/bookpuja')}
                                            className="px-8 py-3.5 bg-[#2C0E0F] text-[#DAA520] border border-[#DAA520] font-bold rounded-xl hover:bg-[#DAA520] hover:text-[#2C0E0F] transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                        >
                                            <Search size={20} />
                                            Book Ritual Puja
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('bookings')}
                                            className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/10 backdrop-blur-sm"
                                        >
                                            View My Bookings
                                        </button>
                                    </div>
                                </div>

                                {/* Decorative Icon/Image */}
                                <div className="hidden md:block relative">
                                    <div className="w-32 h-32 rounded-full border-4 border-[#DAA520]/30 flex items-center justify-center bg-[#2C0E0F] shadow-2xl relative z-10">
                                        <Image src="/assets/logo.png" alt="Logo" width={64} height={64} className="opacity-80 drop-shadow-lg" unoptimized />
                                    </div>
                                    <div className="absolute inset-0 border border-[#DAA520]/20 rounded-full scale-125 animate-pulse-slow"></div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Key Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: "Total Bookings", value: "0", icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
                                { label: "Pending Actions", value: "0", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
                                { label: "Completed Rituals", value: "0", icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10" },
                            ].map((stat, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-[#DAA520]/30 transition-colors group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                            <stat.icon size={24} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md uppercase tracking-wider">
                                            Lifetime
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                                        <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 3. Profile & Support Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Profile Card */}
                            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                    <h3 className="font-serif font-bold text-lg text-[#2C0E0F] flex items-center gap-2">
                                        <User className="text-[#DAA520]" size={20} />
                                        Personal Profile
                                    </h3>
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className="text-xs font-bold text-[#DAA520] hover:text-[#B8860B] uppercase tracking-wider transition-colors"
                                    >
                                        Edit Details
                                    </button>
                                </div>
                                <div className="p-8 flex-1">
                                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full bg-[#2C0E0F] flex items-center justify-center text-3xl font-serif text-[#DAA520] font-bold ring-4 ring-gray-50 shadow-lg">
                                                {(client.name || "U").charAt(0).toUpperCase()}
                                            </div>
                                            <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 w-full">
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Full Name</p>
                                                <p className="font-semibold text-gray-900 text-lg">{client.name}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Email Address</p>
                                                <p className="font-semibold text-gray-900 text-lg break-all">{client.email}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Phone</p>
                                                <p className="font-semibold text-gray-900 text-lg">{client.phone}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Location</p>
                                                <p className="font-semibold text-gray-900 text-lg max-w-xs">{client.address || "Not Provided"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Need Help Card */}
                            <div className="bg-[#FDFAF0] rounded-3xl p-8 border border-[#DAA520]/20 flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-20"></div>
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#DAA520] shadow-md relative z-10">
                                    <Phone size={28} />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="font-serif font-bold text-xl text-[#2C0E0F] mb-2">Need Assistance?</h3>
                                    <p className="text-[#2C0E0F]/70 text-sm mb-6 max-w-xs mx-auto">
                                        Our support team is available 24/7 to help you with your booking or any questions.
                                    </p>
                                    <button
                                        onClick={() => setShowPujaModal(true)}
                                        className="w-full py-3 bg-white border border-[#DAA520]/30 text-[#2C0E0F] font-bold rounded-xl hover:bg-[#DAA520] hover:text-white transition-all shadow-sm"
                                    >
                                        Contact Support
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                );
            case "bookings":
                return (
                    <div className="w-full animate-in fade-in zoom-in-95 duration-500">
                        <ClientBookingsList />
                    </div>
                );
            case "history":
                return (
                    <div className="w-full animate-in fade-in zoom-in-95 duration-500">
                        <ClientBookingsList />
                    </div>
                );
            case "profile":
                return <ProfilePage />;
            default:
                return <div className="p-8 text-center text-gray-400">Section under construction</div>;
        }
    };

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
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#2C0E0F] text-white flex flex-col transition-transform duration-300 shadow-2xl md:static md:translate-x-0 md:flex md:shadow-xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

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
                        <Image
                            src="/assets/logo.png"
                            alt="Manima"
                            width={40}
                            height={40}
                            className="w-10 h-10 object-contain"
                            unoptimized
                        />
                        <span className="font-serif text-2xl font-bold text-[#DAA520] tracking-widest uppercase">
                            Manima
                        </span>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Menu</p>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group text-left ${activeTab === item.id
                                ? "bg-[#DAA520] text-[#2C0E0F] shadow-lg font-semibold"
                                : "text-gray-300 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <item.icon size={20} className={activeTab === item.id ? "text-[#2C0E0F]" : "text-[#DAA520]"} />
                            <span className="text-sm">{item.label}</span>
                            {activeTab === item.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2C0E0F]"></span>}
                        </button>
                    ))}

                    <div className="pt-4 mt-4 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group text-left text-gray-300 hover:bg-red-500/10 hover:text-red-500"
                        >
                            <LogOut size={20} className="text-gray-400 group-hover:text-red-500" />
                            <span className="text-sm font-medium">Log Out</span>
                        </button>
                    </div>
                </nav>

                {/* Sidebar Footer / User Profile */}
                <div className="p-4 border-t border-white/10 bg-[#230b0c] flex-shrink-0">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-[#DAA520] flex items-center justify-center text-[#2C0E0F] font-bold font-serif">
                            {(client.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{client.name}</p>
                            <p className="text-xs text-gray-400 truncate">{client.email}</p>
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
                            <h1 className="text-xl md:text-2xl font-serif font-bold text-[#2C0E0F]">
                                {navItems.find(i => i.id === activeTab)?.label || "Dashboard"}
                            </h1>
                            <p className="text-xs md:text-sm text-gray-500">Welcome back, {(client.name || "User").split(' ')[0]}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-gray-400 hover:text-[#DAA520] transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-gray-700">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>

            <PujaModal
                isOpen={showPujaModal}
                onClose={() => setShowPujaModal(false)}
            />
        </div >
    );
}
