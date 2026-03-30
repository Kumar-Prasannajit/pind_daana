"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PujaServicesContent from "@/components/PujaServicesContent";
import SpecialPujasContent from "@/components/SpecialPujasContent";
import ServicesSelection from "@/components/ServicesSelection";

function BookPujaInner() {
    const searchParams = useSearchParams();
    const serviceId = searchParams?.get("serviceId");
    const type = searchParams?.get("type");

    if (serviceId) {
        if (type === "service") {
            return (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100/50">
                    <ServicesSelection
                        initialServiceId={serviceId}
                        lockServiceSelection
                        showBackButton={true}
                        title="Select Location"
                        subtitle="Choose a sacred location to perform your ritual."
                    />
                </div>
            );
        }

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
