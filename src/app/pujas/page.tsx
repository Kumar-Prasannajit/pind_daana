"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import PujaServicesContent from "@/components/PujaServicesContent";

export default function PujaServicePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#FDFAF5]">
                <Loader2 className="animate-spin text-[#D35400] w-12 h-12" />
            </div>
        }>
            <PujaServicesContent />
        </Suspense>
    );
}
