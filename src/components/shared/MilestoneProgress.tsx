"use client";

import { Flag, X, CheckCircle2 } from "lucide-react";

interface MilestoneProgressProps {
    milestones: string[];
    completedMilestones: string[];
    agentName?: string;
    serviceName?: string;
    locationName?: string;
    clientName?: string;
    createdAt?: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function MilestoneProgress({
    milestones,
    completedMilestones,
    agentName,
    serviceName,
    locationName,
    clientName,
    createdAt,
    isOpen,
    onClose,
}: MilestoneProgressProps) {

    if (!isOpen) return null;

    const completed = completedMilestones.length;

    const total = milestones.length;

    const percentage =
        total > 0
            ? (completed / total) * 100
            : 0;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">

            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden md:max-h-[88vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-amber-50">

                    <div className="flex items-center gap-3 min-w-0">

                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">

                            <Flag
                                size={18}
                                className="text-yellow-700"
                            />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-base md:text-lg font-bold text-[#2C0E0F] truncate">
                                Ritual Milestones
                            </h2>

                            <p className="text-[11px] md:text-xs text-gray-500 truncate">
                                Updated by {agentName || "Agent"}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* MOBILE LAYOUT */}
                <div className="block md:hidden overflow-y-auto max-h-[80vh]">

                    {/* Mobile Top Section */}
                    <div className="p-4 space-y-4 bg-gray-50/50 border-b border-gray-100">

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 gap-3">

                            <div className="bg-white rounded-xl p-3 border border-gray-100">

                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                                    Service
                                </p>

                                <p className="mt-1 text-sm font-bold text-gray-900 break-words">
                                    {serviceName || "-"}
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-3 border border-gray-100">

                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                                    Location
                                </p>

                                <p className="mt-1 text-sm font-bold text-gray-900 break-words">
                                    {locationName || "-"}
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-3 border border-gray-100">

                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                                    Client
                                </p>

                                <p className="mt-1 text-sm font-bold text-gray-900 break-words">
                                    {clientName || "-"}
                                </p>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        Progress
                                    </p>

                                    <p className="text-[11px] text-gray-400">
                                        Ritual completion
                                    </p>
                                </div>

                                <div className="text-right">

                                    <p className="text-xl font-bold text-[#DAA520]">
                                        {completed}/{total}
                                    </p>

                                    <p className="text-[10px] text-gray-400">
                                        Completed
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">

                                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">

                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                                        style={{
                                            width: `${percentage}%`
                                        }}
                                    />
                                </div>

                                <div className="flex justify-between text-[10px] text-gray-400">
                                    <span>0%</span>
                                    <span>{Math.round(percentage)}%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Milestones */}
                    <div className="p-4 space-y-3">

                        {milestones.map((milestone, idx) => {

                            const isCompleted =
                                completedMilestones.includes(milestone);

                            return (
                                <div
                                    key={idx}
                                    className={`rounded-xl border p-3 transition-all ${
                                        isCompleted
                                            ? "bg-green-50 border-green-200"
                                            : "bg-gray-50 border-gray-200"
                                    }`}
                                >

                                    <div className="flex items-start gap-3">

                                        {/* Icon */}
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                isCompleted
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-300 text-gray-700"
                                            }`}
                                        >

                                            {isCompleted ? (
                                                <CheckCircle2 size={16} />
                                            ) : (
                                                <span className="text-xs font-bold">
                                                    {idx + 1}
                                                </span>
                                            )}
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 min-w-0">

                                            <p
                                                className={`text-sm leading-relaxed break-words ${
                                                    isCompleted
                                                        ? "text-green-700 line-through"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {milestone}
                                            </p>

                                            <p
                                                className={`mt-1 text-[11px] ${
                                                    isCompleted
                                                        ? "text-green-600"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                {isCompleted
                                                    ? "Completed"
                                                    : "Pending"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Footer */}
                        <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500 space-y-1">

                            <p>
                                <span className="font-semibold text-gray-700">
                                    Agent:
                                </span>{" "}
                                {agentName || "Not Assigned"}
                            </p>

                            {createdAt && (
                                <p>
                                    <span className="font-semibold text-gray-700">
                                        Updated:
                                    </span>{" "}
                                    {new Date(createdAt).toLocaleDateString("en-IN")}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* DESKTOP LAYOUT */}
                <div className="hidden md:grid md:grid-cols-[280px_1fr] md:max-h-[82vh]">

                    {/* LEFT SIDE */}
                    <div className="border-r border-gray-100 p-6 bg-gray-50/50 space-y-5">

                        {/* Info */}
                        <div className="space-y-3">

                            <div className="bg-white rounded-xl p-3 border border-gray-100">

                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                                    Service
                                </p>

                                <p className="mt-1 text-sm font-bold text-gray-900">
                                    {serviceName || "-"}
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-3 border border-gray-100">

                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                                    Location
                                </p>

                                <p className="mt-1 text-sm font-bold text-gray-900 break-words">
                                    {locationName || "-"}
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-3 border border-gray-100">

                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                                    Client
                                </p>

                                <p className="mt-1 text-sm font-bold text-gray-900">
                                    {clientName || "-"}
                                </p>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        Progress
                                    </p>

                                    <p className="text-[11px] text-gray-400">
                                        Ritual completion
                                    </p>
                                </div>

                                <div className="text-right">

                                    <p className="text-2xl font-bold text-[#DAA520]">
                                        {completed}/{total}
                                    </p>

                                    <p className="text-[10px] text-gray-400">
                                        Completed
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">

                                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">

                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                                        style={{
                                            width: `${percentage}%`
                                        }}
                                    />
                                </div>

                                <div className="flex justify-between text-[10px] text-gray-400">
                                    <span>0%</span>
                                    <span>{Math.round(percentage)}%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-[11px] text-gray-500 space-y-1 pt-1">

                            <p>
                                <span className="font-semibold text-gray-700">
                                    Agent:
                                </span>{" "}
                                {agentName || "Not Assigned"}
                            </p>

                            {createdAt && (
                                <p>
                                    <span className="font-semibold text-gray-700">
                                        Updated:
                                    </span>{" "}
                                    {new Date(createdAt).toLocaleDateString("en-IN")}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="p-6 overflow-y-auto max-h-[82vh]">

                        <div className="space-y-3">

                            {milestones.map((milestone, idx) => {

                                const isCompleted =
                                    completedMilestones.includes(milestone);

                                return (
                                    <div
                                        key={idx}
                                        className={`rounded-xl border p-3 transition-all ${
                                            isCompleted
                                                ? "bg-green-50 border-green-200"
                                                : "bg-gray-50 border-gray-200"
                                        }`}
                                    >

                                        <div className="flex items-start gap-3">

                                            {/* Icon */}
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                    isCompleted
                                                        ? "bg-green-500 text-white"
                                                        : "bg-gray-300 text-gray-700"
                                                }`}
                                            >

                                                {isCompleted ? (
                                                    <CheckCircle2 size={16} />
                                                ) : (
                                                    <span className="text-xs font-bold">
                                                        {idx + 1}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1 min-w-0">

                                                <p
                                                    className={`text-sm leading-relaxed break-words ${
                                                        isCompleted
                                                            ? "text-green-700 line-through"
                                                            : "text-gray-700"
                                                    }`}
                                                >
                                                    {milestone}
                                                </p>

                                                <p
                                                    className={`mt-1 text-[11px] ${
                                                        isCompleted
                                                            ? "text-green-600"
                                                            : "text-gray-400"
                                                    }`}
                                                >
                                                    {isCompleted
                                                        ? "Completed"
                                                        : "Pending"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}