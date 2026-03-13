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

            if (window.innerWidth >= 1280) {
                setSpinnerConfig({
                    radius: 220,
                    count: 120
                });

            } else if (window.innerWidth >= 1024) {
                setSpinnerConfig({
                    radius: 170,
                    count: 90
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
        <section className="w-full min-h-screen flex items-center bg-manima-sand overflow-hidden">

            <div className="max-w-300 mx-auto px-6 py-10 lg:py-6 grid
                grid-cols-1 lg:grid-cols-[1fr_1fr]
                items-center gap-10 md:gap-14 lg:gap-10 xl:gap-20">

                {/* LEFT SIDE */}
                <div className="relative flex items-center justify-center w-full
                    h-75 sm:h-90 md:h-125 lg:h-120 xl:h-150
                    mt-6 md:mt-0">

                    <TunnelSpinner
                        radius={spinnerConfig.radius}
                        count={spinnerConfig.count}
                    />

                    {/* Glow */}
                    <div className="absolute w-55 h-55 md:w-80 md:h-80 xl:w-90 xl:h-90 bg-manima-gold/20 blur-[90px] rounded-full"></div>

                    {/* Logo */}
                    <div className="relative w-30 h-30 md:w-50 md:h-50 lg:w-55 lg:h-55 xl:w-75 xl:h-75 z-10">
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
                <div className="max-w-130 flex flex-col items-center md:items-start">

                    <h2 className="font-heading text-[48px] md:text-[72px] lg:text-[72px] xl:text-[96px] leading-[0.95] tracking-[-1px] text-[#bf392a] text-center md:text-left">
                        {title}
                    </h2>

                    <p className="mt-6 text-[16px] md:text-[18px] lg:text-[18px] xl:text-[22px] text-[#582C12] font-medium text-center md:text-left">
                        &quot;{tagline}&quot;
                    </p>

                    <div className="mt-6 text-[15px] md:text-[16px] lg:text-[15px] xl:text-[18px] leading-[1.7] text-[#000000]">

                        <p className="md:hidden text-justify">
                            {descriptionParts.join(" ")}
                        </p>

                        <div className="hidden md:flex flex-col space-y-4">

                            <div className="flex gap-4 items-start">
                                <div className="size-8 rounded-full bg-[#bf392a]/10 flex items-center justify-center shrink-0 mt-1">
                                    <Heart size={18} className="text-[#bf392a]" fill="#bf392a" />
                                </div>
                                <p>{descriptionParts[0]}</p>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="size-8 rounded-full bg-[#bf392a]/10 flex items-center justify-center shrink-0 mt-1">
                                    <Users size={18} className="text-[#bf392a]" />
                                </div>
                                <p>{descriptionParts[1]}</p>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="size-8 rounded-full bg-[#bf392a]/10 flex items-center justify-center shrink-0 mt-1">
                                    <Infinity size={18} className="text-[#bf392a]" />
                                </div>
                                <p>{descriptionParts[2]}</p>
                            </div>

                        </div>

                    </div>

                    <div className="mt-8 xl:mt-10">
                        <a
                            href="#how-it-works"
                            className="inline-flex items-center gap-3 bg-[#bf392a] text-white hover:bg-[#f1ece9] hover:text-[#bf392a] hover:border-2 hover:border-[#bf392a] px-7 py-4 rounded-full text-[16px] font-medium tracking-wide transition"
                        >    
                            {cta}
                            <span>{"→"}</span>
                        </a>
                    </div>

                </div>

            </div>

        </section>
    );
};

export default AboutManima;