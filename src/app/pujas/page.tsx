"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Search, MapPin, Filter, X, Check, ArrowRight, Loader2, ShieldCheck, IndianRupee, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Interface matches the API response structure
interface Package {
    name: string;
    features: string[];
    priceAmount: number;
}

interface Puja {
    _id: string;
    imageUrl: string;
    name: string;
    location: string;
    templeType: string;
    packages: Package[];
}

function PujaServicesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [pujas, setPujas] = useState<Puja[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPuja, setSelectedPuja] = useState<Puja | null>(null);

    // Filters
    const [locationFilter, setLocationFilter] = useState("");
    const [templeTypeFilter, setTempleTypeFilter] = useState("");

    // Modal State
    const [selectedPackage, setSelectedPackage] = useState<string>("");

    useEffect(() => {
        fetchPujas();

        // Handle URL params
        const filterParam = searchParams.get('filter');
        const typeParam = searchParams.get('type');

        if (filterParam) {
            if (filterParam !== 'Lord Shiva') setLocationFilter(filterParam);
        }
        if (typeParam) {
            setTempleTypeFilter(typeParam);
        }
    }, [searchParams]);

    const fetchPujas = async () => {
        try {
            const res = await fetch("/api/puja");
            if (!res.ok) throw new Error("Failed to fetch pujas");
            const data = await res.json();
            if (data.success) {
                setPujas(data.data);
            }
        } catch (error) {
            console.error("Error fetching pujas:", error);
        } finally {
            setLoading(false);
        }
    };

    // Derived Filters
    const uniqueLocations = Array.from(new Set(pujas.map((p) => p.location)));
    const uniqueTempleTypes = Array.from(new Set(pujas.map((p) => p.templeType)));

    // Filtered Data
    const filteredPujas = pujas.filter((p) => {
        const matchesLocation = locationFilter ? p.location === locationFilter : true;
        const matchesType = templeTypeFilter ? p.templeType === templeTypeFilter : true;
        return matchesLocation && matchesType;
    });

    // Helper to get package details
    const getPackage = (puja: Puja, type: string) => {
        return puja.packages.find(p => p.name === type) || puja.packages[0];
    };

    const handleBookNow = (puja: Puja) => {
        const pkg = getPackage(puja, selectedPackage);
        router.push(`/checkout?pujaId=${puja._id}&packageName=${pkg.name}`);
    };

    // Reset selected package when modal opens
    useEffect(() => {
        if (selectedPuja && selectedPuja.packages.length > 0) {
            // Default to recommended or first package
            const recommended = selectedPuja.packages.find(p => p.name === "Premium" || p.name === "Recommended");
            setSelectedPackage(recommended ? recommended.name : selectedPuja.packages[0].name);
        }
    }, [selectedPuja]);


    return (
        <div className="min-h-screen bg-[#FDFAF5]">
            {/* Enhanced Header Section with Hero-like feel */}
            <div className="bg-[#FDFAF5] relative pt-12 pb-12 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-50/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

                <div className="container mx-auto px-4 relative z-10 pt-12">


                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2C0E0F] mb-4">
                        Divine Rituals & Pujas
                    </h1>
                    <p className="text-gray-600 max-w-2xl text-lg leading-relaxed">
                        Book authentic Vedic pujas performed by experienced Pandits at sacred temples.
                        Choose your preferred location and package for a blessed experience.
                    </p>
                </div>
            </div>

            {/* Filters Bar - Floating/Sticky */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Results Count Badge */}
                        <div className="flex w-full md:w-auto items-center justify-center md:justify-start gap-2 bg-orange-50 text-[#D35400] px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-sm border border-orange-100 order-2 md:order-1">
                            <span className="w-2 h-2 rounded-full bg-[#D35400] animate-pulse"></span>
                            Showing {filteredPujas.length} {filteredPujas.length === 1 ? 'Temple' : 'Temples'}
                        </div>

                        {/* Filter Controls */}
                        <div className="grid grid-cols-2 md:flex gap-3 w-full md:w-auto pb-1 md:pb-0 order-1 md:order-2">
                            {/* Location Filter */}
                            <div className="relative w-full md:w-[180px] group">
                                <select
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-gray-100 rounded-xl text-xs md:text-sm font-bold text-gray-700 hover:border-[#F1C40F] focus:border-[#D35400] focus:ring-4 focus:ring-orange-50 transition-all outline-none cursor-pointer appearance-none shadow-sm"
                                >
                                    <option value="">All Locations</option>
                                    {uniqueLocations.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#D35400] transition-colors" size={14} />
                            </div>

                            {/* Temple Type Filter */}
                            <div className="relative w-full md:w-[180px] group">
                                <select
                                    value={templeTypeFilter}
                                    onChange={(e) => setTempleTypeFilter(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-gray-100 rounded-xl text-xs md:text-sm font-bold text-gray-700 hover:border-[#F1C40F] focus:border-[#D35400] focus:ring-4 focus:ring-orange-50 transition-all outline-none cursor-pointer appearance-none shadow-sm"
                                >
                                    <option value="">All Temples</option>
                                    {uniqueTempleTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#D35400] transition-colors" size={14} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="container mx-auto px-4 py-12">
                {loading ? (
                    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-[#D35400]" size={40} />
                        <p className="text-gray-500 font-medium animate-pulse">Loading Sacred Rituals...</p>
                    </div>
                ) : filteredPujas.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 mt-4">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-[#D35400]" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No rituals found</h3>
                        <p className="text-gray-500 mb-6">We couldn't find any pujas matching your filters.</p>
                        <button
                            onClick={() => { setLocationFilter(""); setTempleTypeFilter(""); }}
                            className="text-[#D35400] font-bold hover:underline"
                        >
                            Reset all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredPujas.map((puja) => {
                            const minPrice = Math.min(...puja.packages.map(p => p.priceAmount));

                            return (
                                <div
                                    key={puja._id}
                                    onClick={() => setSelectedPuja(puja)}
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer flex flex-col h-full"
                                >
                                    <div className="relative h-60 overflow-hidden bg-gray-100">
                                        <img
                                            src={puja.imageUrl}
                                            alt={puja.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />


                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <h3 className="font-serif font-bold text-xl text-gray-900 group-hover:text-[#D35400] transition-colors mb-3 leading-tight">
                                                {puja.name}
                                            </h3>
                                            <div className="flex items-center text-gray-500 text-sm mb-4">
                                                <MapPin size={16} className="mr-1.5 text-gray-400 shrink-0" />
                                                <span className="line-clamp-1">{puja.location}</span>
                                            </div>
                                        </div>

                                        <div className="pt-5 border-t border-gray-50 flex items-center justify-between mt-auto">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Starting at</p>
                                                <p className="font-bold text-xl text-[#2C0E0F]">₹{minPrice.toLocaleString('en-IN')}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-orange-50 text-[#D35400] flex items-center justify-center group-hover:bg-[#D35400] group-hover:text-white transition-all transform group-hover:rotate-[-45deg]">
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Puja Details Modal - Enhanced */}
            {selectedPuja && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 relative border border-white/20">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedPuja(null)}
                            className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white backdrop-blur-md p-2.5 rounded-full transition-all hover:rotate-90"
                        >
                            <X size={20} />
                        </button>

                        {/* Left: Image (Top on Mobile) */}
                        <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-200 relative group shrink-0">
                            <img
                                src={selectedPuja.imageUrl}
                                alt={selectedPuja.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 text-white">
                                <span className="bg-[#D35400] px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-2 md:mb-3 inline-block shadow-lg">
                                    {selectedPuja.templeType}
                                </span>
                                <h2 className="text-2xl md:text-4xl font-serif font-bold mb-1 md:mb-2 leading-tight shadow-black drop-shadow-lg">{selectedPuja.name}</h2>
                                <p className="flex items-center text-white/90 text-sm font-medium">
                                    <MapPin size={16} className="mr-2 text-[#F1C40F]" />
                                    {selectedPuja.location}
                                </p>
                            </div>
                        </div>

                        {/* Right: Details & Packages (Bottom on Mobile) */}
                        <div className="w-full md:w-1/2 flex flex-col h-full bg-white relative overflow-hidden">
                            {/* Scrollable Content */}
                            <div className="p-6 md:p-8 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                <div className="mb-6 md:mb-8">
                                    <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 md:mb-4">Choose Your Package</h3>

                                    <div className="flex gap-2 md:gap-3 bg-gray-50 p-1 md:p-1.5 rounded-xl border border-gray-100 overflow-x-auto">
                                        {selectedPuja.packages.map((pkg) => (
                                            <button
                                                key={pkg.name}
                                                onClick={() => setSelectedPackage(pkg.name)}
                                                className={`flex-1 min-w-[100px] py-2.5 md:py-3 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 whitespace-nowrap ${selectedPackage === pkg.name
                                                    ? 'bg-white text-[#D35400] shadow-md ring-1 ring-[#D35400]/10 transform scale-[1.02]'
                                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                                                    }`}
                                            >
                                                {pkg.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {(() => {
                                        const activePkg = getPackage(selectedPuja, selectedPackage);
                                        return (
                                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="flex items-baseline gap-2 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-gray-100">
                                                    <span className="text-3xl md:text-5xl font-bold text-[#2C0E0F] tracking-tight">
                                                        ₹{activePkg.priceAmount.toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="text-gray-400 font-medium text-sm md:text-lg">/ puja</span>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-xs md:text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-3 md:mb-4">
                                                        <ShieldCheck size={16} className="text-[#D35400]" />
                                                        What's Included
                                                    </h4>
                                                    <ul className="space-y-3 md:space-y-4">
                                                        {activePkg.features.map((feature, i) => (
                                                            <li key={i} className="flex items-start gap-3 group">
                                                                <div className="min-w-[18px] h-[18px] md:min-w-[20px] md:h-[20px] rounded-full bg-green-50 flex items-center justify-center mt-0.5 group-hover:bg-green-100 transition-colors">
                                                                    <Check size={10} className="text-green-600 md:hidden" />
                                                                    <Check size={12} className="text-green-600 hidden md:block" />
                                                                </div>
                                                                <span className="text-gray-600 text-xs md:text-[15px] leading-relaxed group-hover:text-gray-900 transition-colors">{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Footer / CTA */}
                            <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm z-10">
                                <button
                                    onClick={() => handleBookNow(selectedPuja)}
                                    className="w-full bg-[#D35400] hover:bg-[#b04600] text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98] group"
                                >
                                    <span>Book This Ritual</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform md:hidden" />
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform hidden md:block" />
                                </button>
                                <div className="flex items-center justify-center gap-2 mt-3 md:mt-4 text-[10px] md:text-xs text-center text-gray-400">
                                    <ShieldCheck size={12} />
                                    <span>Secure Payment • 100% Verified Pandits</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PujaServicePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#FDFAF5]">
                <Loader2 className="animate-spin text-[#D35400] w-12 h-12" />
            </div>
        }>
            <PujaServicesContent />
        </Suspense>
    );
}
