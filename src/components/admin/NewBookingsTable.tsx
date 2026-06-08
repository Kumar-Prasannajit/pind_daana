"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, UserPlus, Calendar, MapPin, DollarSign, Search, Filter, ShieldCheck, UserCheck, Eye, X, Flag } from "lucide-react";
import MilestoneProgress from "@/components/shared/MilestoneProgress";
import { markPaymentCompleted, mergeMilestones, withPaymentCompletedMilestone } from "@/lib/milestones";

interface LocationService {
    service: string | { _id: string; name: string };
    milestones?: string[];
}

interface Booking {
    _id: string;
    client: { _id: string; name: string; email: string; phone: string };
    service?: { _id?: string; name: string; milestones?: string[] };
    puja?: {
        name: string;
        location?: string;
        services?: {
            service: string | { _id: string; name: string; milestones?: string[] };
            packages?: { name: string; priceAmount: number }[];
        }[];
    };
    pujaService?: { _id?: string; name: string; milestones?: string[] };
    puriPuja?: { name: string; milestones?: string[] };
    location: {
        name: string;
        services?: LocationService[];
    };
    completedMilestones?: string[];
    price: number;
    priceCategory: string;
    paymentMethod: string;
    transactionId?: string;
    isPaymentVerified: boolean;
    status: string;
    agent?: { _id: string; name: string; phone: string };
    createdAt: string;
}

interface Agent {
    _id: string;
    name: string;
    phone: string;
}

export default function NewBookingsTable() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal State - Verification Modal
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [formData, setFormData] = useState({
        isPaymentVerified: false,
        agentId: "",
    });

    // Modal State - Milestone Modal
    const [milestoneModalBooking, setMilestoneModalBooking] = useState<Booking | null>(null);

    // Filter State
    const [filterStatus, setFilterStatus] = useState("All");

    const getAvailableMilestones = (booking: Booking): string[] => {
        const serviceId = booking.service?._id;
        const locationServiceMilestones = serviceId
            ? booking.location?.services?.find((entry) => {
                const entryServiceId = typeof entry.service === "string" ? entry.service : entry.service?._id;
                return entryServiceId === serviceId;
            })?.milestones
            : undefined;

        // Fallback: If pujaService is not directly set/populated, find the service under puja that contains the booked package
        const pujaFallbackMilestones = booking.pujaService?.milestones || (
            booking.puja?.services?.find((entry) => {
                return entry.packages?.some((pkg) => pkg.name === booking.priceCategory);
            })?.service as any
        )?.milestones;

        return withPaymentCompletedMilestone(
            mergeMilestones(
                booking.puriPuja?.milestones,
                pujaFallbackMilestones,
                booking.service?.milestones,
                locationServiceMilestones,
                booking.location?.services?.flatMap((entry) => entry.milestones || [])
            )
        );
    };

    const getCompletedMilestones = (booking: Booking): string[] =>
        booking.isPaymentVerified
            ? markPaymentCompleted(booking.completedMilestones || [])
            : booking.completedMilestones || [];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [bookingsRes, agentsRes] = await Promise.all([
                fetch('/api/admin/bookings'),
                fetch('/api/agents')
            ]);

            if (bookingsRes.ok) {
                const data = await bookingsRes.json();
                setBookings(data);
            }
            if (agentsRes.ok) {
                const data = await agentsRes.json();
                setAgents(data);
            }
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setFormData({
            isPaymentVerified: booking.isPaymentVerified,
            agentId: booking.agent?._id || "",
        });
    };

    const handleCloseModal = () => {
        setSelectedBooking(null);
        setFormData({ isPaymentVerified: false, agentId: "" });
    };

    const handleSubmit = async () => {
        if (!selectedBooking) return;
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/bookings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: selectedBooking._id,
                    isPaymentVerified: formData.isPaymentVerified,
                    agentId: formData.agentId || undefined
                })
            });

            if (res.ok) {
                const { booking } = await res.json();
                // Update local state
                setBookings(prev => prev.map(b =>
                    b._id === selectedBooking._id ? {
                        ...b,
                        isPaymentVerified: booking.isPaymentVerified,
                        agent: booking.agent,
                        status: booking.status,
                        paymentStatus: booking.paymentStatus // Update payment status
                    } : b
                ));
                handleCloseModal();
            }
        } catch (error) {
            console.error("Update failed", error);
        } finally {
            setActionLoading(false);
        }
    };

    const filteredBookings = bookings.filter(b => {
        if (filterStatus === "Pending Payment") return !b.isPaymentVerified;
        if (filterStatus === "Pending Agent") return b.isPaymentVerified && !b.agent;
        if (filterStatus === "Confirmed") return b.status === "Confirmed";
        return true;
    });

    if (loading) return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative animate-pulse">
            <div className="p-6 border-b border-gray-100 flex justify-between">
                <div>
                    <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-64"></div>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-gray-200 rounded-lg w-20"></div>)}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            {[1, 2, 3, 4, 5].map(i => <th key={i} className="px-6 py-4"><div className="h-3 bg-gray-200 rounded w-20"></div></th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {[1, 2, 3, 4, 5].map(row => (
                            <tr key={row}>
                                {[1, 2, 3, 4, 5].map(col => (
                                    <td key={col} className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Recent Bookings</h2>
                    <p className="text-sm text-gray-500">Manage and verify client bookings</p>
                </div>

                <div className="flex gap-2 text-sm">
                    {["All", "Pending Payment", "Pending Agent", "Confirmed"].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${filterStatus === status
                                ? "bg-gray-900 text-white font-medium"
                                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-100">
                            <th className="px-6 py-4">Client Details</th>
                            <th className="px-6 py-4">Service Info</th>
                            <th className="px-6 py-4">Payment & Transaction</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredBookings.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                                    No bookings found matching filters.
                                </td>
                            </tr>
                        ) : (
                            filteredBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 text-sm">{booking.client?.name || "Unknown"}</span>
                                            <div className="flex flex-col text-xs text-gray-500 mt-0.5">
                                                <span>{booking.client?.phone}</span>
                                                <span className="text-gray-400">{booking.client?.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                                                <Calendar size={14} className="text-[#DAA520]" />
                                                {booking.service?.name || booking.puja?.name || booking.puriPuja?.name || "Booking"}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <MapPin size={12} />
                                                {booking.location?.name || booking.puja?.location || (booking.puriPuja ? "Jagannath Temple, Puri" : "-")}
                                            </div>
                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded w-fit">
                                                {booking.priceCategory}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-gray-800 text-sm">₹{booking.price.toLocaleString('en-IN')}</span>
                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${booking.paymentMethod === 'qr' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
                                                    }`}>
                                                    {booking.paymentMethod || "N/A"}
                                                </span>
                                            </div>

                                            {booking.transactionId ? (
                                                <div className="flex flex-col gap-1 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Transaction ID</span>
                                                    <div className="flex items-center gap-2 group-hover:gap-1 transition-all">
                                                        <span className="font-mono text-xs text-gray-700 font-medium break-all select-all">
                                                            {booking.transactionId}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No Reference ID</span>
                                            )}

                                            {booking.isPaymentVerified ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                                                    <ShieldCheck size={10} /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full w-fit">
                                                    Payment Pending
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {booking.status === "Confirmed" ? (
                                            <div className="flex flex-col gap-1.5">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                                                    <CheckCircle size={10} /> Confirmed
                                                </span>
                                                {booking.agent ? (
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1 text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                                                            <UserCheck size={12} className="text-blue-600" />
                                                            <span className="font-medium">{booking.agent.name}</span>
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 ml-1 mt-0.5">{booking.agent.phone}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                                                        <UserPlus size={12} /> Assign Agent
                                                    </span>
                                                )}
                                                {getAvailableMilestones(booking).length > 0 && (
                                                    <button
                                                        onClick={() => setMilestoneModalBooking(booking)}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition-colors w-fit"
                                                    >
                                                        <Flag size={11} />
                                                        Milestones ({getCompletedMilestones(booking).length}/{getAvailableMilestones(booking).length})
                                                    </button>
                                                )}
                                            </div>
                                        ) : booking.status === "Pending" ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 w-fit">
                                                Order Pending
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 w-fit">
                                                {booking.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleOpenModal(booking)}
                                            className="p-2 text-gray-500 hover:text-[#DAA520] hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-100"
                                            title="View Details & Verify"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Verification Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">Manage Booking</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Info */}
                            <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Service</span>
                                    <span className="font-medium text-gray-900">{selectedBooking.service?.name || selectedBooking.puja?.name || selectedBooking.puriPuja?.name || "Booking"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Amount</span>
                                    <span className="font-bold text-[#2C0E0F]">₹{selectedBooking.price}</span>
                                </div>
                                {selectedBooking.transactionId && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Transaction ID</span>
                                        <span className="font-mono text-gray-700 bg-yellow-100 px-1 rounded">{selectedBooking.transactionId}</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions Form */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.isPaymentVerified ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                                        {formData.isPaymentVerified && <CheckCircle size={14} className="text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.isPaymentVerified}
                                        disabled={selectedBooking.paymentMethod === "razorpay"}
                                        onChange={(e) => setFormData({ ...formData, isPaymentVerified: e.target.checked })}
                                    />
                                    <span className="font-medium text-gray-700">
                                        {selectedBooking.paymentMethod === "razorpay" ? "Razorpay Payment Verified" : "Verified Payment"}
                                    </span>
                                </label>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assign Pandit (Agent)</label>
                                    <select
                                        value={formData.agentId}
                                        onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-manima-gold/50"
                                    >
                                        <option value="">Select Pandit...</option>
                                        {agents.map(agent => (
                                            <option key={agent._id} value={agent._id}>{agent.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={actionLoading}
                                className="w-full py-3 bg-[#2C0E0F] text-[#DAA520] font-bold rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                Update Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Shared Milestone Modal */}
            {milestoneModalBooking && (
                <MilestoneProgress
                    milestones={getAvailableMilestones(milestoneModalBooking)}
                    completedMilestones={
                        getCompletedMilestones(milestoneModalBooking)
                    }
                    agentName={milestoneModalBooking.agent?.name}
                    serviceName={milestoneModalBooking.service?.name || milestoneModalBooking.puja?.name || milestoneModalBooking.puriPuja?.name}
                    locationName={milestoneModalBooking.location?.name || milestoneModalBooking.puja?.location || (milestoneModalBooking.puriPuja ? "Jagannath Temple, Puri" : undefined)}
                    clientName={milestoneModalBooking.client?.name}
                    createdAt={milestoneModalBooking.createdAt}
                    isOpen={!!milestoneModalBooking}
                    onClose={() => setMilestoneModalBooking(null)}
                />
            )}
        </div>
    );
}
