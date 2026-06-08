"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    _id?: string;
    name: string;
    pricing: { name: string; amount: number }[];
    significance?: string;
  } | null;
}

export default function ServiceModal({ isOpen, onClose, service }: ServiceModalProps) {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<{ name: string; amount: number } | null>(null);

  useEffect(() => {
    if (service && service.pricing && service.pricing.length > 0) {
      setSelectedPackage(service.pricing[0]);
    } else {
      setSelectedPackage(null);
    }
  }, [service]);

  if (!isOpen || !service || !selectedPackage) {
    return null;
  }

  const handleBookNow = () => {
    const hasAuthCookie = document.cookie
      .split(";")
      .some((item) => item.trim().startsWith("client_auth_status="));

    const fullPackageName = selectedPackage.name === "Standard" 
      ? service.name 
      : `${service.name} (${selectedPackage.name})`;

    const queryParams = new URLSearchParams({
      packageName: fullPackageName,
      price: String(selectedPackage.amount),
      source: "puri-puja",
      ...(service._id ? { puriPujaId: service._id } : {}),
    }).toString();

    const checkoutUrl = `/checkout?${queryParams}`;

    if (hasAuthCookie) {
      router.push(checkoutUrl);
    } else {
      router.push(`/client/login?redirect=${encodeURIComponent(checkoutUrl)}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
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
              {service.significance ? service.significance : (
                <>
                  A sacred temple ritual curated for peace, blessings, and spiritual wellbeing. This is a
                  preview offering for the Jagannath Temple experience and will be connected to booking
                  flows later.
                </>
              )}
            </p>

            {service.pricing.length > 1 ? (
              <div className="space-y-3 mt-4">
                <p className="text-sm font-medium text-white/90 mb-2">Select Package</p>
                {service.pricing.map((pkg, idx) => (
                  <label
                    key={idx}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                      selectedPackage.name === pkg.name
                        ? "border-[#DAA520] bg-[#DAA520]/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          selectedPackage.name === pkg.name
                            ? "border-[#DAA520]"
                            : "border-white/40"
                        }`}
                      >
                        {selectedPackage.name === pkg.name && (
                          <div className="h-2.5 w-2.5 rounded-full bg-[#DAA520]" />
                        )}
                      </div>
                      <span className="text-white/90">{pkg.name}</span>
                    </div>
                    <span className="font-semibold text-[#F7D58B]">&#8377;{pkg.amount}</span>
                  </label>
                ))}
              </div>
            ) : null}

            <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/55">
                  {service.pricing.length > 1 ? "Selected Price" : "Offering Price"}
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#F7D58B]">&#8377;{selectedPackage.amount}</p>
              </div>

              <button
                type="button"
                onClick={handleBookNow}
                className="inline-flex items-center justify-center rounded-full bg-[#DAA520] px-6 py-3 text-sm font-semibold text-[#2C1A0F] transition hover:bg-[#E5B93D]"
              >
                Book Now
              </button>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-[#DAA520]/20 bg-[#DAA520]/[0.06] px-4 py-3">
              <span className="mt-0.5 shrink-0 text-[#DAA520]">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </span>
              <p className="text-[11px] leading-relaxed text-white/50">
                Due to the sacred rules and regulations of the Jagannath Temple, photography and video recording inside the temple premises are strictly prohibited. Therefore, one of the Manima representatives will visit the temple on your behalf to perform the puja and respectfully record devotional video updates and geotagged visuals from outside the temple premises and share them with the devotee. The puja will be performed as per temple traditions, however, only videos captured from outside the temple premises can be provided, as shooting inside the temple is not permitted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
