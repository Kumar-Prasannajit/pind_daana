"use client";
import React, { Suspense } from "react";
import PujaServicesContent from "@/components/PujaServicesContent";

export default function BookPujaPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-[#D35400]">Loading...</div>}>
            <PujaServicesContent
                showHero={false}
                showBackButton={true}
                title="Book Ritual Puja"
                className="pb-12"
            />
        </Suspense>
    );
}
