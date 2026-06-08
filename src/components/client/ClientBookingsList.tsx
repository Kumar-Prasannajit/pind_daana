"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Calendar,
    Clock,
    Loader2,
    MapPin,
    ShieldCheck,
    User,
    Flag,
} from "lucide-react";
import { withPaymentCompletedMilestone, mergeMilestones } from "@/lib/milestones";

interface LocationService {
    service: string | { _id: string; name: string };
    milestones?: string[];
}

interface Booking {
    _id: string;
    service?: { _id?: string; name: string; milestones?: string[] };
    location?: { name: string; services?: LocationService[] };
    puja?: {
        name: string;
        location: string;
        services?: {
            service: string | { _id: string; name: string; milestones?: string[] };
            packages?: { name: string; priceAmount: number }[];
        }[];
    };
    pujaService?: { name: string; milestones?: string[] };
    puriPuja?: { name: string; milestones?: string[] };
    price: number;
    priceCategory?: string;
    paymentMethod: string;
    transactionId?: string;
    isPaymentVerified: boolean;
    status: string;
    agent?: { name: string; phone: string };
    completedMilestones?: string[];
    createdAt: string;
    bookingDate: string;
}

function getAvailableMilestones(booking: Booking): string[] {
    const serviceId = booking.service?._id;
    const locationServiceMilestones = serviceId
        ? booking.location?.services?.find((e) => {
              const id = typeof e.service === "string" ? e.service : e.service?._id;
              return id === serviceId;
          })?.milestones
        : undefined;

    const pujaFallbackMilestones =
        booking.pujaService?.milestones ||
        (
            booking.puja?.services?.find((e) =>
                e.packages?.some((p) => p.name === booking.priceCategory)
            )?.service as any
        )?.milestones;

    return withPaymentCompletedMilestone(
        mergeMilestones(
            booking.puriPuja?.milestones,
            pujaFallbackMilestones,
            booking.service?.milestones,
            locationServiceMilestones,
            booking.location?.services?.flatMap((e) => e.milestones || [])
        )
    );
}

export default function ClientBookingsList() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBookings() {
            try {
                const res = await fetch("/api/client/bookings");
                if (res.ok) {
                    const data = await res.json();
                    setBookings(data);
                }
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBookings();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-[#DAA520]" size={40} />
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <Calendar size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Bookings Yet</h3>
                <p className="text-gray-500 text-base">
                    Book a ritual to get started with your spiritual journey.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-[#2C0E0F] flex items-center gap-3">
                    <Calendar className="text-[#DAA520]" size={28} />
                    My Bookings
                </h2>
                <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                    {bookings.length} {bookings.length === 1 ? "Booking" : "Bookings"}
                </span>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.map((booking) => {
                    const milestones = getAvailableMilestones(booking);
                    const completedCount = booking.isPaymentVerified
                        ? [...new Set([...(booking.completedMilestones || []), "Payment Completed"])].length
                        : (booking.completedMilestones || []).length;
                    const progressPct =
                        milestones.length > 0
                            ? Math.round((completedCount / milestones.length) * 100)
                            : 0;

                    return (
                        <div
                            key={booking._id}
                            className="group bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 relative overflow-hidden flex flex-col"
                        >
                            {/* Left accent */}
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#DAA520] to-[#2C0E0F]" />

                            <div className="flex-1 space-y-5">

                                {/* Service title */}
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-gray-900 font-serif leading-tight">
                                        {booking.service?.name ||
                                            booking.puja?.name ||
                                            booking.puriPuja?.name ||
                                            "Unknown Service"}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} className="text-[#DAA520]" />
                                            <span>
                                                {booking.location?.name ||
                                                    booking.puja?.location ||
                                                    (booking.puriPuja ? "Jagannath Temple, Puri" : "") ||
                                                    "—"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} className="text-[#DAA520]" />
                                            <span>
                                                {new Date(
                                                    booking.bookingDate || booking.createdAt
                                                ).toLocaleDateString("en-IN")}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status + Price */}
                                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                                    <div>
                                        {booking.status === "Confirmed" ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider border border-green-100">
                                                <ShieldCheck size={13} /> Confirmed
                                            </span>
                                        ) : booking.status === "Pending" ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider border border-amber-100">
                                                <Clock size={13} /> Pending
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider border border-gray-100">
                                                {booking.status}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold text-[#2C0E0F]">
                                        ₹{booking.price.toLocaleString("en-IN")}
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-gray-50 my-5" />

                            {/* Milestone mini-progress + CTA */}
                            {milestones.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                            <Flag size={11} />
                                            Milestones
                                        </span>
                                        <span className="text-gray-500 font-semibold">
                                            {completedCount}/{milestones.length}
                                        </span>
                                    </div>
                                    {/* Mini progress bar */}
                                    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-[#DAA520] to-amber-400 transition-all duration-500"
                                            style={{ width: `${progressPct}%` }}
                                        />
                                    </div>
                                    <button
                                        onClick={() =>
                                            router.push(`/client/booking/${booking._id}/progress`)
                                        }
                                        className="w-full mt-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C0E0F] text-[#DAA520] border border-[#DAA520]/20 hover:bg-[#3d1314] transition-all duration-200 text-sm font-semibold shadow-sm"
                                    >
                                        <Flag size={14} />
                                        View Full Progress
                                    </button>
                                </div>
                            )}

                            <div className="h-px bg-gray-50 my-5" />

                            {/* Footer: Payment + Agent */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                        Payment
                                    </span>
                                    <span className="font-semibold text-gray-700 capitalize text-sm">
                                        {booking.paymentMethod}
                                    </span>
                                    {booking.transactionId && (
                                        <span className="bg-yellow-50 text-gray-600 px-1.5 py-0.5 rounded border border-yellow-100 font-mono text-[10px] break-all">
                                            {booking.transactionId}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                        Pandit Ji
                                    </span>
                                    {booking.agent ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[#2C0E0F] text-[#DAA520] flex items-center justify-center">
                                                <User size={12} />
                                            </div>
                                            <span className="font-bold text-gray-900 text-sm">
                                                {booking.agent.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic text-sm">Assigning…</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
