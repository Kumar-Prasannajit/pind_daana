"use client";

import React, { useState, useEffect } from "react";
import { Loader2, ArrowRight, Sparkles, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

interface PujaService {
    _id: string;
    name: string;
    significance: string;
}

export default function SpecialPujasContent({ basePath }: { basePath?: string }) {
    const router = useRouter();
    const [services, setServices] = useState<PujaService[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch("/api/type-pujas");
                if (res.ok) {
                    const data = await res.json();
                    setServices(data);
                }
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleServiceClick = (service: PujaService) => {
        const path = basePath || "/pujas";
        router.push(`${path}?serviceId=${service._id}&serviceName=${encodeURIComponent(service.name)}&serviceDesc=${encodeURIComponent(service.significance)}`);
    };

    const filteredServices = services.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F5F6F8]">
            {/* Hero Section */}
            <div className="bg-[#FDFAF5] relative pt-24 pb-16 overflow-hidden border-b border-orange-100/50">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-50/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center justify-center gap-2 bg-orange-50 text-[#D35400] px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border border-orange-100 mb-6">
                        <Sparkles size={16} />
                        <span>Sacred Rituals</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2C0E0F] mb-6 tracking-tight">
                        Puja for Special Occasion
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                        Discover authentic Vedic rituals tailored for every milestone. Select a service to explore available temples and packages.
                    </p>
                </div>
            </div>

            {/* Sticky Filter Bar */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Results Count */}
                        <div className="flex w-full md:w-auto items-center justify-center md:justify-start gap-2 bg-orange-50 text-[#D35400] px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-sm border border-orange-100 order-2 md:order-1">
                            <span className="w-2 h-2 rounded-full bg-[#D35400] animate-pulse"></span>
                            {filteredServices.length} {filteredServices.length === 1 ? "Service" : "Services"} Available
                        </div>

                        {/* Dropdown Filter */}
                        <div className="relative w-full md:w-[240px] order-1 md:order-2 group">
                            <select
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:border-[#F1C40F] focus:border-[#D35400] focus:ring-4 focus:ring-orange-50 transition-all outline-none cursor-pointer appearance-none shadow-sm"
                            >
                                <option value="">All Services</option>
                                {services.map(s => (
                                    <option key={s._id} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#D35400] transition-colors pointer-events-none" size={14} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <div className="container mx-auto px-4 py-16">
                {loading ? (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-[#D35400]" size={40} />
                        <p className="text-gray-500 font-medium animate-pulse">Loading Sacred Services...</p>
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 mt-4 max-w-3xl mx-auto">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter className="text-[#D35400]" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {searchQuery ? `No results for "${searchQuery}"` : "No services available yet"}
                        </h3>
                        <p className="text-gray-500">
                            {searchQuery ? (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="text-[#D35400] font-semibold hover:underline"
                                >
                                    Show all services
                                </button>
                            ) : "Please check back later for new offerings."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
                        {filteredServices.map((service, index) => (
                            <div
                                key={service._id}
                                onClick={() => handleServiceClick(service)}
                                className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-gray-100 cursor-pointer flex flex-col h-full relative overflow-hidden"
                            >
                                {/* Decorative Gradient Orb */}
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-orange-100 to-yellow-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

                                {/* Icon / Number */}
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 flex items-center justify-center mb-6 text-[#D35400] font-bold text-xl shadow-inner border border-orange-100/50 group-hover:scale-110 transition-transform duration-500">
                                    {index + 1}
                                </div>

                                <div className="flex-1 relative z-10">
                                    <h3 className="font-serif font-bold text-2xl text-gray-900 group-hover:text-[#D35400] transition-colors mb-4 leading-tight">
                                        {service.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-4">
                                        {service.significance}
                                    </p>
                                </div>

                                <div className="pt-8 mt-auto flex items-center justify-between relative z-10">
                                    <span className="text-sm font-bold text-[#D35400] group-hover:underline underline-offset-4 pointer-events-none">
                                        View Temples
                                    </span>
                                    <div className="w-10 h-10 rounded-full bg-orange-50 text-[#D35400] flex items-center justify-center group-hover:bg-[#D35400] group-hover:text-white transition-all duration-300 transform group-hover:rotate-[-45deg] shadow-sm">
                                        <ArrowRight size={18} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
