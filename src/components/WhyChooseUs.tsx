import React from 'react';

const reasons = [
    {
        id: 1,
        title: "Verified Vedic Pandits",
        text: "Every puja is performed by experienced priests with complete devotion and traditional procedures.",
        color: "bg-[#DAA520]" // Gold
    },
    {
        id: 2,
        title: "Live Streaming Option",
        text: "Watch the ritual happening live from anywhere in the world via Zoom/WhatsApp.",
        color: "bg-[#D35400]" // Saffron
    },
    {
        id: 3,
        title: "100% Authentic Rituals",
        text: "Every puja is performed by experienced priests with complete devotion and traditional procedures.",
        color: "bg-[#C0392B]" // Red
    },
    {
        id: 4,
        title: "Secure Payment",
        text: "Pay safely online. No hidden charges. 100% satisfaction guaranteed.",
        color: "bg-[#566573]" // Blue Grey
    }
];

const WhyChooseUs = () => {
    return (
        <section className="w-full py-16 bg-white flex justify-center items-center">
            <div className="container mx-auto px-4 w-full">
                <div className="flex flex-col lg:flex-row min-h-[600px] w-full shadow-2xl rounded-3xl overflow-hidden">
                    {/* Left Side - Dark with Image Background */}
                    <div
                        className="w-full lg:w-1/2 text-[#FDFAF0] flex flex-col justify-center p-10 lg:p-20 relative bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: "url('/assets/whychooseus.jpeg')" }}
                    >
                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-[#D35400]/45 z-0"></div>

                        <div className="relative z-10">
                            <h2 className="text-5xl lg:text-7xl font-serif font-bold leading-tight mb-6">
                                Why <br />
                                Choose <br />
                                Us?
                            </h2>
                        </div>

                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl z-0"></div>
                    </div>

                    {/* Right Side - White with List */}
                    <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center p-8 lg:p-20">
                        <div className="max-w-xl">
                            <div className="space-y-10">
                                {reasons.map((reason) => (
                                    <div key={reason.id} className="relative pl-24 group">
                                        {/* Number Circle */}
                                        <div
                                            className="absolute left-0 top-0 w-16 h-16 bg-white text-black border-4 border-[#D35400] rounded-full flex items-center justify-center text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300 z-10"
                                        >
                                            {reason.id}
                                        </div>

                                        {/* Content */}
                                        <div className="pt-1">
                                            <h3 className="text-xl font-bold text-[#2C3E50] mb-2 group-hover:text-[#D35400] transition-colors">
                                                {reason.title}
                                            </h3>
                                            <p className="text-[#566573] leading-relaxed text-[0.95rem]">
                                                {reason.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
