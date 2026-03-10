"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PujaServicesContent from "@/components/PujaServicesContent";
import SpecialPujasContent from "@/components/SpecialPujasContent";

function BookPujaInner() {
    const searchParams = useSearchParams();
    const serviceId = searchParams?.get("serviceId");

    if (serviceId) {
        return (
            <PujaServicesContent
                showHero={false}
                showBackButton={true}
                title="Choose Temple"
                className="pb-12 bg-white"
            />
        );
    }

    return (
        <SpecialPujasContent basePath="/client/dashboard/bookpuja" />
    );
}

export default function BookPujaPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-[#D35400]">Loading...</div>}>
            <BookPujaInner />
        </Suspense>
    );
}
