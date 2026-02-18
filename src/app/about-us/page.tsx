import React from 'react';
import { Shield, Heart, Globe, Users } from 'lucide-react';
import Image from 'next/image';

export const metadata = {
    title: 'About Us - Manima',
    description: 'Learn about Manima, our mission to connect the Odia diaspora with their roots through authentic Vedic rituals.',
};

const AboutUs = () => {
    return (
        <div className="bg-[#fffbf2] min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-[#2c0e0e] text-[#fffbf2] py-24 px-6 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <Image
                        src="/assets/HeroSectionTempleDesk3.png"
                        alt="Background Pattern"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6">About Manima</h1>
                    <p className="text-lg md:text-xl text-orange-100 max-w-2xl mx-auto leading-relaxed">
                        Bridging the distance between you and your spiritual roots. We bring the sanctity of Odisha's temples to your doorstep.
                    </p>
                </div>
            </div>

            <div className="container mx-auto max-w-5xl px-6 py-16">
                {/* Mission Statement */}
                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-[#e6dac8] mb-12 transform -translate-y-12">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-[#D35400] mb-6 font-serif">Our Mission</h2>
                            <p className="text-[#5c4d44] leading-relaxed text-lg mb-4">
                                At <strong>Manima</strong>, our mission is simple yet profound: to reconnect the global Odia community with their spiritual heritage. We understand that while life may take you across oceans, your heart remains rooted in the traditions of your ancestors.
                            </p>
                            <p className="text-[#5c4d44] leading-relaxed text-lg">
                                We strive to make authentic Vedic rituals accessible, transparent, and hassle-free, ensuring that every prayer offered reaches the divine with purity and devotion.
                            </p>
                        </div>
                        <div className="w-full md:w-1/3 flex justify-center">
                            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-orange-100 shadow-lg">
                                <Image
                                    src="/assets/logo.png"
                                    alt="Manima Mission"
                                    fill
                                    className="object-cover bg-[#fffbf2] p-4"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        {
                            icon: <Shield size={32} />,
                            title: "Authenticity",
                            desc: "Strict adherence to Vedic scriptures and rituals performed by experienced pundits."
                        },
                        {
                            icon: <Heart size={32} />,
                            title: "Devotion",
                            desc: "Every service is performed with the utmost sincerity, treating your prayers as our own."
                        },
                        {
                            icon: <Globe size={32} />,
                            title: "Accessibility",
                            desc: "Breaking geographical barriers to bring sacred traditions to you, wherever you are."
                        },
                        {
                            icon: <Users size={32} />,
                            title: "Community",
                            desc: "Building a bridge for the Odia diaspora to stay connected with their culture."
                        }
                    ].map((item, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl border border-orange-50 shadow-sm hover:shadow-md transition-shadow text-center">
                            <div className="w-12 h-12 bg-orange-100 text-[#D35400] rounded-full flex items-center justify-center mx-auto mb-4">
                                {item.icon}
                            </div>
                            <h3 className="font-bold text-[#2c0e0e] mb-2">{item.title}</h3>
                            <p className="text-sm text-[#8d7a6f] leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Story Section */}
                <div className="space-y-12 text-[#5c4d44] leading-relaxed max-w-3xl mx-auto text-lg">
                    <section>
                        <h2 className="text-2xl font-bold text-[#2c0e0e] mb-4 font-serif">Who We Are</h2>
                        <p>
                            Manima is more than just a service; it is a movement to preserve our rich cultural legacy. Founded by a team passionate about Odia heritage, we recognized the challenges faced by families living away from home in performing essential rituals like Pinda Daana, Pujas, and Daan.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-[#2c0e0e] mb-4 font-serif">What We Do</h2>
                        <p className="mb-4">
                            We facilitate a wide range of spiritual services including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-[#D35400]">
                            <li><strong>Pinda Daana & Ancestral Rites:</strong> Performed at sacred locations like Puri, Gaya, and Prayagraj.</li>
                            <li><strong>Temple Pujas:</strong> offerings at Jagannath Temple, Lingaraj Temple, and other holy sites.</li>
                            <li><strong>Brahman Bhojan & Daan:</strong> Acts of charity performed in your name to earn merit.</li>
                        </ul>
                    </section>

                    <div className="bg-orange-50 p-8 rounded-2xl border border-orange-100 text-center">
                        <h3 className="text-xl font-bold text-[#D35400] mb-2">Join Us in This Spiritual Journey</h3>
                        <p className="mb-6 text-[#5c4d44]">
                            Let us help you keep the flame of tradition alive.
                        </p>
                        <a href="/pujas" className="inline-block bg-[#D35400] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#b54000] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                            Explore Our Services
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
