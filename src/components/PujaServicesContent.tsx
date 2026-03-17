"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Filter, X, Check, ArrowRight, Loader2, ShieldCheck, ArrowLeft, ChevronDown, Sparkles } from "lucide-react";
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
    services: {
        service: {
            _id: string;
            name: string;
            significance: string;
        };
        packages: Package[];
    }[];
}

interface PujaServicesProps {
    showHero?: boolean;
    showBackButton?: boolean;
    title?: string;
    className?: string;
}

export default function PujaServicesContent({
    showHero = true,
    showBackButton = false,
    title = "Divine Rituals & Pujas",
    className = "",
}: PujaServicesProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [pujas, setPujas] = useState<Puja[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPuja, setSelectedPuja] = useState<Puja | null>(null);

    // Filters
    const [locationFilter, setLocationFilter] = useState("");
    const [templeTypeFilter, setTempleTypeFilter] = useState("");
    const [serviceFilter, setServiceFilter] = useState("");

    // Independently fetched service info (for when no temples have this service)
    const [fetchedServiceInfo, setFetchedServiceInfo] = useState<{ _id: string; name: string; significance: string } | null>(null);

    // Read more state
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [isDescClamped, setIsDescClamped] = useState(false);
    const descRef = useRef<HTMLParagraphElement>(null);

    // Modal State
    const [selectedServiceId, setSelectedServiceId] = useState<string>("");
    const [selectedPackage, setSelectedPackage] = useState<string>("");

    useEffect(() => {
        fetchPujas();

        // Only checking params if they exist to avoid unnecessary re-renders or overrides
        const filterParam = searchParams?.get('filter');
        const typeParam = searchParams?.get('type');
        const serviceParam = searchParams?.get('serviceId');

        if (filterParam) {
            if (filterParam !== 'Lord Shiva') setLocationFilter(filterParam);
        }
        if (typeParam) {
            setTempleTypeFilter(typeParam);
        }
        if (serviceParam) {
            setServiceFilter(serviceParam);
        }
    }, [searchParams]);

    // Fetch service info independently when serviceFilter changes
    useEffect(() => {
        if (!serviceFilter) {
            setFetchedServiceInfo(null);
            return;
        }

        const serviceNameParam = searchParams?.get('serviceName');
        const serviceDescParam = searchParams?.get('serviceDesc');

        // Fast path: Use URL params if available instead of re-fetching
        if (serviceNameParam && serviceDescParam) {
            setFetchedServiceInfo({
                _id: serviceFilter,
                name: serviceNameParam,
                significance: serviceDescParam
            });
            return;
        }

        fetch("/api/type-pujas")
            .then(r => r.json())
            .then(data => {
                const services = data.data || data;
                const match = Array.isArray(services)
                    ? services.find((s: { _id: string; name: string; significance: string }) => s._id === serviceFilter)
                    : null;
                setFetchedServiceInfo(match || null);
            })
            .catch(() => setFetchedServiceInfo(null));
    }, [serviceFilter, searchParams]);

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
        const matchesService = serviceFilter 
            ? p.services?.some(s => {
                if (!s || !s.service) return false;
                // Safely handle if service is populated object or just string ID
                const sId = typeof s.service === 'object' ? s.service._id : s.service;
                return String(sId) === String(serviceFilter);
            }) 
            : true;
        return matchesLocation && matchesType && matchesService;
    });

    // Derive active service info from any puja that has the filtered service,
    // or fall back to independently fetched service info (for services with no temples yet)
    const activeServiceInfo = serviceFilter
        ? (pujas.flatMap(p => p.services).find(s => {
              if (!s || !s.service) return false;
              const sId = typeof s.service === 'object' ? s.service._id : s.service;
              return String(sId) === String(serviceFilter);
          })?.service || fetchedServiceInfo)
        : null;

    // Derived title/description for the hero
    const derivedTitle = activeServiceInfo?.name || title;
    const derivedDesc = activeServiceInfo?.significance || "Book authentic Vedic pujas performed by experienced Pandits at sacred temples. Choose your preferred location and package for a blessed experience.";

    // Check clamping with ResizeObserver — runs on every layout change / resize
    useEffect(() => {
        setShowFullDesc(false);
        setIsDescClamped(false);
    }, [derivedDesc]);

    useEffect(() => {
        const el = descRef.current;
        if (!el) return;

        const checkClamped = () => {
            // Only check when in collapsed mode so the scrollHeight isn't expanded
            if (!showFullDesc) {
                setIsDescClamped(el.scrollHeight > el.clientHeight + 2);
            }
        };

        const observer = new ResizeObserver(checkClamped);
        observer.observe(el);
        checkClamped(); // run immediately too

        return () => observer.disconnect();
    }, [derivedDesc, showFullDesc]);

    // Helper to get package details
    const getPackage = (puja: Puja, type: string) => {
        const activeService = puja.services?.find(s => {
            if (!s || !s.service) return false;
            const sId = typeof s.service === 'object' ? s.service._id : s.service;
            return String(sId) === String(selectedServiceId);
        }) || puja.services?.[0];
        const activePackages = activeService?.packages || [];
        return activePackages.find(p => p.name === type) || activePackages[0];
    };

    const handleBookNow = (puja: Puja) => {
        const pkg = getPackage(puja, selectedPackage);
        router.push(`/checkout?pujaId=${puja._id}&serviceId=${selectedServiceId}&packageName=${pkg?.name || ''}`);
    };

    // Reset selected service and package when modal opens
    useEffect(() => {
        if (selectedPuja && selectedPuja.services?.length > 0) {
            // Default to the filtered service if it exists in this temple, otherwise the first one
            const targetService = selectedPuja.services.find(s => {
                if (!s || !s.service) return false;
                const sId = typeof s.service === 'object' ? s.service._id : s.service;
                return String(sId) === String(serviceFilter);
            }) || selectedPuja.services[0];
            
            const targetServiceId = typeof targetService.service === 'object' ? targetService.service._id : targetService.service;
            setSelectedServiceId(targetServiceId);
            const sorted = [...(targetService.packages || [])].sort((a, b) => a.priceAmount - b.priceAmount);
            if (sorted.length > 0) {
                setSelectedPackage(sorted[0].name);
            }
        }
    }, [selectedPuja]);

    // Reset selected package when service changes
    useEffect(() => {
        if (selectedPuja && selectedServiceId) {
            const activeService = selectedPuja.services?.find(s => {
                if (!s || !s.service) return false;
                const sId = typeof s.service === 'object' ? s.service._id : s.service;
                return String(sId) === String(selectedServiceId);
            });
            const sorted = [...(activeService?.packages || [])].sort((a, b) => a.priceAmount - b.priceAmount);
            if (sorted.length > 0) {
                setSelectedPackage(sorted[0].name);
            }
        }
    }, [selectedServiceId, selectedPuja]);


    return (
        <div className={`min-h-screen bg-[#F5F6F8] ${className}`}>

            {showBackButton && (
                <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <h1 className="text-xl font-bold text-[#2C0E0F] font-serif">{title}</h1>
                    </div>
                </div>
            )}

            {showHero && (
                <div className="bg-[#FDFAF5] relative pt-12 pb-12 overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-50/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

                    <div className="container mx-auto px-4 relative z-10 pt-12">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2C0E0F] mb-4">
                            {derivedTitle}
                        </h1>
                        <div className="w-full text-lg leading-relaxed text-gray-600">
                            <p ref={descRef} className={!showFullDesc ? 'line-clamp-3' : ''}>
                                {derivedDesc}
                            </p>
                            {isDescClamped && !showFullDesc && (
                                <button
                                    onClick={() => setShowFullDesc(true)}
                                    className="mt-1 text-[#D35400] font-semibold hover:underline text-sm md:text-base"
                                >
                                    Read more
                                </button>
                            )}
                            {showFullDesc && (
                                <button
                                    onClick={() => setShowFullDesc(false)}
                                    className="mt-1 text-[#D35400] font-semibold hover:underline text-sm md:text-base"
                                >
                                    Read less
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Bar - Floating/Sticky */}
            <div className={`sticky ${showBackButton ? 'top-16' : 'top-0'} z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300`}>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px] animate-pulse">
                                <div className="h-60 bg-gray-200 w-full" />
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-auto" />
                                    <div className="pt-5 border-t border-gray-50 flex items-center justify-between mt-auto">
                                        <div className="flex flex-col gap-2 w-1/3">
                                            <div className="h-2 bg-gray-200 rounded w-full" />
                                            <div className="h-4 bg-gray-200 rounded w-full" />
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredPujas.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 mt-4">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-[#D35400]" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No rituals found</h3>
                        <p className="text-gray-500 mb-6">We couldn't find any pujas matching your filters.</p>
                        <button
                            onClick={() => { setLocationFilter(""); setTempleTypeFilter(""); setServiceFilter(""); }}
                            className="text-[#D35400] font-bold hover:underline"
                        >
                            Reset all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredPujas.map((puja, i) => {
                            const applicableService = serviceFilter
                                ? puja.services?.find(s => {
                                    if (!s || !s.service) return false;
                                    const sId = typeof s.service === 'object' ? s.service._id : s.service;
                                    return String(sId) === String(serviceFilter);
                                  })
                                : null;
                                
                            const applicablePackages = applicableService?.packages || puja.services?.flatMap(s => s.packages) || [];
                            const minPrice = applicablePackages.length > 0 ? Math.min(...applicablePackages.map(p => p.priceAmount)) : 0;

                            return (
                                <div
                                    key={puja._id || i}
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
                    <div className="bg-white w-full max-w-6xl h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 relative border border-white/20">
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
                                <div className="mb-4">
                                    <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 md:mb-4">Choose Service Type</h3>

                                    <div className="relative mb-6">
                                        <select
                                            value={selectedServiceId}
                                            onChange={(e) => setSelectedServiceId(e.target.value)}
                                            className="w-full appearance-none bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-10 py-3.5 md:py-4 text-sm font-bold text-gray-900 border-2 hover:border-orange-200 focus:border-[#D35400] focus:bg-white focus:ring-4 focus:ring-orange-50 transition-all outline-none cursor-pointer shadow-sm"
                                        >
                                            {selectedPuja.services?.map((svc) => {
                                                const sId = typeof svc.service === 'object' ? svc.service?._id : svc.service;
                                                const sName = typeof svc.service === 'object' ? svc.service?.name : "Unnamed Service";
                                                return (
                                                    <option key={String(sId)} value={String(sId)}>
                                                        {sName || "Unnamed Service"}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-[#D35400]">
                                            <ChevronDown size={20} />
                                        </div>
                                    </div>

                                    {selectedServiceId && (
                                        <div className="mt-8 mb-6">
                                            <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Choose Your Package</h3>
                                            {/* Package toggle buttons */}
                                            <div className="flex flex-wrap gap-3 mb-6">
                                                {selectedPuja.services?.find(s => {
                                                    if (!s || !s.service) return false;
                                                    const sId = typeof s.service === 'object' ? s.service._id : s.service;
                                                    return String(sId) === String(selectedServiceId);
                                                })?.packages.map((pkg) => (
                                                    <button
                                                        key={pkg.name}
                                                        onClick={() => setSelectedPackage(pkg.name)}
                                                        className={`relative px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${selectedPackage === pkg.name
                                                            ? 'bg-[#D35400] text-white shadow-md ring-2 ring-orange-200 ring-offset-1 transform scale-[1.02]'
                                                            : 'bg-white border-2 border-gray-100 text-gray-700 hover:border-orange-200 hover:bg-orange-50/50'
                                                            }`}
                                                    >
                                                        {(pkg.name === "Premium" || pkg.name === "Recommended") && (
                                                            <div className="absolute -top-[10px] -right-[10px] bg-[#DAA520] text-white w-5 h-5 rounded-full flex items-center justify-center shadow-sm z-10">
                                                                <Sparkles size={10} />
                                                            </div>
                                                        )}
                                                        {selectedPackage === pkg.name ? <Check size={16} /> : null}
                                                        {pkg.name}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Features of selected package shown below buttons */}
                                            {selectedPuja.services?.find(s => {
                                                if (!s || !s.service) return false;
                                                const sId = typeof s.service === 'object' ? s.service._id : s.service;
                                                return String(sId) === String(selectedServiceId);
                                            })?.packages.filter(p => p.name === selectedPackage).map((pkg) => (
                                                <div key={pkg.name} className="rounded-2xl bg-orange-50/40 border border-orange-100 p-4">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">What&apos;s Included</p>
                                                    <ul className="flex flex-col gap-2.5">
                                                        {pkg.features.map((feature, i) => (
                                                            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D35400] shrink-0"></div>
                                                                <span className="leading-snug">{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer / CTA with Package Details */}
                            <div className="p-5 md:p-8 border-t border-gray-100 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10 shrink-0">
                                {selectedPuja.services?.find(s => {
                                    if (!s || !s.service) return false;
                                    const sId = typeof s.service === 'object' ? s.service._id : s.service;
                                    return String(sId) === String(selectedServiceId);
                                })?.packages.filter(p => p.name === selectedPackage).map((pkg) => (
                                    <div key={pkg.name} className="flex items-center gap-3 mb-5">
                                        <span className="text-3xl font-bold text-[#2C0E0F]">₹{pkg.priceAmount.toLocaleString('en-IN')}</span>
                                        <span className="text-sm text-gray-400 font-medium">{pkg.name} Package</span>
                                    </div>
                                ))}
                                <button
                                    onClick={() => handleBookNow(selectedPuja)}
                                    className="w-full bg-[#D35400] hover:bg-[#b04600] text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98] group"
                                >
                                    <span>Book This Ritual</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform md:hidden" />
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform hidden md:block" />
                                </button>
                                <div className="flex items-center justify-center gap-2 mt-3 md:mt-4 text-[10px] md:text-xs text-center text-gray-400 font-medium">
                                    <ShieldCheck size={14} />
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
