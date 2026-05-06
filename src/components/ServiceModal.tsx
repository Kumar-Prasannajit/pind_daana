"use client";

import { X } from "lucide-react";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    name: string;
    price: number;
  } | null;
}

export default function ServiceModal({ isOpen, onClose, service }: ServiceModalProps) {
  if (!isOpen || !service) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="jagannath-service-modal-title"
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/15 bg-[#1B140F] text-[#FDFAF0] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="relative p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(218,165,32,0.18),_transparent_42%),linear-gradient(135deg,_rgba(211,84,0,0.2),_transparent_55%)]" />

          <div className="relative space-y-6">
            <div className="space-y-3">
              <span className="inline-flex rounded-full border border-[#DAA520]/30 bg-[#DAA520]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#F8D77D]">
                Temple Offering
              </span>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-white/65">Jagannath Temple, Puri</p>
                <h3
                  id="jagannath-service-modal-title"
                  className="mt-3 text-3xl font-semibold text-white sm:text-4xl"
                  style={{ fontFamily: "var(--font-dm-serif)" }}
                >
                  {service.name}
                </h3>
              </div>
            </div>

            <p className="max-w-xl text-sm leading-7 text-white/80 sm:text-base">
              A sacred temple ritual curated for peace, blessings, and spiritual wellbeing. This is a
              preview offering for the Jagannath Temple experience and will be connected to booking
              flows later.
            </p>

            <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/55">Offering Price</p>
                <p className="mt-2 text-3xl font-semibold text-[#F7D58B]">&#8377;{service.price}</p>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-[#DAA520] px-6 py-3 text-sm font-semibold text-[#2C1A0F] transition hover:bg-[#E5B93D]"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
