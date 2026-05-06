"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ServiceModal from "@/components/ServiceModal";

const services = [
  {
    name: "Sarva Kalyan Puja",
    price: 5999,
    image: "/assets/sarv_kalyan.jpeg",
    position: "center",
  },
  {
    name: "Ekadashi Puja",
    price: 4999,
    image: "/assets/ekadashi.jpeg",
    position: "center",
  },
  {
    name: "Sankranti Puja",
    price: 4999,
    image: "/assets/sankranti.jpeg",
    position: "center",
  },
];

export default function JagannathFeaturedSection() {
  const [selectedService, setSelectedService] = useState<(typeof services)[number] | null>(null);

  return (
    <>
      <div className="mb-6 overflow-hidden rounded-[2rem] border border-[#C9B7A4]/55 bg-[radial-gradient(circle_at_top,_rgba(245,211,137,0.18),_transparent_30%),linear-gradient(135deg,_#2A1C14_0%,_#1B120D_45%,_#2D1F15_100%)] p-4 shadow-[0_26px_80px_rgba(72,43,20,0.22)] sm:rounded-[2.25rem] sm:p-6 lg:p-7">
        <div className="grid gap-4 lg:grid-cols-[minmax(300px,1.15fr)_minmax(0,1.85fr)]">
          <div className="group relative min-h-[320px] overflow-hidden rounded-[1.75rem] border border-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.06]"
              style={{
                backgroundImage:
                  "url('/assets/jagannath_Temple.jpeg')",
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(255,214,140,0.26),transparent_24%),linear-gradient(110deg,rgba(12,8,6,0.82)_8%,rgba(18,11,8,0.38)_45%,rgba(91,45,18,0.48)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#150C08]/90 via-[#150C08]/35 to-transparent" />
            <div className="absolute inset-0 opacity-35 mix-blend-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_34%)]" />

            <div className="relative flex h-full flex-col justify-between p-6 text-[#FDFAF0] sm:p-8">
              <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] shadow-[0_10px_25px_rgba(0,0,0,0.16)] backdrop-blur-md">
                Sacred Spotlight
              </span>

              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.35em] text-white/75">Puja at</p>
                <h2
                  className="max-w-[12ch] text-4xl leading-none text-white sm:text-5xl"
                  style={{ fontFamily: "var(--font-dm-serif)" }}
                >
                  Jagannath Temple
                </h2>
                <p className="text-xl uppercase tracking-[0.45em] text-[#F5D389] sm:text-2xl">Puri</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            {services.map((service) => (
              <button
                key={service.name}
                type="button"
                onClick={() => setSelectedService(service)}
                className="group relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/[0.08] p-5 text-left text-[#FDFAF0] shadow-[0_18px_38px_rgba(0,0,0,0.2)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/[0.11] hover:shadow-[0_22px_52px_rgba(0,0,0,0.28)] sm:p-6"
              >
                <div
                  className="absolute inset-0 scale-100 opacity-[0.68] transition duration-500 group-hover:scale-[1.04] group-hover:opacity-[0.78]"
                  style={{
                    backgroundImage: `url('${service.image}')`,
                    backgroundSize: "cover",
                    backgroundPosition: service.position,
                  }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,244,214,0.22),transparent_30%),linear-gradient(180deg,rgba(20,12,7,0.16)_0%,rgba(20,12,7,0.38)_52%,rgba(20,12,7,0.72)_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,transparent_38%,rgba(255,215,145,0.08)_100%)] mix-blend-screen opacity-80" />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />

                <div className="relative space-y-3">
                  <h3 className="text-xl font-semibold leading-snug text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.42)]">
                    {service.name}
                  </h3>
                  <p className="text-2xl font-semibold text-[#F6D58C] drop-shadow-[0_6px_18px_rgba(0,0,0,0.32)]">
                    &#8377;{service.price}
                  </p>
                </div>

                <div className="relative flex items-center justify-between gap-3">
                  <span className="inline-flex items-center justify-center rounded-full border border-[#F0D8A0]/35 bg-[#F0D8A0]/10 px-4 py-2 text-sm font-semibold text-[#FFF7E4] transition group-hover:bg-[#F0D8A0]/15">
                    Book Now
                  </span>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-white/15">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ServiceModal
        isOpen={selectedService !== null}
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </>
  );
}
