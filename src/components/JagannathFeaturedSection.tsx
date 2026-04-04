"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ServiceModal from "@/components/ServiceModal";

const services = [
  { name: "Sarva Kalyan Puja", price: 5999 },
  { name: "Ekadashi Puja", price: 4999 },
  { name: "Sankranti Puja", price: 4999 },
];

export default function JagannathFeaturedSection() {
  const [selectedService, setSelectedService] = useState<(typeof services)[number] | null>(null);

  return (
    <>
      <div className="mb-6 overflow-hidden rounded-[2rem] border border-[#C9B7A4]/60 bg-[linear-gradient(135deg,_#2A1C14_0%,_#1B120D_45%,_#2D1F15_100%)] p-4 shadow-[0_22px_60px_rgba(72,43,20,0.16)] sm:rounded-[2.25rem] sm:p-6 lg:p-7">
        <div className="grid gap-4 lg:grid-cols-[minmax(300px,1.15fr)_minmax(0,1.85fr)]">
          <div className="group relative min-h-[320px] overflow-hidden rounded-[1.75rem]">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage:
                  "url('https://source.unsplash.com/800x600/?jagannath,temple')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/45 to-[#5B2D12]/60" />

            <div className="relative flex h-full flex-col justify-between p-6 text-[#FDFAF0] sm:p-8">
              <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] backdrop-blur-md">
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
                className="group relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-5 text-left text-[#FDFAF0] shadow-[0_16px_35px_rgba(0,0,0,0.18)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/[0.11] hover:shadow-[0_20px_45px_rgba(0,0,0,0.24)] sm:p-6"
              >
                <div
                  className="absolute inset-0 opacity-20 transition duration-500 group-hover:opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(255,255,255,0.18), transparent 55%), url('https://source.unsplash.com/400x300/?hindu,puja')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(255,255,255,0.05),_rgba(0,0,0,0.12))]" />

                <div className="relative space-y-3">
                  <h3 className="text-xl font-semibold leading-snug text-white">{service.name}</h3>
                  <p className="text-2xl font-semibold text-[#F6D58C]">&#8377;{service.price}</p>
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
