"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    MapPin,
    User,
    Flag,
    MessageSquareHeart,
    Send,
    Loader2,
    ShieldCheck,
    Calendar,
    IndianRupee,
    Star,
} from "lucide-react";
import {
    withPaymentCompletedMilestone,
    mergeMilestones,
    markPaymentCompleted,
    PROOF_SENT_MILESTONE,
} from "@/lib/milestones";

/* ── Types ─────────────────────────────────────────── */
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

/* ── Milestone helpers (same as ClientBookingsList) ── */
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

function getCompletedMilestones(booking: Booking): string[] {
    return booking.isPaymentVerified
        ? markPaymentCompleted(booking.completedMilestones || [])
        : booking.completedMilestones || [];
}

/* ── Page ────────────────────────────────────────────── */
export default function BookingProgressPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    /* Feedback form */
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [feedbackError, setFeedbackError] = useState("");
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);

    useEffect(() => {
        async function fetchBooking() {
            try {
                const res = await fetch(`/api/client/booking/${id}`);
                if (res.status === 401) {
                    router.push("/client/login");
                    return;
                }
                if (!res.ok) {
                    router.push("/client/dashboard");
                    return;
                }
                const data = await res.json();
                setBooking(data);
            } catch {
                router.push("/client/dashboard");
            } finally {
                setLoading(false);
            }
        }
        fetchBooking();
    }, [id, router]);

    async function handleSubmitFeedback() {
        if (!booking) return;
        if (comment.trim().length < 10) {
            setFeedbackError("Please write at least 10 characters.");
            return;
        }
        setFeedbackError("");
        setSubmitting(true);
        try {
            const res = await fetch("/api/client/testimonials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pujaOrServiceOpted:
                        booking.service?.name ||
                        booking.puja?.name ||
                        booking.puriPuja?.name ||
                        "Unknown Service",
                    comment: comment.trim(),
                    rating,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setFeedbackError(data.error || "Failed to submit feedback.");
            } else {
                setSubmitted(true);
                setShowFeedbackForm(false);
            }
        } catch {
            setFeedbackError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#DAA520]" size={40} />
            </div>
        );
    }

    if (!booking) return null;

    const milestones = getAvailableMilestones(booking);
    const completedMilestones = getCompletedMilestones(booking);
    const completed = completedMilestones.length;
    const total = milestones.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const serviceName =
        booking.service?.name || booking.puja?.name || booking.puriPuja?.name || "Service";
    const locationName =
        booking.location?.name ||
        booking.puja?.location ||
        (booking.puriPuja ? "Jagannath Temple, Puri" : "");

    /* Last milestone ("Proof Sent to User") completed → show feedback */
    const lastMilestone = milestones[milestones.length - 1];
    const ritualFullyComplete =
        milestones.length > 0 &&
        lastMilestone?.toLowerCase() === PROOF_SENT_MILESTONE.toLowerCase() &&
        completedMilestones.some(
            (m) => m.toLowerCase() === PROOF_SENT_MILESTONE.toLowerCase()
        );

    return (
        <div className="min-h-screen bg-[#F5F6F8] font-sans">

            {/* ── Top Nav ── */}
            <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#2C0E0F] transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                    <div className="h-5 w-px bg-gray-200" />
                    <span className="text-sm font-semibold text-[#2C0E0F] truncate">
                        Ritual Progress — {serviceName}
                    </span>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">

                {/* ── Hero Card ── */}
                <div className="relative overflow-hidden rounded-2xl bg-[#2C0E0F] text-white shadow-xl">
                    <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#DAA520] rounded-full opacity-10 blur-3xl" />
                    <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex-1 space-y-2">
                            <span className="inline-block px-3 py-1 rounded-full bg-[#DAA520]/20 text-[#DAA520] text-xs font-bold uppercase tracking-widest border border-[#DAA520]/20">
                                Ritual Tracker
                            </span>
                            <h1 className="text-2xl md:text-3xl font-serif font-bold leading-tight">
                                {serviceName}
                            </h1>
                            {locationName && (
                                <p className="flex items-center gap-1.5 text-white/60 text-sm">
                                    <MapPin size={14} />
                                    {locationName}
                                </p>
                            )}
                        </div>

                        {/* Progress Ring */}
                        <div className="flex items-center gap-4 md:flex-col md:items-end">
                            <div className="text-right">
                                <p className="text-4xl font-bold text-[#DAA520]">{percentage}%</p>
                                <p className="text-xs text-white/50 mt-1">
                                    {completed} of {total} milestones done
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="relative z-10 mx-6 md:mx-8 mb-6">
                        <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[#DAA520] to-amber-400 transition-all duration-700"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Content Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">

                    {/* ── LEFT: Booking details ── */}
                    <aside className="space-y-4">

                        {/* Booking info */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Booking Info
                                </p>
                            </div>
                            <div className="p-5 space-y-4">
                                <InfoRow icon={<IndianRupee size={15} className="text-[#DAA520]" />} label="Amount">
                                    ₹{booking.price.toLocaleString("en-IN")}
                                </InfoRow>
                                <InfoRow icon={<Calendar size={15} className="text-[#DAA520]" />} label="Booked On">
                                    {new Date(booking.bookingDate || booking.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </InfoRow>
                                <InfoRow icon={<ShieldCheck size={15} className="text-[#DAA520]" />} label="Status">
                                    <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                            booking.status === "Confirmed"
                                                ? "bg-green-50 text-green-700 border border-green-100"
                                                : booking.status === "Pending"
                                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                                : "bg-gray-50 text-gray-600 border border-gray-100"
                                        }`}
                                    >
                                        {booking.status}
                                    </span>
                                </InfoRow>
                                <InfoRow icon={<Clock size={15} className="text-[#DAA520]" />} label="Payment">
                                    <span className="capitalize">{booking.paymentMethod}</span>
                                    {booking.isPaymentVerified && (
                                        <span className="ml-1 text-green-600 font-bold text-xs">(Verified)</span>
                                    )}
                                </InfoRow>
                                {booking.transactionId && (
                                    <InfoRow icon={<Flag size={15} className="text-[#DAA520]" />} label="Txn ID">
                                        <span className="font-mono text-xs break-all">{booking.transactionId}</span>
                                    </InfoRow>
                                )}
                            </div>
                        </div>

                        {/* Pandit Ji */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Pandit Ji
                                </p>
                            </div>
                            <div className="p-5">
                                {booking.agent ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#2C0E0F] text-[#DAA520] flex items-center justify-center font-bold font-serif text-lg flex-shrink-0">
                                            {booking.agent.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{booking.agent.name}</p>
                                            <p className="text-xs text-gray-400">{booking.agent.phone}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">Being assigned…</p>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* ── RIGHT: Milestones ── */}
                    <section className="space-y-4">

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Milestones
                                </p>
                                <span className="text-xs font-semibold text-gray-500">
                                    {completed}/{total} completed
                                </span>
                            </div>

                            <div className="p-6 space-y-3">
                                {milestones.length === 0 && (
                                    <p className="text-sm text-gray-400 text-center py-8">
                                        No milestones configured for this booking.
                                    </p>
                                )}

                                {milestones.map((milestone, idx) => {
                                    const isCompleted = completedMilestones.includes(milestone);
                                    const isFinal =
                                        milestone.toLowerCase() === PROOF_SENT_MILESTONE.toLowerCase();

                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                                                isCompleted
                                                    ? isFinal
                                                        ? "bg-amber-50 border-amber-200"
                                                        : "bg-green-50 border-green-200"
                                                    : "bg-gray-50 border-gray-200"
                                            }`}
                                        >
                                            {/* Step circle */}
                                            <div
                                                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                                                    isCompleted
                                                        ? isFinal
                                                            ? "bg-amber-500 text-white"
                                                            : "bg-green-500 text-white"
                                                        : "bg-gray-200 text-gray-500"
                                                }`}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle2 size={18} />
                                                ) : (
                                                    idx + 1
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`font-semibold text-sm leading-relaxed ${
                                                        isCompleted
                                                            ? isFinal
                                                                ? "text-amber-800"
                                                                : "text-green-800"
                                                            : "text-gray-700"
                                                    }`}
                                                >
                                                    {milestone}
                                                    {isFinal && (
                                                        <span className="ml-2 inline-block text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider align-middle">
                                                            Final
                                                        </span>
                                                    )}
                                                </p>
                                                <p
                                                    className={`text-xs mt-0.5 ${
                                                        isCompleted
                                                            ? isFinal
                                                                ? "text-amber-600"
                                                                : "text-green-600"
                                                            : "text-gray-400"
                                                    }`}
                                                >
                                                    {isCompleted ? "✓ Completed" : "Pending"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Share Feedback — only when last milestone done ── */}
                        {ritualFullyComplete && !submitted && (
                            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#DAA520]/20 flex items-center justify-center flex-shrink-0">
                                        <MessageSquareHeart size={20} className="text-[#DAA520]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#2C0E0F]">
                                            🎉 Your ritual is complete!
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-0.5">
                                            We would love to hear about your experience. Your feedback helps others on their spiritual journey.
                                        </p>
                                    </div>
                                </div>

                                {!showFeedbackForm ? (
                                    <button
                                        onClick={() => setShowFeedbackForm(true)}
                                        className="w-full py-3 rounded-xl bg-[#DAA520] text-white font-bold text-sm hover:bg-[#c49318] transition-colors shadow-md hover:shadow-lg active:scale-[0.98]"
                                    >
                                        Share Your Feedback
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Star Rating Selector */}
                                        <div className="flex flex-col items-center gap-2 py-3 bg-white rounded-xl border border-amber-200">
                                            <span className="text-xs font-semibold text-gray-500">Your Rating</span>
                                            <div className="flex items-center gap-1.5">
                                                {[1, 2, 3, 4, 5].map((starValue) => {
                                                    const isFilled = starValue <= rating;
                                                    return (
                                                        <button
                                                            key={starValue}
                                                            type="button"
                                                            onClick={() => setRating(starValue)}
                                                            className="p-1 hover:scale-110 transition-transform focus:outline-none"
                                                            title={`${starValue} Star${starValue > 1 ? 's' : ''}`}
                                                        >
                                                            <Star
                                                                size={28}
                                                                className={`transition-colors duration-150 ${
                                                                    isFilled
                                                                        ? "fill-[#DAA520] text-[#DAA520]"
                                                                        : "text-gray-300 hover:text-amber-300"
                                                                }`}
                                                            />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <span className="text-xs font-bold text-[#2C0E0F]">
                                                {rating === 5 ? "Excellent! (5/5)" :
                                                 rating === 4 ? "Very Good (4/5)" :
                                                 rating === 3 ? "Good (3/5)" :
                                                 rating === 2 ? "Fair (2/5)" : "Poor (1/5)"}
                                            </span>
                                        </div>

                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows={5}
                                            maxLength={1000}
                                            placeholder="Describe your experience with this ritual…"
                                            className="w-full resize-none border border-amber-300 rounded-xl p-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 text-gray-700 placeholder-gray-400"
                                        />
                                        <div className="flex justify-between items-center text-xs text-gray-400">
                                            <span>{comment.length}/1000 characters</span>
                                            <span>Minimum 10 characters</span>
                                        </div>

                                        {feedbackError && (
                                            <p className="text-xs text-red-600 font-medium">{feedbackError}</p>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setShowFeedbackForm(false);
                                                    setFeedbackError("");
                                                }}
                                                disabled={submitting}
                                                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSubmitFeedback}
                                                disabled={submitting || comment.trim().length < 10}
                                                className="flex-1 py-3 rounded-xl bg-[#DAA520] text-white font-bold text-sm hover:bg-[#c49318] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                            >
                                                {submitting ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Send size={16} />
                                                )}
                                                Submit Feedback
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {submitted && (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-2">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={24} className="text-green-600" />
                                </div>
                                <h3 className="font-bold text-green-800">Thank you for your feedback!</h3>
                                <p className="text-sm text-green-700">
                                    Your testimonial has been submitted and will appear on our website after admin review.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

/* ── Utility subcomponent ── */
function InfoRow({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">{icon}</div>
            <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{label}</p>
                <div className="text-sm font-semibold text-gray-800 mt-0.5">{children}</div>
            </div>
        </div>
    );
}
