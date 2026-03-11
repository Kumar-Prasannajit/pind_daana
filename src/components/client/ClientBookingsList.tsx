"use client";

import { useEffect, useState } from "react";
import { Loader2, Calendar, MapPin, ShieldCheck, Clock, User } from "lucide-react";

interface Booking {
    _id: string;
    service?: { name: string };
    location?: { name: string };
    puja?: { name: string; location: string };
    price: number;
    paymentMethod: string;
    transactionId?: string;
    isPaymentVerified: boolean;
    status: string;
    agent?: { name: string; phone: string };
    createdAt: string;
    bookingDate: string;
}

export default function ClientBookingsList() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch('/api/client/bookings');
                if (res.ok) {
                    const data = await res.json();
                    setBookings(data);
                }
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (loading) return (
        <div className="flex flex-col gap-6 w-full animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col h-full">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gray-200"></div>
                        <div className="flex-1 space-y-5 mb-5">
                            <div className="space-y-3">
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                <div className="flex gap-4">
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                                <div className="h-8 bg-gray-200 rounded w-20"></div>
                            </div>
                        </div>
                        <div className="h-px bg-gray-50 my-5"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <div className="h-3 bg-gray-200 rounded w-16"></div>
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                            <div className="flex flex-col gap-2 lg:items-end">
                                <div className="h-3 bg-gray-200 rounded w-16"></div>
                                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (bookings.length === 0) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <Calendar size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Bookings Yet</h3>
                <p className="text-gray-500 text-base mb-8">Book a ritual to get started with your spiritual journey.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-[#2C0E0F] flex items-center gap-3">
                    <Calendar className="text-[#DAA520]" size={28} />
                    My Bookings
                </h2>
                <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                    {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookings.map((booking) => (
                    <div key={booking._id} className="group bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 relative overflow-hidden flex flex-col h-full">

                        {/* Decorative Gradient Line */}
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#DAA520] to-[#2C0E0F]"></div>

                        <div className="flex-1 space-y-5">
                            {/* Service Info */}
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="text-xl font-bold text-gray-900 font-serif leading-tight">
                                        {booking.service?.name || booking.puja?.name || "Unknown Service"}
                                    </h3>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={16} className="text-[#DAA520]" />
                                        <span>{booking.location?.name || booking.puja?.location || "Unknown Location"}</span>
                                    </div>
                                    <div className="hidden md:block w-1 h-1 rounded-full bg-gray-300"></div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={16} className="text-[#DAA520]" />
                                        <span>{new Date(booking.bookingDate || booking.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status and Price flex container */}
                            <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                                <div>
                                    {booking.status === "Confirmed" ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider border border-green-100 shadow-sm">
                                            <ShieldCheck size={14} /> Confirmed
                                        </span>
                                    ) : booking.status === "Pending" ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider border border-amber-100 shadow-sm">
                                            <Clock size={14} /> Pending
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider border border-gray-100">
                                            {booking.status}
                                        </span>
                                    )}
                                </div>
                                <p className="text-2xl font-bold text-[#2C0E0F]">₹{booking.price.toLocaleString('en-IN')}</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gray-50 my-5"></div>

                        {/* Bottom Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                            {/* Payment Info */}
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Payment</span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-gray-700 capitalize text-sm">{booking.paymentMethod}</span>
                                    {booking.transactionId && (
                                        <span className="bg-yellow-50 text-gray-600 px-1.5 py-0.5 rounded border border-yellow-100 font-mono text-[10px] break-all">
                                            {booking.transactionId}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Agent Info */}
                            <div className="flex flex-col gap-1 lg:items-end">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Pandit Ji</span>
                                {booking.agent ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-[#2C0E0F] text-[#DAA520] flex items-center justify-center border border-white shadow-sm">
                                            <User size={12} />
                                        </div>
                                        <span className="font-bold text-gray-900 text-sm">{booking.agent.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic text-sm">Assigning...</span>
                                )}
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}
