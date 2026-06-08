"use client";

import { Flag, X, CheckCircle2 } from "lucide-react";
import { PROOF_SENT_MILESTONE } from "@/lib/milestones";

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
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    const MilestoneItem = ({
        milestone,
        idx,
    }: {
        milestone: string;
        idx: number;
    }) => {
        const isCompleted = completedMilestones.includes(milestone);
        const isFinal = milestone.toLowerCase() === PROOF_SENT_MILESTONE.toLowerCase();

        return (
            <div
                className={`rounded-xl border p-3 transition-all ${
                    isCompleted
                        ? isFinal
                            ? "bg-amber-50 border-amber-200"
                            : "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                }`}
            >
                <div className="flex items-start gap-3">
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted
                                ? isFinal
                                    ? "bg-amber-500 text-white"
                                    : "bg-green-500 text-white"
                                : "bg-gray-300 text-gray-700"
                        }`}
                    >
                        {isCompleted ? (
                            <CheckCircle2 size={16} />
                        ) : (
                            <span className="text-xs font-bold">{idx + 1}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p
                            className={`text-sm leading-relaxed break-words ${
                                isCompleted
                                    ? isFinal
                                        ? "text-amber-700 font-semibold"
                                        : "text-green-700 line-through"
                                    : "text-gray-700"
                            }`}
                        >
                            {milestone}
                            {isFinal && (
                                <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider align-middle">
                                    Final
                                </span>
                            )}
                        </p>
                        <p
                            className={`mt-1 text-[11px] ${
                                isCompleted
                                    ? isFinal
                                        ? "text-amber-600"
                                        : "text-green-600"
                                    : "text-gray-400"
                            }`}
                        >
                            {isCompleted ? "Completed" : "Pending"}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden md:max-h-[88vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-amber-50">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                            <Flag size={18} className="text-yellow-700" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base md:text-lg font-bold text-[#2C0E0F] truncate">
                                Ritual Milestones
                            </h2>
                            <p className="text-[11px] md:text-xs text-gray-500 truncate">
                                {agentName ? `Updated by ${agentName}` : serviceName || ""}
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

                {/* MOBILE */}
                <div className="block md:hidden overflow-y-auto max-h-[80vh]">
                    <div className="p-4 space-y-4 bg-gray-50/50 border-b border-gray-100">
                        <div className="grid grid-cols-1 gap-3">
                            <InfoCard label="Service" value={serviceName || "—"} />
                            <InfoCard label="Location" value={locationName || "—"} />
                            <InfoCard label="Client" value={clientName || "—"} />
                        </div>
                        <ProgressBar completed={completed} total={total} percentage={percentage} />
                    </div>
                    <div className="p-4 space-y-3">
                        {milestones.map((m, i) => <MilestoneItem key={i} milestone={m} idx={i} />)}
                        <MilestoneFooter agentName={agentName} createdAt={createdAt} />
                    </div>
                </div>

                {/* DESKTOP */}
                <div className="hidden md:grid md:grid-cols-[280px_1fr] md:max-h-[82vh]">
                    <div className="border-r border-gray-100 p-6 bg-gray-50/50 space-y-5">
                        <div className="space-y-3">
                            <InfoCard label="Service" value={serviceName || "—"} />
                            <InfoCard label="Location" value={locationName || "—"} />
                            <InfoCard label="Client" value={clientName || "—"} />
                        </div>
                        <ProgressBar completed={completed} total={total} percentage={percentage} />
                        <MilestoneFooter agentName={agentName} createdAt={createdAt} />
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[82vh]">
                        <div className="space-y-3">
                            {milestones.map((m, i) => <MilestoneItem key={i} milestone={m} idx={i} />)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
            <p className="mt-1 text-sm font-bold text-gray-900 break-words">{value}</p>
        </div>
    );
}

function ProgressBar({
    completed,
    total,
    percentage,
}: {
    completed: number;
    total: number;
    percentage: number;
}) {
    return (
        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-800">Progress</p>
                    <p className="text-[11px] text-gray-400">Ritual completion</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-[#DAA520]">{completed}/{total}</p>
                    <p className="text-[10px] text-gray-400">Completed</p>
                </div>
            </div>
            <div className="space-y-1.5">
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                    <span>0%</span>
                    <span>{Math.round(percentage)}%</span>
                    <span>100%</span>
                </div>
            </div>
        </div>
    );
}

function MilestoneFooter({
    agentName,
    createdAt,
}: {
    agentName?: string;
    createdAt?: string;
}) {
    return (
        <div className="text-[11px] text-gray-500 space-y-1 pt-1">
            <p>
                <span className="font-semibold text-gray-700">Agent:</span>{" "}
                {agentName || "Not Assigned"}
            </p>
            {createdAt && (
                <p>
                    <span className="font-semibold text-gray-700">Updated:</span>{" "}
                    {new Date(createdAt).toLocaleDateString("en-IN")}
                </p>
            )}
        </div>
    );
}