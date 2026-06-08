"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import JagannathFeaturedSection from "@/components/JagannathFeaturedSection";

interface TypePuja {
    _id: string;
    name: string;
    significance: string;
    imageUrl?: string;
}

interface Service {
    _id: string;
    name: string;
    details: string;
    availability?: "explore" | "coming_soon";
    imageUrl?: string;
}

type Offering =
    | { kind: "type-puja"; item: TypePuja }
    | { kind: "service"; item: Service };

export default function HomeFeaturedOfferings() {
    const router = useRouter();
    const [offerings, setOfferings] = useState<Offering[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOfferings = async () => {
            try {
                const [typePujasRes, servicesRes] = await Promise.all([
                    fetch("/api/type-pujas"),
                    fetch("/api/services"),
                ]);

                const nextOfferings: Offering[] = [];

                if (typePujasRes.ok) {
                    const typePujasData = await typePujasRes.json();
                    const typePujas = Array.isArray(typePujasData?.data) ? typePujasData.data : Array.isArray(typePujasData) ? typePujasData : [];
                    nextOfferings.push(...typePujas.map((item: TypePuja) => ({ kind: "type-puja" as const, item })));
                }

                if (servicesRes.ok) {
                    const servicesData = await servicesRes.json();
                    const services = Array.isArray(servicesData) ? servicesData : [];
                    const exploreServices = services.filter((item: Service) => item.availability !== "coming_soon");
                    const comingSoonServices = services.filter((item: Service) => item.availability === "coming_soon");

                    nextOfferings.push(
                        ...exploreServices.map((item: Service) => ({ kind: "service" as const, item })),
                        ...comingSoonServices.map((item: Service) => ({ kind: "service" as const, item }))
                    );
                }

                setOfferings(nextOfferings);
            } catch (error) {
                console.error("Failed to fetch homepage offerings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOfferings();
    }, []);

    const handleTypePujaClick = (item: TypePuja) => {
        router.push(`/pujas?serviceId=${item._id}&serviceName=${encodeURIComponent(item.name)}&serviceDesc=${encodeURIComponent(item.significance)}`);
    };

    const handleServiceClick = (item: Service) => {
        if (item.availability === "coming_soon") return;
        router.push(`/services/${item._id}`);
    };

    return (
        <section id="Services" className="bg-[#FDFAF0] relative py-12 scroll-mt-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="text-[#2C3E50] text-4xl font-serif font-bold tracking-wide uppercase relative inline-block">
                        Featured Services
                        <span className="block h-1 w-12 bg-[#DAA520] mx-auto mt-2 rounded-full"></span>
                    </h2>
                    <p className="mt-4 text-[#6B7280] max-w-2xl mx-auto text-sm sm:text-base">
                        Select the puja or ritual that feels right for you from our curated list of temples and services.
                    </p>
                </div>

                <JagannathFeaturedSection />

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-64 w-full rounded-[2rem] bg-gray-200 animate-pulse shadow-md" />
                        ))}
                    </div>
                ) : offerings.length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed border-[#DAA520]/40 bg-white/70 px-6 py-12 text-center text-[#7A6A56]">
                        No offerings available right now.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {offerings.map((offering) => {
                            if (offering.kind === "type-puja") {
                                const item = offering.item;

                                return (
                                    <button
                                        key={`type-puja-${item._id}`}
                                        type="button"
                                        onClick={() => handleTypePujaClick(item)}
                                        className="group block h-64 w-full rounded-[2rem] overflow-hidden relative shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left"
                                    >
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url(${item.imageUrl || "/assets/marjana.jpeg"})` }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-95" />
                                        <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 z-10">
                                            <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 rounded-full self-start shadow-md">
                                                <span className="text-white text-[9px] sm:text-[10px] tracking-widest font-medium uppercase drop-shadow-sm">
                                                    View Temples
                                                </span>
                                            </div>

                                            <div className="flex items-end justify-start sm:justify-between gap-2 min-h-[48px]">
                                                <h3 className="text-white text-base sm:text-xl font-serif font-semibold leading-snug drop-shadow-md group-hover:text-[#FFD700] transition-colors text-center w-full">
                                                    {item.name}
                                                </h3>

                                                <div className="hidden sm:flex w-9 h-9 rounded-full bg-orange-50 text-[#D35400] items-center justify-center group-hover:bg-[#D35400] group-hover:text-white transition-all duration-300 transform group-hover:rotate-[-45deg] shadow-sm shrink-0 ml-2">
                                                    <ArrowRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            }

                            const item = offering.item;
                            const isExplore = item.availability !== "coming_soon";

                            return (
                                <button
                                    key={`service-${item._id}`}
                                    type="button"
                                    onClick={() => handleServiceClick(item)}
                                    className={`group block h-64 w-full rounded-[2rem] overflow-hidden relative shadow-md text-left ${isExplore ? "hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" : "cursor-default"}`}
                                >
                                    <div
                                        className={`absolute inset-0 bg-cover bg-center ${isExplore ? "transition-transform duration-700 group-hover:scale-110" : ""}`}
                                        style={{ backgroundImage: `url(${item.imageUrl || "/assets/marjana.jpeg"})` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-95" />
                                    <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 z-10">
                                        <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 rounded-full self-start shadow-md">
                                            <span className="text-white text-[9px] sm:text-[10px] tracking-widest font-medium uppercase drop-shadow-sm">
                                                {isExplore ? "Explore" : "Coming Soon"}
                                            </span>
                                        </div>

                                        <div className="flex items-end justify-start sm:justify-between gap-2 min-h-[48px]">
                                            <h3 className="text-white text-base sm:text-xl font-serif font-semibold leading-snug drop-shadow-md group-hover:text-[#FFD700] transition-colors text-center w-full">
                                                {item.name}
                                            </h3>

                                            {isExplore && (
                                                <div className="hidden sm:flex w-9 h-9 rounded-full bg-orange-50 text-[#D35400] items-center justify-center group-hover:bg-[#D35400] group-hover:text-white transition-all duration-300 transform group-hover:rotate-[-45deg] shadow-sm shrink-0 ml-2">
                                                    <ArrowRight size={16} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
