"use client";
import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
import PujaModal from "./PujaModal";
import { X } from "lucide-react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useRouter } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    // Current time: 2026-02-15T05:01:21+05:30
    // Expiry: 24 hours from 2026-02-15T05:01:03+05:30
    const now = Date.now();
    const expiry = new Date("2026-02-16T05:01:03+05:30").getTime();
    if (now < expiry) {
      setShowAd(true);
    }
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const logo = logoRef.current;
      const placeholder = placeholderRef.current;
      const headerLogo = document.getElementById("header-logo");

      if (!logo || !placeholder || !headerLogo) return;

      let startRect: DOMRect;
      let isMobile: boolean;

      const calculatePositions = () => {
        startRect = placeholder.getBoundingClientRect();
        isMobile = window.innerWidth < 768;

        if (isMobile) {
          gsap.set(logo, {
            position: "fixed",
            top: 0,
            left: 0,
            width: startRect.width,
            x: startRect.left,
            y: startRect.top,
            transformOrigin: "top left",
          });
        } else {
          gsap.set(logo, {
            position: "fixed",
            top: startRect.top,
            left: startRect.left,
            width: startRect.width,
            transformOrigin: "top left",
          });
        }
      };

      // Initial calculation
      calculatePositions();

      // Recalculate on every refresh (resize/orientation/address bar)
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
        ease: "power2.out",
        ...(window.innerWidth < 768
          ? {
            x: () => headerLogo.getBoundingClientRect().left,
            y: () => headerLogo.getBoundingClientRect().top,
            scale: () =>
              headerLogo.getBoundingClientRect().width /
              startRect.width,
          }
          : {
            top: () => headerLogo.getBoundingClientRect().top,
            left: () => headerLogo.getBoundingClientRect().left,
            width: () => headerLogo.getBoundingClientRect().width,
          }),
      });
    }, heroRef);

    // Force refresh after mount
    setTimeout(() => ScrollTrigger.refresh(), 100);

    return () => ctx.revert();
  }, []);


  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative h-screen min-h-[600px] flex items-center text-white hero-bg bg-cover bg-center bg-fixed"
    >
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/40 to-[#D35400]/30 z-10"></div>

      {/* Animated Logo */}
      <img
        ref={logoRef}
        src="/assets/manima_logo.png"
        alt="Manima Logo"
        className="fixed z-[99] h-auto mr-35 drop-shadow-2xl pointer-events-none"
      />

      <div className="relative z-20 max-w-[800px] mx-auto md:mr-[15%] text-center pt-[60px] px-6">
        {/* Placeholder to define starting position */}
        <div
          ref={placeholderRef}
          className="flex justify-center mx-auto mb-6 w-[250px] sm:w-[320px] md:w-[550px] aspect-[4.39/1] opacity-0"
        ></div>

        <h1 className="text-2xl md:text-[2rem] mt-4 mb-6 leading-[1.2] text-[#f1c40f]/100 drop-shadow-lg font-normal">
          For Every Ritual That Matters
        </h1>

        <div className="flex flex-col md:flex-row gap-6 justify-center mb-16">
          <button
            className="px-6 py-3 rounded-[4px] font-semibold bg-[#D35400] text-white shadow-sm hover:bg-[#E67E22]"
            onClick={() => router.push('/client/signup')}
          >
            Book Ritual Now
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8 justify-items-center">

          <button
            onClick={() =>
              document.getElementById("Services")?.scrollIntoView({ behavior: "smooth" })
            }
            className="relative w-full max-w-[160px] h-12 
               flex flex-col items-center justify-center
               rounded-full overflow-hidden cursor-pointer
               text-xs font-medium text-white"
          >
            <div className="absolute inset-0 bg-[url('/assets/special_puja.jpeg')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-black/55"></div>
            <span className="relative z-10 leading-tight text-center">
              Puja for <br /> Special Occasion
            </span>
          </button>

          <button
            onClick={() =>
              document.getElementById("Services")?.scrollIntoView({ behavior: "smooth" })
            }
            className="relative w-full max-w-[160px] h-12 
               flex flex-col items-center justify-center
               rounded-full overflow-hidden cursor-pointer
               text-xs font-medium text-white"
          >
            <div className="absolute inset-0 bg-[url('/assets/asthi_visarjan.jpeg')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-black/55"></div>
            <span className="relative z-10 leading-tight text-center">
              Asthi <br /> Visarjan
            </span>
          </button>

          <button
            onClick={() =>
              document.getElementById("Services")?.scrollIntoView({ behavior: "smooth" })
            }
            className="relative w-full max-w-[160px] h-12 
               flex flex-col items-center justify-center
               rounded-full overflow-hidden cursor-pointer
               text-xs font-medium text-white"
          >
            <div className="absolute inset-0 bg-[url('/assets/special_puja.jpeg')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-black/55"></div>
            <span className="relative z-10 leading-tight text-center">
              Pinda <br /> Daan
            </span>
          </button>

          <button
            onClick={() =>
              document.getElementById("Services")?.scrollIntoView({ behavior: "smooth" })
            }
            className="relative w-full max-w-[160px] h-12 
               flex flex-col items-center justify-center
               rounded-full overflow-hidden cursor-pointer
               text-xs font-medium text-white"
          >
            <div className="absolute inset-0 bg-[url('/assets/book_pandit.jpeg')] bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-black/55"></div>
            <span className="relative z-10 leading-tight text-center">
              Book a <br /> Pandit
            </span>
          </button>

        </div>
      </div>

      <PujaModal isOpen={openModal} onClose={() => setOpenModal(false)} />



    </section>
  );
};


export default Hero;
