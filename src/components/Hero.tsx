"use client";

import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PujaModal from "./PujaModal";

gsap.registerPlugin(ScrollTrigger);

//SERVICES

const services = [
  {
    icon: () => (
      <img
        src="/assets/puja.png"
        alt="Puja"
        className="w-12 sm:w-14 md:w-16 h-auto object-contain"
      />
    ),
    line1: "Puja for",
    line2: "Special Occasion",
  },
  {
    icon: () => (
      <img
        src="/assets/asthi.png"
        alt="Asthi Visarjan"
        className="w-12 sm:w-14 md:w-16 h-auto object-contain"
      />
    ),
    line1: "Asthi Visarjan",
  },
  {
    icon: () => (
      <img
        src="/assets/pinda.png"
        alt="Pinda Daan"
        className="w-12 sm:w-14 md:w-16 h-auto object-contain"
      />
    ),
    line1: "Pinda Daan",
  },
  {
    icon: () => (
      <img
        src="/assets/pandit_.png"
        alt="Book Pandit"
        className="w-12 sm:w-14 md:w-16 h-auto object-contain"
      />
    ),
    line1: "Book a",
    line2: "Pandit",
  },
];

//HERO

const Hero = () => {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  //TEMPORARY AD LOGIC

  useEffect(() => {
    const now = Date.now();
    const expiry = new Date("2026-02-16T05:01:03+05:30").getTime();
    if (now < expiry) {
      console.log("Ad visible");
    }
  }, []);

  /* -------- GSAP LOGO ANIMATION -------- */

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const logo = logoRef.current;
      const placeholder = placeholderRef.current;
      const headerLogo = document.getElementById("header-logo");

      if (!logo || !placeholder || !headerLogo) return;

      let startRect: DOMRect;

      const calculatePositions = () => {
        startRect = placeholder.getBoundingClientRect();

        gsap.set(logo, {
          position: "fixed",
          top: startRect.top,
          left: startRect.left,
          width: startRect.width,
          transformOrigin: "top left",
        });
      };

      calculatePositions();
      ScrollTrigger.addEventListener("refreshInit", calculatePositions);

      gsap.fromTo(
        logo,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      );

      gsap.to(logo, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "500px top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
        top: () => headerLogo.getBoundingClientRect().top,
        left: () => headerLogo.getBoundingClientRect().left,
        width: () => headerLogo.getBoundingClientRect().width,
        ease: "power2.out",
      });
    }, heroRef);

    setTimeout(() => ScrollTrigger.refresh(), 100);

    return () => ctx.revert();
  }, []);

  /* ---------------- RENDER ---------------- */

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-[100svh] flex items-center text-white bg-cover bg-center hero-bg md:bg-fixed"
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-[#D35400]/30 z-10" />

      {/* Animated Logo */}
      <img
        ref={logoRef}
        src="/assets/manima_logo.png"
        alt="Manima Logo"
        className="fixed z-[99] h-auto drop-shadow-2xl pointer-events-none"
      />

      {/* Content */}
      <div
        className="
    relative z-20
    max-w-4xl
    md:ml-auto md:mr-[15%]
    flex flex-col items-center
    text-center
    px-6 md:px-0
    pt-24
  "
      >
        {/* Placeholder */}
        <div
          ref={placeholderRef}
          className="mx-auto md:mx-0 mb-6 w-[250px] sm:w-[320px] md:w-[550px] aspect-[4.5] opacity-0"
        />

        {/* Heading */}
        <h1 className="text-2xl md:text-[2rem] mb-6 leading-tight text-[#f1c40f] drop-shadow-lg font-normal">
          For Every Ritual That Matters
        </h1>

        {/* CTA */}
        <div className="mb-14">
          <button
            onClick={() => router.push("/client/signup")}
            className="px-6 py-3 rounded font-semibold bg-[#D35400] hover:bg-[#E67E22] transition-colors"
          >
            Book Ritual Now
          </button>
        </div>

        {/* Services Grid */}
        <div className="w-full">
          <div className="grid 
                  grid-cols-2 
                  md:grid-cols-4 
                  gap-4 md:gap-6 
                  justify-items-center">

            {services.map((item, i) => {
              const Icon = item.icon;

              return (
                <button
                  key={i}
                  onClick={() =>
                    document
                      .getElementById("Services")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="
            w-[130px] sm:w-[140px] md:w-[150px]
            py-3
            flex flex-col items-center justify-center
            rounded-[26px]
            bg-white/35
            backdrop-blur-xl
            border border-white/60
            text-[#5a3e36]
            shadow-[0_8px_25px_rgba(255,255,255,0.35)]
            transition-all duration-300
            hover:-translate-y-1 hover:bg-white/45
            text-center
          "
                >
                  <div className="mb-2">
                    <Icon />
                  </div>

                  <div className="text-[11px] sm:text-xs font-normal leading-tight text-[#3d2f2a]">
                    <div>{item.line1}</div>
                    {item.line2 && <div>{item.line2}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <PujaModal isOpen={openModal} onClose={() => setOpenModal(false)} />
    </section>
  );
};

export default Hero;