"use client";

import { useEffect, useState } from "react";
import TunnelSpinner from "./tunnelSpinner";
import Image from "next/image";
import { Heart, Users, Infinity } from "lucide-react";

const AboutManima = () => {

    const [spinnerConfig, setSpinnerConfig] = useState({
        radius: 140,
        count: 70
    });

    useEffect(() => {

        const update = () => {

            if (window.innerWidth >= 1024) {
                setSpinnerConfig({
                    radius: 220,
                    count: 120
                });

            } else if (window.innerWidth >= 768) {
                setSpinnerConfig({
                    radius: 180,
                    count: 100
                });

            } else {
                setSpinnerConfig({
                    radius: 110,
                    count: 60
                });
            }
        };

        update();

        window.addEventListener("resize", update);

        return () => window.removeEventListener("resize", update);

    }, []);

    const content = {
        title: "Our Philosophy",
        tagline: "When you can't be there, your devotion still can",
        descriptionParts: [
            "At Manima, we believe distance should never come between faith and responsibility.",
            "We help families stay connected to sacred traditions by making spiritual services simple, trusted, and accessible.",
            "For us, it is not just about services; it is about preserving connection, respect, and continuity of tradition for modern families."
        ],
        cta: "How it works"
    };

    const { title, tagline, descriptionParts, cta } = content;

    return (
        <section className="w-full min-h-screen flex items-center bg-[#FDFAF0] overflow-hidden">

            <div className="max-w-[1200px] mx-auto px-6 grid 
grid-cols-1 lg:grid-cols-[1fr_1fr] 
items-center gap-10 md:gap-14 lg:gap-20">

                {/* LEFT SIDE */}
                <div className="relative flex items-center justify-center w-full h-[300px] sm:h-[360px] md:h-[620px] lg:h-[720px] mt-6 md:mt-0">

                    <TunnelSpinner
                        radius={spinnerConfig.radius}
                        count={spinnerConfig.count}
                    />

                    {/* Glow */}
                    <div className="absolute w-[220px] h-[220px] md:w-[360px] md:h-[360px] bg-manima-gold/20 blur-[90px] rounded-full"></div>

                    {/* Logo */}
                    <div className="relative w-[120px] h-[120px] md:w-[240px] md:h-[240px] lg:w-[300px] lg:h-[300px] z-10">
                        <Image
                            src="/assets/logo.png"
                            alt="Manima Logo"
                            fill
                            className="object-contain drop-shadow-xl"
                            unoptimized
                        />
                    </div>

                </div>

                {/* RIGHT SIDE */}
                <div className="max-w-[520px] flex flex-col items-center md:items-start">

                    <h2 className="font-heading text-[48px] md:text-[80px] lg:text-[100px] leading-[0.95] tracking-[-1px] text-[#bf392a] text-center md:text-left">
                        {title}
                    </h2>

                    <p className="mt-6 text-[18px] md:text-[22px] text-[#582C12] font-medium text-center md:text-left">
                        “{tagline}”
                    </p>

                    <div className="mt-6 text-[16px] md:text-[18px] leading-[1.7] text-[#000000]">

                        <p className="md:hidden text-justify">
                            {descriptionParts.join(" ")}
                        </p>

                        <div className="hidden md:flex flex-col space-y-4">

                            <div className="flex gap-4 items-start">
                                <div className="size-8 rounded-full bg-[#bf392a]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Heart size={18} className="text-[#bf392a]" fill="#bf392a" />
                                </div>
                                <p>{descriptionParts[0]}</p>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="size-8 rounded-full bg-[#bf392a]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Users size={18} className="text-[#bf392a]" />
                                </div>
                                <p>{descriptionParts[1]}</p>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="size-8 rounded-full bg-[#bf392a]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Infinity size={18} className="text-[#bf392a]" />
                                </div>
                                <p>{descriptionParts[2]}</p>
                            </div>

                        </div>

                    </div>

                    <div className="mt-10">
                        <a
                            href="#how-it-works"
                            className="inline-flex items-center gap-3 bg-[#bf392a] text-white hover:bg-[#f1ece9] hover:text-[#bf392a] hover:border-2 hover:border-[#bf392a] px-7 py-4 rounded-full text-[16px] font-medium tracking-wide transition"
                        >
                            {cta}
                            <span>→</span>
                        </a>
                    </div>

                </div>

            </div>

        </section>
    );
};

export default AboutManima;