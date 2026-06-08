import React from 'react';
// import './ProcessFlow.css'; // Removed custom CSS


const steps = [
    {
        icon: <img src="/assets/puja1.png" alt="Select Your Puja" width={48} height={48} />,
        title: "Select Your Puja",
        description: "Select the puja or ritual that feels right for you from our curated list of temples and services."
    },
    {
        icon: <img src="/assets/booking.png" alt="Book with Ease" width={48} height={48} />,
        title: "Book with Ease",
        description: "Enter your details and complete your booking through our secure payment process."
    },
    {
        icon: <img src="/assets/bless.png" alt="Receive Divine Blessings" width={48} height={48} />,
        title: "Receive Divine Blessings",
        description: "Our trusted priests perform the puja on your behalf and blessings reach you with confirmation updates."
    }
];

const ProcessFlow = () => {
    return (
        <section id="how-it-works" className="bg-[#FDFAF0] relative pt-16 pb-0">
            <div className="container mx-auto px-6">
                <h2 className="section-title">How It Works</h2>

                <div className="flex flex-wrap justify-between gap-8 mb-16">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="flex-1 min-w-[280px] bg-white px-6 py-10 text-center rounded-lg shadow-sm transition-all duration-300 border-t-[5px] border-[#DAA520] relative hover:-translate-y-2.5 hover:shadow-lg"
                        >
                            <div className="inline-flex p-4 bg-[#FDFAF0] rounded-full text-[#D35400] mb-6">
                                {step.icon}
                            </div>
                            <div className="absolute -top-[15px] left-1/2 -translate-x-1/2 bg-[#C0392B] text-white w-[30px] h-[30px] rounded-full flex items-center justify-center font-bold font-serif">
                                {index + 1}
                            </div>
                            <h3 className="mb-4 text-[#2C3E50] text-xl font-bold">{step.title}</h3>
                            <p className="text-[#566573] text-[0.95rem]">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full h-[60px] bg-[url('/assets/border-pattern.png')] bg-repeat-x bg-[length:auto_100%] block m-0 p-0">
            </div>
        </section>
    );
};

export default ProcessFlow;
