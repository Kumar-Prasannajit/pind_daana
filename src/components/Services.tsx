"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Service {
    _id: string;
    name: string;
    details: string;
    link?: string;
    comingSoon?: boolean;
    image?: string;
}

interface ServicesProps {
    onServiceClick?: (id: string) => void;
}

const Services = ({ onServiceClick }: ServicesProps) => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            // Static services definition
            const ritualPuja: Service = {
                _id: 'ritual-puja-static',
                name: 'Puja for Special Occasions',
                details: 'Perform authentic Vedic Pujas with experienced Pandits.',
                link: '/special-pujas',
                image: '/assets/special_puja.jpeg'
            };

            const asthiVisarjan: Service = {
                _id: 'online-asthi-visarjan',
                name: 'Online Asthi Visarjan',
                details: 'Perform Asthi Visarjan rituals remotely.',
                comingSoon: true,
                image: '/assets/asthi_visarjan.jpeg'
            };

            const pindDaan: Service = {
                _id: 'online-pind-daan',
                name: 'Online Pind Daan',
                details: 'Perform Pind Daan for your ancestors.',
                comingSoon: true,
                image: '/assets/pind_daan_websiteimg.jpeg'
            };

            const bookPandit: Service = {
                _id: 'book-a-pandit',
                name: 'Book a Pandit',
                details: 'Connect with knowledgeable Pandits.',
                comingSoon: true,
                image: '/assets/book_pandit.jpeg'
            };

            let apiServices: Service[] = [];

            try {
                const res = await fetch('/api/services');
                if (res.ok) {
                    apiServices = await res.json();
                }
            } catch (error) {
                console.error("Failed to fetch services:", error);
            } finally {
                // Ensure apiServices also have images if possible or use default
                const processedApiServices = apiServices.map(s => ({
                    ...s,
                    image: s.image || '/assets/manima_logo.png' // Fallback
                }));
                setServices([ritualPuja, asthiVisarjan, pindDaan, bookPandit, ...processedApiServices]);
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
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="block h-64 w-full rounded-[2rem] bg-gray-200 animate-pulse relative shadow-md" />
                        ))}
                    </div>
                ) : services.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {services.slice(0, 4).map((service, index) => (
                            <div key={service._id} className={`relative group ${service.comingSoon ? 'opacity-90' : ''}`}>
                                {service.comingSoon ? (
                                    <div className="block h-64 w-full rounded-[2rem] overflow-hidden relative shadow-md cursor-default">
                                        {/* Background Image */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                                            style={{ backgroundImage: `url(${service.image})` }}
                                        />
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                        {/* Content */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                                            {/* Capsule Container for Coming Soon */}
                                            <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-1.5 rounded-full mb-3 shadow-lg">
                                                <span className="text-white text-[10px] tracking-[0.2em] font-medium uppercase drop-shadow-sm block">COMING SOON</span>
                                            </div>

                                            <h3 className="text-white text-2xl font-[family-name:var(--font-dm-serif)] leading-tight drop-shadow-md">
                                                {service.name.split(' ').map((word, i) => (
                                                    <span key={i} className="block">{word}</span>
                                                ))}
                                            </h3>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        href={service.link || `/services?serviceId=${service._id}`}
                                        className="block h-64 w-full rounded-[2rem] overflow-hidden relative shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        {/* Background Image */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url(${service.image})` }}
                                        />
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                                        {/* Content */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                                            {/* Capsule Container for Explore */}
                                            <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-1.5 rounded-full mb-3 shadow-lg group-hover:bg-white/30 transition-colors">
                                                <span className="text-white text-[10px] tracking-[0.2em] font-medium uppercase drop-shadow-sm block">EXPLORE</span>
                                            </div>

                                            <h3 className="text-white text-2xl font-[family-name:var(--font-dm-serif)] leading-tight drop-shadow-md">
                                                {service.name.split(' ').map((word, i) => (
                                                    <span key={i} className="block">{word}</span>
                                                ))}
                                            </h3>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full text-center py-10 text-gray-400">No services available.</div>
                )}

                {/* <div className="text-center mt-8">
                    <Link href="/services" className="inline-block p-3 bg-[#D35400] text-white rounded-full hover:bg-[#E67E22] transition-colors duration-300 shadow-lg group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down group-hover:translate-y-1 transition-transform"><path d="m6 9 6 6 6-6" /></svg>
                    </Link>
                </div> */}
            </div>
        </section>
    );
};

export default Services;
