"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface StaticService {
    _id: string;
    name: string;
    comingSoon: true;
    image: string;
}

interface PujaService {
    _id: string;
    name: string;
    significance: string;
    imageUrl?: string;
}

interface ServicesProps {
    onServiceClick?: (id: string) => void;
}

const staticServices: StaticService[] = [
    { _id: 'online-asthi-visarjan', name: 'Online Asthi Visarjan', comingSoon: true, image: '/assets/asthi_visarjan.jpeg' },
    { _id: 'online-pind-daan', name: 'Online Pind Daan', comingSoon: true, image: '/assets/pind_daan_websiteimg.jpeg' },
    { _id: 'book-a-pandit', name: 'Book a Pandit', comingSoon: true, image: '/assets/book_pandit.jpeg' },
];

const Services = ({ onServiceClick }: ServicesProps) => {
    const [typePujas, setTypePujas] = useState<PujaService[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTypePujas = async () => {
            try {
                const res = await fetch('/api/type-pujas');
                if (res.ok) setTypePujas(await res.json());
            } catch (error) {
                console.error("Failed to fetch type-pujas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTypePujas();
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
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Type-puja cards from API */}
                        {typePujas.map((puja) => (
                            <Link
                                key={puja._id}
                                href={`/pujas?serviceId=${puja._id}&serviceName=${encodeURIComponent(puja.name)}&serviceDesc=${encodeURIComponent(puja.significance)}`}
                                className="group block h-64 w-full rounded-[2rem] overflow-hidden relative shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${puja.imageUrl || '/assets/marjana.jpeg'})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                                <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                                    <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-1.5 rounded-full self-start shadow-lg group-hover:bg-white/30 transition-colors">
                                        <span className="text-white text-[10px] tracking-[0.2em] font-medium uppercase drop-shadow-sm">EXPLORE</span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <h3 className="text-white text-xl font-serif font-bold leading-tight drop-shadow-md group-hover:text-[#FFD700] transition-colors">
                                            {puja.name}
                                        </h3>
                                        <div className="w-9 h-9 rounded-full bg-orange-50 text-[#D35400] flex items-center justify-center group-hover:bg-[#D35400] group-hover:text-white transition-all duration-300 transform group-hover:rotate-[-45deg] shadow-sm shrink-0 ml-2">
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Static coming-soon cards */}
                        {staticServices.map((service) => (
                            <div
                                key={service._id}
                                className="group block h-64 w-full rounded-[2rem] overflow-hidden relative shadow-md cursor-default"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${service.image})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                                    <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-1.5 rounded-full self-start shadow-lg">
                                        <span className="text-white text-[10px] tracking-[0.2em] font-medium uppercase drop-shadow-sm">COMING SOON</span>
                                    </div>
                                    <h3 className="text-white text-xl font-serif font-bold leading-tight drop-shadow-md">
                                        {service.name}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Services;
