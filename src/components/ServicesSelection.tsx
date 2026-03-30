"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, MapPin, ShieldCheck, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface Pricing {
    name: string;
    price: number;
    features: string[];
    recommended?: boolean;
}

interface Location {
    _id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    city: string;
    state: string;
    services: {
        service: string | { _id: string; name: string };
        pricing: Pricing[];
    }[];
}

interface Service {
    _id: string;
    name: string;
    details: string;
    availability?: "explore" | "coming_soon";
}

interface ServicesSelectionProps {
    showHeader?: boolean;
    title?: string;
    subtitle?: string;
    initialServiceId?: string;
    lockServiceSelection?: boolean;
    showBackButton?: boolean;
}

export default function ServicesSelection({
    showHeader = true,
    title = "Our Services",
    subtitle = "Choose a location, review the available packages, and continue to payment for your ritual booking.",
    initialServiceId,
    lockServiceSelection = false,
    showBackButton = false,
}: ServicesSelectionProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryServiceId = searchParams.get("serviceId");
    const [services, setServices] = useState<Service[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [selectedState, setSelectedState] = useState("All");
    const [activeLocation, setActiveLocation] = useState<Location | null>(null);
    const [isPackagesOpen, setIsPackagesOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [servicesRes, locationsRes] = await Promise.all([
                    fetch("/api/services"),
                    fetch("/api/locations"),
                ]);

                if (servicesRes.ok && locationsRes.ok) {
                    const servicesData = await servicesRes.json();
                    const locationsData = await locationsRes.json();
                    setServices(Array.isArray(servicesData) ? servicesData.filter((service: Service) => service.availability !== "coming_soon") : []);
                    setLocations(Array.isArray(locationsData) ? locationsData : []);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!loading && services.length > 0) {
            const preferredServiceId = initialServiceId || queryServiceId;
            if (preferredServiceId && services.some((service) => service._id === preferredServiceId)) {
                setSelectedServiceId(preferredServiceId);
            } else if (!selectedServiceId) {
                setSelectedServiceId(services[0]._id);
            }
        }
    }, [initialServiceId, loading, queryServiceId, selectedServiceId, services]);

    const selectedService = services.find((service) => service._id === selectedServiceId);

    const serviceLocations = useMemo(() => {
        return locations.filter((location) =>
            location.services.some((entry) => {
                const serviceId = typeof entry.service === "string" ? entry.service : entry.service._id;
                return serviceId === selectedServiceId;
            })
        );
    }, [locations, selectedServiceId]);

    const stateOptions = useMemo(() => {
        return ["All", ...Array.from(new Set(serviceLocations.map((location) => location.state)))];
    }, [serviceLocations]);

    const visibleLocations = useMemo(() => {
        if (selectedState === "All") return serviceLocations;
        return serviceLocations.filter((location) => location.state === selectedState);
    }, [selectedState, serviceLocations]);

    const activePackages = useMemo(() => {
        if (!activeLocation) return [];
        const entry = activeLocation.services.find((item) => {
            const serviceId = typeof item.service === "string" ? item.service : item.service._id;
            return serviceId === selectedServiceId;
        });
        return entry?.pricing || [];
    }, [activeLocation, selectedServiceId]);

    const handleLocationClick = (location: Location) => {
        setActiveLocation(location);
        setIsPackagesOpen(true);
    };

    const handleBookNow = (pkg: Pricing) => {
        if (!activeLocation) return;
        const hasAuthCookie = document.cookie.split(";").some((item) => item.trim().startsWith("client_auth_status="));

        const queryParams = new URLSearchParams({
            serviceId: selectedServiceId,
            locationId: activeLocation._id,
            packageName: pkg.name,
        }).toString();

        const checkoutUrl = `/checkout?${queryParams}`;

        if (hasAuthCookie) {
            router.push(checkoutUrl);
            return;
        }

        router.push(`/client/login?redirect=${encodeURIComponent(checkoutUrl)}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D35400]"></div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {showHeader && (
                <div className="mb-8 flex items-center gap-4">
                    {showBackButton && (
                        <button
                            onClick={() => router.back()}
                            className="p-3 rounded-full bg-white border border-[#EADBC8] text-[#D35400] hover:bg-orange-50 transition-colors shadow-sm"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className={showBackButton ? "text-left" : "text-center w-full"}>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#922B21] mb-2 font-serif">
                            {lockServiceSelection && selectedService ? selectedService.name : title}
                        </h1>
                        <p className="text-[#8B4513] text-sm opacity-80 max-w-2xl mx-auto">
                            {selectedService?.details || subtitle}
                        </p>
                    </div>
                </div>
            )}

            {!lockServiceSelection && (
                <div className="mb-12 max-w-sm mx-auto">
                    <label className="block text-[#922B21] text-xs font-bold uppercase tracking-[0.2em] mb-4 font-serif text-center">
                        Choose Your Sacred Ritual
                    </label>
                    <div className="relative group">
                        <select
                            value={selectedServiceId}
                            onChange={(e) => setSelectedServiceId(e.target.value)}
                            className="w-full appearance-none rounded-2xl border-2 border-[#EADBC8] bg-white px-6 py-4 text-[#2C3E50] font-bold shadow-sm outline-none focus:border-[#D35400] transition-all cursor-pointer"
                        >
                            {services.map((service) => (
                                <option key={service._id} value={service._id}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#D35400]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-[3rem] border border-[#EADBC8]/50 bg-[#FDFAF5] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-50/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

                <div className="relative z-10">
                    <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-[#EADBC8]/30 pb-8">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.5em] text-[#D35400] font-bold mb-3">Select Location</p>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2C0E0F] tracking-wide">
                                {selectedService?.name || "Divine Rituals"}
                            </h2>
                        </div>
                        <div className="relative min-w-[220px]">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-2 ml-1">Filter by State</p>
                            <div className="relative">
                                <select
                                    value={selectedState}
                                    onChange={(e) => setSelectedState(e.target.value)}
                                    className="w-full appearance-none rounded-xl border-2 border-[#EADBC8]/50 bg-white px-5 py-3 text-sm font-bold text-[#2C0E0F] outline-none focus:border-[#D35400] transition-all cursor-pointer shadow-sm"
                                >
                                    {stateOptions.map((state) => (
                                        <option key={state} value={state}>
                                            {state === 'All' ? 'All India' : state}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#D35400]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:grid-cols-4">
                        {visibleLocations.map((location) => {
                            // Find minimum price for the selected service at this location
                            const serviceEntry = location.services.find(s => {
                                const sId = typeof s.service === 'string' ? s.service : s.service._id;
                                return String(sId) === String(selectedServiceId);
                            });
                            const minPrice = serviceEntry?.pricing?.length 
                                ? Math.min(...serviceEntry.pricing.map(p => p.price)) 
                                : 0;

                            return (
                                <div
                                    key={location._id}
                                    onClick={() => handleLocationClick(location)}
                                    className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-[#EADBC8]/30 overflow-hidden cursor-pointer flex flex-col h-full"
                                >
                                    <div className="relative h-60 overflow-hidden">
                                        <img
                                            src={location.imageUrl || "/assets/marjana.jpeg"}
                                            alt={location.name}
                                            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <h3 className="font-serif font-bold text-xl text-[#2C0E0F] group-hover:text-[#D35400] transition-colors mb-3 leading-tight">
                                                {location.name}
                                            </h3>
                                            <div className="flex items-center text-gray-500 text-sm mb-4">
                                                <MapPin size={16} className="mr-1.5 text-[#DAA520] shrink-0" />
                                                <span className="line-clamp-1">{location.city}, {location.state}</span>
                                            </div>
                                        </div>

                                        <div className="pt-5 border-t border-[#EADBC8]/20 flex items-center justify-between mt-auto">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-0.5">Starting at</p>
                                                <p className="font-bold text-xl text-[#2C0E0F]">₹{minPrice.toLocaleString('en-IN')}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-orange-50 text-[#D35400] flex items-center justify-center group-hover:bg-[#D35400] group-hover:text-white transition-all transform group-hover:rotate-[-45deg] shadow-sm">
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {isPackagesOpen && activeLocation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1A1A]/90 p-4 md:p-6 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[3rem] bg-[#FDFAF5] shadow-[0_50px_100px_rgba(0,0,0,0.4)] border border-white/20 animate-in zoom-in-95 duration-500">
                        <button
                            type="button"
                            onClick={() => setIsPackagesOpen(false)}
                            className="absolute right-6 top-6 z-20 rounded-full bg-black/5 hover:bg-[#D35400] p-3 text-black hover:text-white transition-all duration-300 hover:rotate-90 group shadow-sm"
                        >
                            <X size={20} />
                        </button>

                        <div className="grid max-h-[92vh] grid-cols-1 overflow-y-auto lg:grid-cols-[0.9fr_1.1fr] custom-scrollbar">
                            <div className="relative min-h-[400px] lg:h-auto bg-[#2C0E0F] overflow-hidden">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
                                    style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%), url(${activeLocation.imageUrl || "/assets/marjana.jpeg"})` }}
                                />
                                <div className="relative flex h-full flex-col justify-end p-10 md:p-14 text-white">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-[1px] w-8 bg-[#DAA520]"></div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-[#DAA520] font-bold">
                                            {selectedService?.name}
                                        </p>
                                    </div>
                                    <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">{activeLocation.name}</h2>
                                    <p className="max-w-md text-lg text-white/80 font-light leading-relaxed mb-8">
                                        {activeLocation.description || selectedService?.details || "Experience the sacred traditions at our verified holy sites."}
                                    </p>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-sm">
                                            <MapPin size={16} className="text-[#DAA520]" />
                                            <span>{activeLocation.city}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-sm">
                                            <ShieldCheck size={16} className="text-[#DAA520]" />
                                            <span>Verified Pandit</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 md:p-14 flex flex-col">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#2C0E0F]">Available Packages</h3>
                                        <div className="flex items-center gap-2 mt-2 text-[#D35400] font-bold">
                                            <Check size={16} />
                                            <span className="text-sm tracking-wide">Trusted by 10,000+ devotees</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-8">
                                    {activePackages.map((pkg, index) => (
                                        <div
                                            key={index}
                                            className={`group relative flex flex-col md:flex-row md:items-center justify-between rounded-[2.5rem] border-2 p-8 transition-all duration-300 ${pkg.recommended 
                                                ? "border-[#D35400] bg-white shadow-[0_20px_50px_rgba(211,84,0,0.1)] ring-1 ring-[#D35400]/20" 
                                                : "border-[#E5E7EB] bg-white hover:border-[#D35400]/30 hover:shadow-xl"}`}
                                        >
                                            {pkg.recommended && (
                                                <div className="absolute -top-4 right-10 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D35400] to-[#E67E22] px-6 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg overflow-hidden">
                                                    <div className="absolute inset-0 animate-shimmer pointer-events-none"></div>
                                                    <span className="relative z-10">Recommended Choice</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex-1">
                                                <h4 className="text-2xl font-bold text-[#111827] mb-2">{pkg.name}</h4>
                                                <div className="flex items-baseline gap-1 mb-6">
                                                    <span className="text-3xl font-black text-[#2C0E0F]">₹{pkg.price.toLocaleString("en-IN")}</span>
                                                    <span className="text-gray-400 text-sm font-medium">/ ritual</span>
                                                </div>
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                                                    {pkg.features.map((feature, featureIndex) => (
                                                        <li key={featureIndex} className="flex items-start gap-2.5 text-sm text-[#4B5563]">
                                                            <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-[#D35400]/10 flex items-center justify-center text-[#D35400]">
                                                                <Check size={10} strokeWidth={4} />
                                                            </div>
                                                            <span className="leading-tight">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="mt-8 md:mt-0 md:ml-8 flex flex-col items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleBookNow(pkg)}
                                                    className={`w-full md:w-auto inline-flex items-center justify-center gap-3 rounded-2xl px-10 py-5 font-bold text-center transition-all duration-300 transform active:scale-95 ${pkg.recommended 
                                                        ? "bg-[#D35400] text-white shadow-lg shadow-[#D35400]/30 hover:bg-[#B84A00] hover:-translate-y-1" 
                                                        : "bg-[#2C0E0F] text-white hover:bg-[#1A1A1A] hover:-translate-y-1"}`}
                                                >
                                                    <span>Book Now</span>
                                                    <ArrowRight size={18} />
                                                </button>
                                                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                    <ShieldCheck size={12} />
                                                    <span>Safe Booking</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-10 text-center text-xs text-gray-400 font-medium italic">
                                    * Our Vedic experts ensure all rituals are performed with the utmost purity and adherence to tradition.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
