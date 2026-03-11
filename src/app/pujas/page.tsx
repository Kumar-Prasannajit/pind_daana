"use client";

import React from "react";
import dynamic from "next/dynamic";

const PujaServicesContent = dynamic(() => import("@/components/PujaServicesContent"), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-[#F5F6F8] pt-12 pb-12">
            <div className="bg-[#FDFAF5] py-12 mb-8">
                <div className="container mx-auto px-4 max-w-7xl animate-pulse">
                    <div className="h-12 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                </div>
            </div>
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px] animate-pulse">
                            <div className="h-60 bg-gray-200 w-full" />
                            <div className="p-6 flex flex-col flex-1">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
});

export default function PujaServicePage() {
    return <PujaServicesContent />;
}
