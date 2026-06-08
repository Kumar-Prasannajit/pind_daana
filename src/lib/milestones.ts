export const PAYMENT_COMPLETED_MILESTONE = "Payment Completed";
export const PROOF_SENT_MILESTONE = "Proof Sent to User";

const normalizeMilestone = (milestone: string) => milestone.trim().toLowerCase();

export function mergeMilestones(...milestoneLists: Array<string[] | undefined | null>) {
    const merged: string[] = [];
    const seen = new Set<string>();

    for (const milestones of milestoneLists) {
        for (const milestone of milestones || []) {
            const trimmed = milestone.trim();
            if (!trimmed) continue;

            const key = normalizeMilestone(trimmed);
            if (seen.has(key)) continue;

            seen.add(key);
            merged.push(trimmed);
        }
    }

    return merged;
}

/** Prepends "Payment Completed" and appends "Proof Sent to User" as the final milestone. */
export function withPaymentCompletedMilestone(milestones: string[] = []) {
    return mergeMilestones([PAYMENT_COMPLETED_MILESTONE], milestones, [PROOF_SENT_MILESTONE]);
}

export function markPaymentCompleted(completedMilestones: string[] = []) {
    return mergeMilestones(completedMilestones, [PAYMENT_COMPLETED_MILESTONE]);
}

/** Returns true when the last milestone ("Proof Sent to User") has been completed. */
export function isRitualFullyComplete(
    milestones: string[],
    completedMilestones: string[]
): boolean {
    if (milestones.length === 0) return false;
    const last = milestones[milestones.length - 1];
    return completedMilestones.some(
        (m) => normalizeMilestone(m) === normalizeMilestone(last)
    );
}
