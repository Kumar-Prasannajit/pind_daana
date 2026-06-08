"use client";

import { useEffect, useState } from "react";
import {
    MessageSquareHeart,
    CheckCircle2,
    XCircle,
    Loader2,
    User,
    Star,
    Clock,
    Trash2,
} from "lucide-react";

interface Testimonial {
    _id: string;
    clientName: string;
    pujaOrServiceOpted: string;
    comment: string;
    rating?: number;
    adminApproved: boolean;
    createdAt: string;
}

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
    const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
    const [toggling, setToggling] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    async function fetchTestimonials() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/testimonials");
            if (res.ok) {
                const data = await res.json();
                setTestimonials(data);
            }
        } catch (err) {
            console.error("Failed to fetch testimonials:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleToggle(id: string, current: boolean) {
        setToggling(id);
        try {
            const res = await fetch("/api/admin/testimonials", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, adminApproved: !current }),
            });
            if (res.ok) {
                setTestimonials((prev) =>
                    prev.map((t) =>
                        t._id === id ? { ...t, adminApproved: !current } : t
                    )
                );
            }
        } catch (err) {
            console.error("Toggle failed:", err);
        } finally {
            setToggling(null);
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm("Delete this testimonial? This cannot be undone.")) return;
        setDeleting(id);
        try {
            const res = await fetch("/api/admin/testimonials", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                setTestimonials((prev) => prev.filter((t) => t._id !== id));
            }
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            setDeleting(null);
        }
    }

    const filtered = testimonials.filter((t) => {
        if (filter === "approved" && !t.adminApproved) return false;
        if (filter === "pending" && t.adminApproved) return false;
        if (ratingFilter !== "all" && (t.rating ?? 5) !== ratingFilter) return false;
        return true;
    });

    const approvedCount = testimonials.filter((t) => t.adminApproved).length;
    const pendingCount = testimonials.filter((t) => !t.adminApproved).length;

    return (
        <div className="space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    label="Total Testimonials"
                    value={testimonials.length}
                    icon={<MessageSquareHeart size={20} />}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    label="Approved"
                    value={approvedCount}
                    icon={<CheckCircle2 size={20} />}
                    color="text-green-600"
                    bg="bg-green-50"
                />
                <StatCard
                    label="Pending Review"
                    value={pendingCount}
                    icon={<Clock size={20} />}
                    color="text-amber-600"
                    bg="bg-amber-50"
                />
            </div>

            {/* Filter Tabs & Star Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                {/* Approval Filter */}
                <div className="flex items-center gap-2">
                    {(["all", "pending", "approved"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                                filter === tab
                                    ? "bg-[#2C0E0F] text-white shadow"
                                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#DAA520] hover:text-[#2C0E0F]"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Rating Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rating:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <button
                            onClick={() => setRatingFilter("all")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                ratingFilter === "all"
                                    ? "bg-[#DAA520] text-white shadow"
                                    : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            All Stars
                        </button>
                        {[5, 4, 3, 2, 1].map((stars) => {
                            const count = testimonials.filter(t => (t.rating ?? 5) === stars).length;
                            return (
                                <button
                                    key={stars}
                                    onClick={() => setRatingFilter(stars)}
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        ratingFilter === stars
                                            ? "bg-[#2C0E0F] text-[#DAA520] border border-[#DAA520] shadow"
                                            : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300"
                                    }`}
                                >
                                    {stars} <Star size={11} className="fill-current" />
                                    <span className="text-[10px] opacity-60">({count})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="animate-spin text-[#DAA520]" size={36} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <MessageSquareHeart size={32} />
                    </div>
                    <p className="text-gray-500 font-medium">
                        No {filter !== "all" ? filter : ""} testimonials found.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filtered.map((t) => (
                        <TestimonialCard
                            key={t._id}
                            testimonial={t}
                            isToggling={toggling === t._id}
                            isDeleting={deleting === t._id}
                            onToggle={() => handleToggle(t._id, t.adminApproved)}
                            onDelete={() => handleDelete(t._id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Stat Card ── */
function StatCard({
    label,
    value,
    icon,
    color,
    bg,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    bg: string;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center flex-shrink-0`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
        </div>
    );
}

/* ── Testimonial Card ── */
function TestimonialCard({
    testimonial: t,
    isToggling,
    isDeleting,
    onToggle,
    onDelete,
}: {
    testimonial: Testimonial;
    isToggling: boolean;
    isDeleting: boolean;
    onToggle: () => void;
    onDelete: () => void;
}) {
    return (
        <div
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                t.adminApproved ? "border-green-200" : "border-gray-100"
            }`}
        >
            {/* Status bar */}
            <div
                className={`h-1 w-full ${t.adminApproved ? "bg-green-400" : "bg-amber-300"}`}
            />

            <div className="p-5 space-y-4">

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#2C0E0F] text-[#DAA520] flex items-center justify-center font-bold font-serif text-lg flex-shrink-0">
                            {t.clientName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">{t.clientName}</p>
                            
                            {/* Stars Display */}
                            <div className="flex items-center gap-0.5 mt-0.5 mb-1.5">
                                {[1, 2, 3, 4, 5].map((starValue) => {
                                    const ratingVal = t.rating ?? 5;
                                    const isFilled = starValue <= ratingVal;
                                    return (
                                        <Star
                                            key={starValue}
                                            size={12}
                                            className={
                                                isFilled
                                                    ? "fill-[#DAA520] text-[#DAA520]"
                                                    : "text-gray-200"
                                            }
                                        />
                                    );
                                })}
                            </div>

                            <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#DAA520] flex-shrink-0" />
                                {t.pujaOrServiceOpted}
                            </p>
                        </div>
                    </div>
                    <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex-shrink-0 ${
                            t.adminApproved
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                    >
                        {t.adminApproved ? (
                            <><CheckCircle2 size={11} /> Approved</>
                        ) : (
                            <><Clock size={11} /> Pending</>
                        )}
                    </span>
                </div>

                {/* Comment */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        &ldquo;{t.comment}&rdquo;
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                        {new Date(t.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        })}
                    </p>

                    <div className="flex items-center gap-2">
                        {/* Delete */}
                        <button
                            onClick={onDelete}
                            disabled={isDeleting}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Delete testimonial"
                        >
                            {isDeleting ? (
                                <Loader2 size={15} className="animate-spin" />
                            ) : (
                                <Trash2 size={15} />
                            )}
                        </button>

                        {/* Approve Toggle */}
                        <button
                            onClick={onToggle}
                            disabled={isToggling}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                t.adminApproved
                                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                    : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                            } disabled:opacity-60`}
                        >
                            {isToggling ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : t.adminApproved ? (
                                <><XCircle size={14} /> Revoke</>
                            ) : (
                                <><CheckCircle2 size={14} /> Approve</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
