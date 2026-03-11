"use client";

import React from "react";
import dynamic from "next/dynamic";

const SpecialPujasContent = dynamic(() => import("@/components/SpecialPujasContent"), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-[#F5F6F8] pt-12 pb-12">
            <div className="bg-[#FDFAF5] py-12 mb-8">
                <div className="container mx-auto px-4 max-w-7xl flex gap-4 animate-pulse">
                     <div className="h-12 bg-gray-200 rounded-lg w-full max-w-2xl"></div>
                     <div className="h-12 bg-gray-200 rounded-lg w-1/3 max-w-xs"></div>
                </div>
            </div>
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="rounded-3xl p-8 shadow-sm border border-gray-100 h-80 bg-gray-200 animate-pulse relative flex flex-col justify-end">
                             <div className="h-4 bg-gray-300/50 rounded-full w-24 mb-6"></div>
                             <div className="h-7 bg-gray-300/60 rounded-lg w-3/4 mb-4"></div>
                             <div className="h-4 bg-gray-300/50 rounded w-full mb-2"></div>
                             <div className="h-4 bg-gray-300/50 rounded w-5/6 mb-4"></div>
                             <div className="flex justify-between items-center mt-auto">
                                 <div className="w-10 h-10 rounded-full bg-gray-300/60 ml-auto"></div>
                             </div>
                         </div>
                    ))}
                </div>
            </div>
        </div>
    )
});

export default function SpecialPujasPage() {
    return <SpecialPujasContent />;
}
