"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Service {
    _id: string;
    name: string;
    details: string;
    availability: "explore" | "coming_soon";
    imageUrl?: string;
}

interface ServicesProps {
    onServiceClick?: (id: string) => void;
}

const Services = ({ onServiceClick }: ServicesProps) => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch("/api/services");
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setServices(data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch services:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    return (
        <section id="Services" className="bg-[#FDFAF0] relative py-12 scroll-mt-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="text-[#2C3E50] text-4xl font-serif font-bold tracking-wide uppercase relative inline-block">
                        Featured Services
                        <span className="block h-1 w-12 bg-[#DAA520] mx-auto mt-2 rounded-full"></span>
                    </h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-64 w-full rounded-[2rem] bg-gray-200 animate-pulse shadow-md" />
                        ))}
                    </div>
                ) : services.length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed border-[#DAA520]/40 bg-white/70 px-6 py-12 text-center text-[#7A6A56]">
                        No services available right now.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {services.map((service) => {
                            const isExplore = service.availability !== "coming_soon";
                            const cardContent = (
                                <>
                                    <div
                                        className={`absolute inset-0 bg-cover bg-center ${isExplore ? "transition-transform duration-700 group-hover:scale-110" : ""}`}
                                        style={{ backgroundImage: `url(${service.imageUrl || "/assets/marjana.jpeg"})` }}
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
                                                {service.name}
                                            </h3>

                                            {isExplore && (
                                                <div className="hidden sm:flex w-9 h-9 rounded-full bg-orange-50 text-[#D35400] items-center justify-center group-hover:bg-[#D35400] group-hover:text-white transition-all duration-300 transform group-hover:rotate-[-45deg] shadow-sm shrink-0 ml-2">
                                                    <ArrowRight size={16} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            );

                            if (!isExplore) {
                                return (
                                    <div
                                        key={service._id}
                                        className="group block h-64 w-full rounded-[2rem] overflow-hidden relative shadow-md cursor-default"
                                    >
                                        {cardContent}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={service._id}
                                    href={`/services/${service._id}`}
                                    onClick={() => onServiceClick?.(service._id)}
                                    className="group block h-64 w-full rounded-[2rem] overflow-hidden relative shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    {cardContent}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Services;
