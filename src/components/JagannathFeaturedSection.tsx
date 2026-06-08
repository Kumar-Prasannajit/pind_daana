"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import ServiceModal from "@/components/ServiceModal";

const FALLBACK_IMAGE = "/assets/jagannath_Temple.jpeg";

interface PuriPujaItem {
  _id: string;
  name: string;
  price?: number; // legacy
  pricing?: { name: string; amount: number }[];
  imageUrl?: string;
  significance: string;
}

interface ServiceItem {
  _id: string;
  name: string;
  pricing: { name: string; amount: number }[];
  image: string;
  position: string;
  significance?: string; // Add significance for modal description
}

export default function JagannathFeaturedSection() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  useEffect(() => {
    const fetchPuriPujas = async () => {
      try {
        const res = await fetch("/api/puri-pujas");
        if (!res.ok) throw new Error("Failed to fetch");
        const data: PuriPujaItem[] = await res.json();
        const mapped: ServiceItem[] = data.map((p) => {
          let pricing = p.pricing || [];
          if (pricing.length === 0 && p.price !== undefined) {
            pricing = [{ name: "Standard", amount: p.price }];
          }
          return {
            _id: p._id,
            name: p.name,
            pricing: pricing,
            image: p.imageUrl || FALLBACK_IMAGE,
            position: "center",
            significance: p.significance,
          };
        });
        setServices(mapped);
      } catch (err) {
        console.error("Error fetching puri pujas:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPuriPujas();
  }, []);

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
            {isLoading ? (
              /* Loading skeleton — matches card dimensions */
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/[0.08] p-5 animate-pulse sm:p-6"
                >
                  <div className="h-5 w-3/4 rounded-full bg-white/10" />
                  <div className="space-y-3">
                    <div className="h-4 w-1/2 rounded-full bg-white/10" />
                    <div className="h-6 w-1/3 rounded-full bg-white/10" />
                  </div>
                </div>
              ))
            ) : services.length === 0 ? (
              <div className="col-span-3 flex items-center justify-center min-h-[190px] rounded-[1.75rem] border border-white/12 bg-white/[0.05] text-white/50 text-sm tracking-wide">
                No Puri Pujas added yet
              </div>
            ) : (
              services.map((service) => (
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

                  </div>

                  <div className="relative flex items-end justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] font-medium text-white/55 uppercase tracking-widest leading-none pl-4">
                        just at
                      </span>
                      <span className="inline-flex items-center rounded-full border border-[#F0D8A0]/35 bg-[#F0D8A0]/10 px-4 py-2 transition group-hover:bg-[#F0D8A0]/15">
                        <span className="text-sm font-semibold text-[#F6D58C]">
                          {service.pricing && service.pricing.length > 0
                            ? `₹${Math.min(...service.pricing.map((p) => p.amount))}`
                            : "Price on request"}
                        </span>
                      </span>
                    </div>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-white/15">
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                </button>
              ))
            )}
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
