"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function CompleteProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    // Form Data
    const [formData, setFormData] = useState({
        phone_number: "",
        whatsapp_number: "",
    });
    
    const [isWhatsAppSame, setIsWhatsAppSame] = useState(true);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const submissionData = {
            phone_number: formData.phone_number,
            whatsapp_number: isWhatsAppSame ? formData.phone_number : formData.whatsapp_number
        };

        try {
            const res = await fetch("/api/client/auth/complete-oauth-signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submissionData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to complete profile");
            }

            window.dispatchEvent(new Event("auth-change"));

            // Redirect to dashboard or home
            router.push("/");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFAF0] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
                <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#DAA520] blur-3xl"></div>
                <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-[#D35400] blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8 mx-4">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#DAA520]/20 p-8 relative">

                    <div className="text-center mb-8 mt-2">
                        <div className="mx-auto w-16 h-16 mb-4 relative">
                            <Image
                                src="/assets/logo.png"
                                alt="Manima Logo"
                                width={64}
                                height={64}
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                        <h1 className="font-serif text-3xl text-[#D35400] mb-2 font-bold tracking-wide">Almost There!</h1>
                        <p className="text-[#8B4513] text-sm font-medium">
                            Please provide your phone number to complete your account setup.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 min-w-1.5"></span>
                            <span dangerouslySetInnerHTML={{ __html: error }}></span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#5D4037] mb-1 uppercase tracking-wider text-xs">Phone Number</label>
                            <input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-lg bg-[#FDFAF0] border border-[#E0E0E0] focus:border-[#DAA520] focus:ring-1 focus:ring-[#DAA520] outline-none transition-all placeholder:text-gray-400 text-gray-800"
                                placeholder="+919876543210"
                            />
                        </div>

                        {formData.phone_number && (
                            <div className="pt-2">
                                <label className="flex items-center space-x-2 text-sm text-[#5D4037] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isWhatsAppSame}
                                        onChange={(e) => setIsWhatsAppSame(e.target.checked)}
                                        className="rounded border-[#E0E0E0] text-[#D35400] focus:ring-[#DAA520] h-4 w-4"
                                    />
                                    <span>Is this your WhatsApp number?</span>
                                </label>
                            </div>
                        )}

                        {!isWhatsAppSame && (
                            <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="block text-sm font-semibold text-[#5D4037] mb-1 uppercase tracking-wider text-xs">WhatsApp Number</label>
                                <input
                                    type="tel"
                                    name="whatsapp_number"
                                    value={formData.whatsapp_number}
                                    onChange={handleChange}
                                    required={!isWhatsAppSame}
                                    className="w-full px-4 py-2.5 rounded-lg bg-[#FDFAF0] border border-[#E0E0E0] focus:border-[#DAA520] focus:ring-1 focus:ring-[#DAA520] outline-none transition-all placeholder:text-gray-400 text-gray-800"
                                    placeholder="Enter your WhatsApp number"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !formData.phone_number}
                            className="w-full bg-gradient-to-r from-[#D35400] to-[#E67E22] text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : "Complete Setup"}
                        </button>
                    </form>
                </div>
                
                <p className="text-center text-[#8B4513]/60 text-xs mt-6 font-serif italic">
                    "Serve your ancestors with devotion"
                </p>
            </div>
        </div>
    );
}
