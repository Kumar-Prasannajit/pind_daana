"use client";

import { useState } from "react";
import { Flag, ChevronDown, ChevronUp } from "lucide-react";

interface MilestoneProgressProps {
    completedMilestones: string[];
    availableMilestones: string[];
    bookingId: string;
}

export default function MilestoneProgress({
    completedMilestones,
    availableMilestones,
    bookingId,
}: MilestoneProgressProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Return nothing if no milestones available
    if (!availableMilestones || availableMilestones.length === 0) {
        return null;
    }

    const completed = completedMilestones?.length || 0;
    const total = availableMilestones.length;
    const percentage = (completed / total) * 100;

    return (
        <div className="mt-3 pt-3 border-t border-gray-200">
            {/* Header with progress indicator */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between gap-3 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Flag size={14} className="text-[#DAA520]" />
                    <span>Milestones</span>
                    <span className="text-xs font-medium text-gray-500">
                        ({completed}/{total})
                    </span>
                </div>
                {isExpanded ? (
                    <ChevronUp size={16} className="text-gray-400" />
                ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                )}
            </button>

            {/* Progress bar */}
            <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                    {Math.round(percentage)}%
                </span>
            </div>

            {/* Expandable milestone list */}
            {isExpanded && (
                <div className="mt-3 space-y-2 pt-3 border-t border-gray-100">
                    {availableMilestones.map((milestone, idx) => {
                        const isCompleted = completedMilestones?.includes(milestone);
                        return (
                            <div
                                key={idx}
                                className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
                                    isCompleted
                                        ? "bg-green-50 text-green-700"
                                        : "bg-gray-50 text-gray-700"
                                }`}
                            >
                                {/* Checkmark indicator */}
                                <div
                                    className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        isCompleted
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-300 text-gray-500"
                                    }`}
                                >
                                    {isCompleted ? "✓" : "○"}
                                </div>
                                <span className={isCompleted ? "line-through" : ""}>
                                    {milestone}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
